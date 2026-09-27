/**
 * POST /api/appointments                               — book a token
 * GET  /api/appointments?reference=AAD-XXXXXX&phone=…  — look one up
 *
 * The booking engine holds the no-overlap guarantee; this route translates HTTP
 * into an engine call, rate-limits abuse, and fires the WhatsApp notifications
 * to the patient and the doctor. A notification failure never undoes a booking.
 */

import { after } from "next/server";
import { z } from "zod";
import {
  bookAppointment,
  getAppointmentByReference,
  normalisePhone,
  queuePosition,
  type BookingFailureReason,
} from "@/lib/booking";
import { requireStorage } from "@/lib/api-guard";
import { notifyBooked } from "@/lib/notify";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { specialDateNotes } from "@/lib/schedule";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  slotIndex: z.coerce.number().int().min(0).optional(),
  patientName: z.string().trim().min(2, "Please enter the patient's full name").max(80),
  patientPhone: z.string().trim().min(6, "Please enter a mobile number"),
  patientAge: z.coerce.number().int().min(0).max(120).nullish(),
  patientGender: z.enum(["male", "female", "other"]).nullish(),
  reason: z.string().trim().max(400).nullish(),
  /** Honeypot — real browsers leave it empty. */
  website: z.string().max(0).optional(),
});

const STATUS_FOR: Record<BookingFailureReason, number> = {
  invalid_date: 400,
  invalid_patient: 400,
  unknown_slot: 400,
  date_out_of_window: 400,
  no_opd_that_day: 409,
  slot_passed: 409,
  slot_taken: 409,
  day_full: 409,
  duplicate_booking: 409,
};

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "book"), 10, 10 * 60_000);
  if (!limit.allowed) {
    return tooManyRequests(limit, "Too many booking attempts. Please wait a few minutes or call the clinic.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Please check the form.",
        field: parsed.error.issues[0]?.path?.[0],
      },
      { status: 400 },
    );
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const input = parsed.data;
  const result = await bookAppointment({
    date: input.date,
    slotIndex: input.slotIndex,
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    patientAge: input.patientAge ?? null,
    patientGender: input.patientGender ?? null,
    reason: input.reason ?? null,
    channel: "web",
  });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.message, reason: result.reason, detail: result.detail },
      { status: STATUS_FOR[result.reason] ?? 400 },
    );
  }

  const { appointment } = result;
  const queueAhead = await queuePosition(appointment);

  // Deliver the WhatsApp messages after the response is sent, so the patient
  // sees their token immediately even if Meta's API is slow.
  after(async () => {
    const outcome = await notifyBooked(appointment, queueAhead);
    if (!outcome.patient.ok || !outcome.doctor.ok) {
      console.error("[booking] WhatsApp delivery issue", appointment.reference, outcome);
    }
  });

  return Response.json(
    {
      ok: true,
      appointment: {
        reference: appointment.reference,
        tokenNumber: appointment.tokenNumber,
        date: appointment.date,
        slotStart: appointment.slotStart,
        slotEnd: appointment.slotEnd,
        patientName: appointment.patientName,
      },
      queueAhead,
      note: specialDateNotes[appointment.date] ?? null,
      whatsapp: isWhatsAppConfigured() ? "sent" : "test-mode",
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request, "lookup"), 30, 10 * 60_000);
  if (!limit.allowed) return tooManyRequests(limit, "Too many attempts. Please try again shortly.");

  const params = new URL(request.url).searchParams;
  const reference = params.get("reference")?.trim().toUpperCase() ?? "";
  const phone = params.get("phone") ?? "";

  if (!reference) {
    return Response.json({ ok: false, error: "A booking code is required." }, { status: 400 });
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const appointment = await getAppointmentByReference(reference);

  /* The matching phone is required: a short code is guessable, and a booking
     carries a patient's name and health context. */
  if (!appointment || normalisePhone(phone) !== appointment.patientPhone) {
    return Response.json({ ok: false, error: "No booking found for that code and mobile number." }, { status: 404 });
  }

  return Response.json({
    ok: true,
    appointment: {
      reference: appointment.reference,
      tokenNumber: appointment.tokenNumber,
      date: appointment.date,
      slotStart: appointment.slotStart,
      slotEnd: appointment.slotEnd,
      patientName: appointment.patientName,
      status: appointment.status,
    },
    queueAhead: appointment.status === "confirmed" ? await queuePosition(appointment) : 0,
  });
}
