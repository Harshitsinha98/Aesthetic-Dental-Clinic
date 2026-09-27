/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * The slot grid for a date plus the list of bookable dates, so the booking
 * form renders its day picker and time grid from one round trip.
 */

import { getAvailability } from "@/lib/booking";
import { requireStorage } from "@/lib/api-guard";
import { specialDateNotes, upcomingOpdDates } from "@/lib/schedule";
import { dayOfWeek, dayNameShort, formatDate, istDateKey, isValidDateKey, relativeDayLabel } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const requested = params.get("date");

  if (requested && !isValidDateKey(requested)) {
    return Response.json({ ok: false, error: "Invalid date. Expected YYYY-MM-DD." }, { status: 400 });
  }

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const upcoming = upcomingOpdDates();
  const date = requested ?? upcoming[0] ?? istDateKey();

  const [availability, dates] = await Promise.all([
    getAvailability(date),
    Promise.all(
      upcoming.map(async (d) => {
        const day = await getAvailability(d);
        return {
          date: d,
          free: day.availableCount,
          total: day.totalSlots,
          weekday: dayNameShort(dayOfWeek(d)),
          dayNumber: Number(d.slice(8, 10)),
          month: formatDate(d).split(" ")[1],
          relative: relativeDayLabel(d),
          label: `${relativeDayLabel(d)}, ${formatDate(d)}`,
          note: specialDateNotes[d] ?? null,
        };
      }),
    ),
  ]);

  return Response.json(
    { ok: true, availability, dates, note: specialDateNotes[date] ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
