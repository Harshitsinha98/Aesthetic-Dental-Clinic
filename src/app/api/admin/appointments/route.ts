/**
 * Front-desk token register (reception + doctor).
 *
 * GET   /api/admin/appointments?date=YYYY-MM-DD  — the day's tokens, in clock order
 * GET   /api/admin/appointments?q=…              — find a booking on any date by
 *                                                  code, mobile number or name
 * PATCH /api/admin/appointments                  — mark seen / no-show / undo / cancel
 * POST  /api/admin/appointments                  — issue a token for a walk-in or phone call
 */

import { z } from "zod";
import { authFailureResponse, checkAdminAuth } from "@/lib/admin-auth";
import { requireStorage } from "@/lib/api-guard";
import {
  bookAppointment,
  cancelAppointment,
  dayStats,
  formatPhoneDisplay,
  listAppointments,
  searchAppointments,
  setAppointmentStatus,
  type Appointment,
} from "@/lib/booking";
import { storageStatus } from "@/lib/db";
import { istDateKey, isValidDateKey } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDto(a: Appointment) {
  return {
    reference: a.reference,
    tokenNumber: a.tokenNumber,
    date: a.date,
    slotStart: a.slotStart,
    slotEnd: a.slotEnd,
    patientName: a.patientName,
    patientPhone: formatPhoneDisplay(a.patientPhone),
    patientAge: a.patientAge,
    patientGender: a.patientGender,
    reason: a.reason,
    channel: a.channel,
    status: a.status,
    createdAt: a.createdAt,
  };
}

export async function GET(request: Request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return authFailureResponse(auth);

  const params = new URL(request.url).searchParams;

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const q = params.get("q");
  if (q !== null) {
    const results = await searchAppointments(q);
    return Response.json({ ok: true, results: results.map(toDto) }, { headers: { "Cache-Control": "no-store" } });
  }

  const date = params.get("date") ?? istDateKey();
  if (!isValidDateKey(date)) {
    return Response.json({ ok: false, error: "Invalid date." }, { status: 400 });
  }

  const [all, stats, storage] = await Promise.all([listAppointments({ date }), dayStats(date), storageStatus()]);

  return Response.json(
    {
      ok: true,
      date,
      today: istDateKey(),
      stats,
      tokens: all.map(toDto),
      health: {
        storage: storage.ready
          ? { backend: storage.backend, ephemeral: storage.ephemeral }
          : { backend: "unavailable", ephemeral: false },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

const patchSchema = z.object({
  reference: z.string().trim().min(4),
  status: z.enum(["confirmed", "completed", "no_show", "cancelled"]),
});

export async function PATCH(request: Request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return authFailureResponse(auth);

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Provide a reference and a valid status." }, { status: 400 });
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const { reference, status } = parsed.data;

  // Cancelling goes through the engine so the slot is released back to the pool.
  if (status === "cancelled") {
    const result = await cancelAppointment(reference, null);
    if (!result.ok) return Response.json({ ok: false, error: result.message }, { status: 404 });
    return Response.json({ ok: true, appointment: toDto(result.appointment) });
  }

  const updated = await setAppointmentStatus(reference, status);
  if (!updated) return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  return Response.json({ ok: true, appointment: toDto(updated) });
}

const walkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotIndex: z.coerce.number().int().min(0).optional(),
  patientName: z.string().trim().min(2).max(80),
  patientPhone: z.string().trim().min(6),
  reason: z.string().trim().max(400).nullish(),
  channel: z.enum(["walk_in", "phone"]).default("walk_in"),
});

export async function POST(request: Request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return authFailureResponse(auth);

  const parsed = walkInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." }, { status: 400 });
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const input = parsed.data;
  const result = await bookAppointment({
    date: input.date,
    slotIndex: input.slotIndex,
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    reason: input.reason ?? null,
    channel: input.channel,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: result.message, reason: result.reason }, { status: 409 });
  }
  return Response.json({ ok: true, appointment: toDto(result.appointment) }, { status: 201 });
}
