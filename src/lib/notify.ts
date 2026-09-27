/**
 * Booking notifications: what the patient and the doctor receive on WhatsApp.
 *
 * Message bodies are written so they read well as plain text AND map one-to-one
 * onto the approved templates documented in README.md (variables in the same
 * order), so switching from test mode to live templates changes nothing here.
 */

import type { Appointment } from "./booking";
import { clinic, doctor, mapsHref } from "./clinic";
import { formatPhoneDisplay } from "./patient";
import { specialDateNotes } from "./schedule";
import { formatDate, formatDayName, formatTime12h } from "./time";
import { doctorWhatsAppNumber, sendWhatsApp, templateFromEnv, type SendResult } from "./whatsapp";

function when(a: Appointment) {
  return `${formatDayName(a.date)}, ${formatDate(a.date)}`;
}

export type NotifyOutcome = { patient: SendResult; doctor: SendResult };

export async function notifyBooked(a: Appointment, queueAhead: number): Promise<NotifyOutcome> {
  const date = when(a);
  const time = formatTime12h(a.slotStart);
  const note = specialDateNotes[a.date];

  const patientText = [
    `✅ Token confirmed — ${clinic.name}`,
    ``,
    `Token: #${a.tokenNumber}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Patient: ${a.patientName}`,
    `Booking code: ${a.reference}`,
    ``,
    `Please arrive 10 minutes early. ${queueAhead ? `${queueAhead} patient(s) are booked before you.` : "You are first in the queue."}`,
    note ? `Note: ${note}` : null,
    ``,
    `${doctor.name} · ${clinic.addressLines.join(", ")}`,
    `Map: ${mapsHref()}`,
    `To cancel, visit the website → My Token, or call ${clinic.phoneDisplay}.`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const doctorText = [
    `🦷 New booking — Token #${a.tokenNumber}`,
    ``,
    `${date} · ${time}`,
    `Patient: ${a.patientName}${a.patientAge ? `, ${a.patientAge}` : ""}${a.patientGender ? ` (${a.patientGender})` : ""}`,
    `Mobile: ${formatPhoneDisplay(a.patientPhone)}`,
    `Reason: ${a.reason || "Not given"}`,
    `Code: ${a.reference} · via ${a.channel === "web" ? "website" : a.channel}`,
  ].join("\n");

  const [patient, doc] = await Promise.all([
    sendWhatsApp({
      to: a.patientPhone,
      audience: "patient",
      reference: a.reference,
      text: patientText,
      template: templateFromEnv("WHATSAPP_TEMPLATE_PATIENT_BOOKED", [
        a.patientName,
        `#${a.tokenNumber}`,
        date,
        time,
        a.reference,
      ]),
    }),
    sendWhatsApp({
      to: doctorWhatsAppNumber(),
      audience: "doctor",
      reference: a.reference,
      text: doctorText,
      template: templateFromEnv("WHATSAPP_TEMPLATE_DOCTOR_BOOKED", [
        `#${a.tokenNumber}`,
        `${date}, ${time}`,
        a.patientName,
        formatPhoneDisplay(a.patientPhone),
        a.reason || "Not given",
      ]),
    }),
  ]);

  return { patient, doctor: doc };
}

export async function notifyCancelled(a: Appointment, by: "patient" | "clinic"): Promise<NotifyOutcome> {
  const date = when(a);
  const time = formatTime12h(a.slotStart);

  const [patient, doc] = await Promise.all([
    sendWhatsApp({
      to: a.patientPhone,
      audience: "patient",
      reference: a.reference,
      text: `Your token #${a.tokenNumber} for ${date} at ${time} at ${clinic.name} has been cancelled${by === "clinic" ? " by the clinic" : ""}. Book again any time on our website or call ${clinic.phoneDisplay}.`,
      template: templateFromEnv("WHATSAPP_TEMPLATE_PATIENT_CANCELLED", [`#${a.tokenNumber}`, date, time]),
    }),
    sendWhatsApp({
      to: doctorWhatsAppNumber(),
      audience: "doctor",
      reference: a.reference,
      text: `❌ Cancelled — Token #${a.tokenNumber}\n${date} · ${time}\n${a.patientName} · ${formatPhoneDisplay(a.patientPhone)}\nCancelled by ${by}.`,
      template: templateFromEnv("WHATSAPP_TEMPLATE_DOCTOR_CANCELLED", [
        `#${a.tokenNumber}`,
        `${date}, ${time}`,
        a.patientName,
        by,
      ]),
    }),
  ]);

  return { patient, doctor: doc };
}
