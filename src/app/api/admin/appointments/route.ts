/**
 * Front-desk token register.
 *
 * GET   /api/admin/appointments?date=YYYY-MM-DD  — the day's tokens + WhatsApp outbox
 * PATCH /api/admin/appointments                  — mark seen / no-show / cancel
 * POST  /api/admin/appointments                  — issue a token for a walk-in or phone call
 */

import { after } from "next/server";
import { z } from "zod";
import { authFailureResponse, checkAdminAuth } from "@/lib/admin-auth";
import { requireStorage } from "@/lib/api-guard";
import {
  bookAppointment,
  cancelAppointment,
  dayStats,
  formatPhoneDisplay,
  listAppointments,
  queuePosition,
  setAppointmentStatus,
} from "@/lib/booking";
import { storageStatus } from "@/lib/db";
import { notifyBooked, notifyCancelled } from "@/lib/notify";
import { istDateKey, isValidDateKey } from "@/lib/time";
import { doctorWhatsAppNumber, isWhatsAppConfigured, recentOutbox } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = checkAdminAuth(request);
  if (!auth.ok) return authFailureResponse(auth);

  const date = new URL(request.url).searchParams.get("date") ?? istDateKey();
  if (!isValidDateKey(date)) {
    return Response.json({ ok: false, error: "Invalid date." }, { status: 400 });
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const [all, stats, outbox, storage] = await Promise.all([
    listAppointments({ date }),
    dayStats(date),
    recentOutbox(40),
    storageStatus(),
  ]);

  return Response.json(
    {
      ok: true,
      date,
      stats,
      tokens: all.map((a) => ({
        reference: a.reference,
        tokenNumber: a.tokenNumber,
        slotStart: a.slotStart,
        slotEnd: a.slotEnd,
        patientName: a.patientName,
        patientPhone: formatPhoneDisplay(a.patientPhone),
        patientAge: a.patientAge,
        patientGender: a.patientGender,
        reason: a.reason,
        channel: a.channel,
        status: a.status,
      })),
      outbox,
      health: {
        whatsapp: isWhatsAppConfigured() ? "live" : "test-mode",
        doctorNumber: formatPhoneDisplay(doctorWhatsAppNumber()),
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

  if (status === "cancelled") {
    const result = await cancelAppointment(reference, null);
    if (!result.ok) return Response.json({ ok: false, error: result.message }, { status: 404 });
    const cancelled = result.appointment;
    after(() => notifyCancelled(cancelled, "clinic").then(() => undefined));
    return Response.json({ ok: true, appointment: cancelled });
  }

  const updated = await setAppointmentStatus(reference, status);
  if (!updated) return Response.json({ ok: false, error: "Booking not found." }, { status: 404 });
  return Response.json({ ok: true, appointment: updated });
}

const walkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotIndex: z.coerce.number().int().min(0).optional(),
  patientName: z.string().trim().min(2).max(80),
  patientPhone: z.string().trim().min(6),
  reason: z.string().trim().max(400).nullish(),
  channel: z.enum(["walk_in", "phone"]).default("walk_in"),
  notify: z.boolean().default(true),
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

  if (input.notify) {
    const appointment = result.appointment;
    const ahead = await queuePosition(appointment);
    after(() => notifyBooked(appointment, ahead).then(() => undefined));
  }

  return Response.json({ ok: true, appointment: result.appointment }, { status: 201 });
}
