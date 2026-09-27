/**
 * Clinic hours and token slot generation.
 *
 * The no-double-booking guarantee rests on one idea: a given date is divided
 * deterministically into a fixed, numbered list of slots. A slot's index never
 * changes, its token number is `index + 1`, and the database holds a UNIQUE
 * constraint on (doctor, date, slot index). Two patients physically cannot hold
 * the same fifteen minutes, and token numbers always run in clock order.
 *
 * Hours are from the clinic's Google Business Profile and signboard:
 *   Sun–Tue, Thu–Sat   10 am – 2 pm  and  5 pm – 9 pm
 *   Wednesday          10 am – 9 pm (no break)
 */

import {
  addDays,
  dayOfWeek,
  daysBetween,
  formatTime12h,
  istDateKey,
  istMinutesOfDay,
  now,
  toMinutes,
  toTimeKey,
  type DateKey,
  type TimeKey,
} from "./time";

/** One doctor; the id ties tokens to her in the database. */
export const DOCTOR_ID = "dr-nikita-soni";

/** Hours are published on Google and the signboard, so they are confirmed. */
export const SCHEDULE_CONFIRMED = true;

export const SLOT_MINUTES = 15;

export type Session = {
  id: string;
  label: string;
  start: TimeKey;
  end: TimeKey;
  slotMinutes: number;
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
};

const SPLIT_DAYS = [0, 1, 2, 4, 5, 6];
const WEDNESDAY = [3];

export const BOOKING_WINDOW_DAYS = 14;
export const MIN_LEAD_MINUTES = 20;

export const sessions: Session[] = [
  { id: "morning", label: "Morning", start: "10:00", end: "14:00", slotMinutes: SLOT_MINUTES, days: SPLIT_DAYS },
  { id: "evening", label: "Evening", start: "17:00", end: "21:00", slotMinutes: SLOT_MINUTES, days: SPLIT_DAYS },
  { id: "day", label: "All day", start: "10:00", end: "21:00", slotMinutes: SLOT_MINUTES, days: WEDNESDAY },
];

/** Dates the clinic is fully closed. `YYYY-MM-DD`. */
export const blackoutDates: DateKey[] = [];

/**
 * Dates when Google flags that hours might differ (public holidays). Booking
 * stays open, but the date picker and confirmation carry the note.
 */
export const specialDateNotes: Record<DateKey, string> = {
  "2026-10-02": "Gandhi Jayanti — hours might differ. Please call before visiting.",
};

/** Weekly hours for display, Sunday first. */
export const weeklyHours: Array<{ day: string; short: string; dow: number; hours: string }> = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
].map((day, dow) => ({
  day,
  short: day.slice(0, 3),
  dow,
  hours: dow === 3 ? "10 am – 9 pm" : "10 am – 2 pm · 5 – 9 pm",
}));

/* ------------------------------------------------------------------ */

export type Slot = {
  index: number;
  token: number;
  sessionId: string;
  sessionLabel: string;
  start: TimeKey;
  end: TimeKey;
  startLabel: string;
  endLabel: string;
};

export function generateSlots(date: DateKey): Slot[] {
  if (blackoutDates.includes(date)) return [];
  const dow = dayOfWeek(date);
  const raw: Omit<Slot, "index" | "token">[] = [];

  for (const session of sessions) {
    if (!session.days.includes(dow)) continue;
    const startM = toMinutes(session.start);
    const endM = toMinutes(session.end);
    for (let m = startM; m + session.slotMinutes <= endM; m += session.slotMinutes) {
      raw.push({
        sessionId: session.id,
        sessionLabel: m < 14 * 60 ? "Morning" : m < 17 * 60 ? "Afternoon" : "Evening",
        start: toTimeKey(m),
        end: toTimeKey(m + session.slotMinutes),
        startLabel: formatTime12h(toTimeKey(m)),
        endLabel: formatTime12h(toTimeKey(m + session.slotMinutes)),
      });
    }
  }

  raw.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  return raw.map((slot, index) => ({ ...slot, index, token: index + 1 }));
}

export function slotAt(date: DateKey, index: number): Slot | undefined {
  return generateSlots(date).find((s) => s.index === index);
}

export function isBookableDate(date: DateKey, clock?: Date): boolean {
  const offset = daysBetween(istDateKey(now(clock)), date);
  return offset >= 0 && offset <= BOOKING_WINDOW_DAYS;
}

export function isSlotStillOpen(date: DateKey, slot: Pick<Slot, "start">, clock?: Date): boolean {
  const current = now(clock);
  const today = istDateKey(current);
  if (date > today) return true;
  if (date < today) return false;
  return toMinutes(slot.start) >= istMinutesOfDay(current) + MIN_LEAD_MINUTES;
}

export function upcomingOpdDates(count = BOOKING_WINDOW_DAYS, clock?: Date): DateKey[] {
  const today = istDateKey(now(clock));
  const dates: DateKey[] = [];
  for (let i = 0; i <= BOOKING_WINDOW_DAYS && dates.length < count; i++) {
    const date = addDays(today, i);
    const slots = generateSlots(date);
    if (!slots.length) continue;
    if (i === 0 && !slots.some((s) => isSlotStillOpen(date, s, clock))) continue;
    dates.push(date);
  }
  return dates;
}

/** Is the clinic open right now (IST)? Used for the live "open now" line. */
export function openNow(clock?: Date): { open: boolean; label: string } {
  const current = now(clock);
  const date = istDateKey(current);
  const minutes = istMinutesOfDay(current);
  const todays = sessions.filter((s) => s.days.includes(dayOfWeek(date)) && !blackoutDates.includes(date));
  for (const s of todays) {
    if (minutes >= toMinutes(s.start) && minutes < toMinutes(s.end)) {
      return { open: true, label: `Open now · until ${formatTime12h(s.end)}` };
    }
  }
  const next = todays.find((s) => minutes < toMinutes(s.start));
  if (next) return { open: false, label: `Opens at ${formatTime12h(next.start)} today` };
  return { open: false, label: "Opens tomorrow at 10:00 AM" };
}
