/**
 * Ways for a patient to keep their token — all free, no SMS/WhatsApp account:
 *
 *   • saved automatically on the phone they booked from (localStorage), shown
 *     under "My token" without typing anything
 *   • downloaded as an image (goes to the phone's gallery / downloads)
 *   • added to the calendar (.ics for iPhone/Outlook, or Google Calendar)
 *   • shared through the phone's own share sheet — WhatsApp, SMS, email, to
 *     themselves or a family member — or an SMS draft on phones without it
 *   • printed
 *
 * Client-only module.
 */

import { clinic, doctor } from "./clinic";

export type SavedToken = {
  reference: string;
  tokenNumber: number;
  date: string; // YYYY-MM-DD (IST)
  slotStart: string; // HH:MM (IST)
  slotEnd?: string;
  patientName: string;
  phone: string;
  savedAt: string;
};

const KEY = "aad.tokens.v1";
const MAX = 20;

export function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function dateLabel(date: string, style: "short" | "long" = "short") {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

/* ------------------------------ device storage ------------------------------ */

export function listSaved(): SavedToken[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedToken[];
    // Drop anything more than 30 days old; soonest first.
    const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
    return raw.filter((t) => t.date >= cutoff).sort((a, b) => (a.date + a.slotStart).localeCompare(b.date + b.slotStart));
  } catch {
    return [];
  }
}

export function saveToken(token: Omit<SavedToken, "savedAt">) {
  try {
    const rest = listSaved().filter((t) => t.reference !== token.reference);
    const next = [...rest, { ...token, savedAt: new Date().toISOString() }].slice(-MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Private mode or storage full — the other save options still work. */
  }
}

export function removeToken(reference: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(listSaved().filter((t) => t.reference !== reference)));
  } catch {}
}

/* --------------------------------- text ----------------------------------- */

export function tokenText(t: Pick<SavedToken, "tokenNumber" | "date" | "slotStart" | "patientName" | "reference">) {
  return [
    `${clinic.name} — Token #${t.tokenNumber}`,
    `${dateLabel(t.date, "long")} · ${to12h(t.slotStart)}`,
    `Patient: ${t.patientName}`,
    `Booking code: ${t.reference}`,
    `${doctor.name} · ${clinic.addressLines.join(", ")}`,
    `Please arrive 10 minutes early. Call ${clinic.phoneDisplay}`,
  ].join("\n");
}

/**
 * A wa.me link that opens WhatsApp with a message to the clinic (answered by
 * reception / Dr. Nikita), pre-filled with the token details. The patient taps
 * Send — nothing is sent automatically, and it needs no clinic setup.
 */
export function clinicWhatsAppHref(t: Pick<SavedToken, "tokenNumber" | "date" | "slotStart" | "patientName" | "reference">) {
  const message = [
    `Hello ${clinic.name}, I have booked a token online:`,
    ``,
    `Token #${t.tokenNumber}`,
    `${dateLabel(t.date, "long")} · ${to12h(t.slotStart)}`,
    `Patient: ${t.patientName}`,
    `Booking code: ${t.reference}`,
    ``,
    `Please confirm my appointment. Thank you!`,
  ].join("\n");
  return `https://wa.me/${clinic.phone}?text=${encodeURIComponent(message)}`;
}

/* ------------------------------- calendar --------------------------------- */

/** IST wall-clock → UTC basic format (YYYYMMDDTHHMMSSZ). IST has no DST. */
function utcStamp(date: string, time: string, addMinutes = 0) {
  const ms = Date.parse(`${date}T${time}:00+05:30`) + addMinutes * 60_000;
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function downloadIcs(t: SavedToken) {
  const end = t.slotEnd ?? t.slotStart;
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Align Aesthetic Dental Hub//Token//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${t.reference}@align-aesthetic`,
    `DTSTAMP:${utcStamp(new Date().toISOString().slice(0, 10), "00:00")}`,
    `DTSTART:${utcStamp(t.date, t.slotStart)}`,
    `DTEND:${utcStamp(t.date, end, t.slotEnd ? 0 : 15)}`,
    `SUMMARY:${esc(`Dental appointment — Token #${t.tokenNumber}`)}`,
    `LOCATION:${esc(`${clinic.name}, ${clinic.addressLines.join(", ")}`)}`,
    `DESCRIPTION:${esc(tokenText(t))}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Dental appointment in 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  triggerDownload(new Blob([ics], { type: "text/calendar;charset=utf-8" }), `align-token-${t.tokenNumber}.ics`);
}

export function googleCalendarHref(t: SavedToken) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Dental appointment — Token #${t.tokenNumber}`,
    dates: `${utcStamp(t.date, t.slotStart)}/${utcStamp(t.date, t.slotEnd ?? t.slotStart, t.slotEnd ? 0 : 15)}`,
    details: tokenText(t),
    location: `${clinic.name}, ${clinic.addressLines.join(", ")}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/* ------------------------------- image ------------------------------------ */

function cssFont(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

/** Draws the token slip on a canvas and returns a PNG blob. */
export async function tokenImage(t: SavedToken): Promise<Blob> {
  await document.fonts?.ready;
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const serif = cssFont("--font-fraunces", "Georgia, serif");
  const sans = cssFont("--font-hanken", "system-ui, sans-serif");
  const mono = cssFont("--font-plex-mono", "ui-monospace, monospace");

  g.fillStyle = "#fbfaf7";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffffff";
  g.fillRect(60, 60, W - 120, H - 120);
  g.fillStyle = "#072226";
  g.fillRect(60, 60, W - 120, 150);

  g.fillStyle = "#fbfaf7";
  g.font = `700 54px ${sans}`;
  g.fillText("ALiGN", 110, 150);
  g.fillStyle = "#e8566e";
  g.font = `600 22px ${sans}`;
  g.fillText("AESTHETIC DENTAL HUB", 300, 148);

  const label = (text: string, y: number) => {
    g.fillStyle = "#6b7677";
    g.font = `500 24px ${mono}`;
    g.fillText(text.toUpperCase(), 110, y);
  };

  label("Token no.", 320);
  g.fillStyle = "#133f44";
  g.font = `400 300px ${serif}`;
  g.fillText(String(t.tokenNumber).padStart(2, "0"), 96, 590);

  label("Date", 700);
  g.fillStyle = "#0f1a1b";
  g.font = `600 44px ${sans}`;
  g.fillText(dateLabel(t.date, "long").replace(/,? \d{4}$/, ""), 110, 760);
  g.fillText(to12h(t.slotStart), 110, 900);
  label("Report by (arrive 10 min early)", 840);

  label("Patient", 990);
  g.fillStyle = "#0f1a1b";
  g.font = `600 40px ${sans}`;
  g.fillText(t.patientName.slice(0, 32), 110, 1045);

  // perforation
  g.fillStyle = "#fbfaf7";
  for (let x = 60; x <= W - 60; x += 28) {
    g.beginPath();
    g.arc(x, 1110, 7, 0, Math.PI * 2);
    g.fill();
  }

  g.fillStyle = "#0f1a1b";
  g.font = `500 40px ${mono}`;
  g.fillText(t.reference, 110, 1190);
  g.fillStyle = "#6b7677";
  g.font = `400 24px ${sans}`;
  g.fillText(`${doctor.name} · ${clinic.addressLines[0]}, ${clinic.city}`, 110, 1240);
  g.fillText(clinic.phoneDisplay, 110, 1275);

  g.fillStyle = "#c8243f";
  g.beginPath();
  const sx = W - 150;
  const sy = 330;
  g.moveTo(sx, sy - 34);
  g.lineTo(sx + 10, sy - 10);
  g.lineTo(sx + 34, sy);
  g.lineTo(sx + 10, sy + 10);
  g.lineTo(sx, sy + 34);
  g.lineTo(sx - 10, sy + 10);
  g.lineTo(sx - 34, sy);
  g.lineTo(sx - 10, sy - 10);
  g.closePath();
  g.fill();

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
}

export async function downloadImage(t: SavedToken) {
  triggerDownload(await tokenImage(t), `align-token-${t.tokenNumber}-${t.date}.png`);
}

/* -------------------------------- share ----------------------------------- */

/** Native share sheet (with the image where supported); SMS draft otherwise. */
export async function shareToken(t: SavedToken): Promise<"shared" | "sms" | "cancelled"> {
  const text = tokenText(t);
  try {
    if (navigator.share) {
      const file = new File([await tokenImage(t)], `align-token-${t.tokenNumber}.png`, { type: "image/png" });
      const withFile = navigator.canShare?.({ files: [file] });
      await navigator.share(withFile ? { title: "My dental token", text, files: [file] } : { title: "My dental token", text });
      return "shared";
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") return "cancelled";
  }
  window.location.href = smsHref(t);
  return "sms";
}

/** Opens the phone's own Messages app with the token pre-filled (free). */
export function smsHref(t: SavedToken, to = "") {
  const body = encodeURIComponent(tokenText(t));
  // iOS reads "&body", Android "?body"; "?&body=" works on both.
  return `sms:${to}?&body=${body}`;
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
