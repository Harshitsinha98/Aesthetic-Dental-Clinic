/**
 * GET /api/queue — today's queue for the waiting-room screen.
 *
 * Public on purpose (the screen hangs in the waiting room), so it returns
 * token numbers and times only: no names, phone numbers or reasons.
 */

import { requireStorage } from "@/lib/api-guard";
import { queueSnapshot } from "@/lib/booking";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { formatDate, formatDayName, istDateKey } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request, "queue"), 60, 60_000);
  if (!limit.allowed) return tooManyRequests(limit, "Too many requests.");

  const unavailable = await requireStorage();
  if (unavailable) return unavailable.response;

  const date = istDateKey();
  const snapshot = await queueSnapshot(date);
  return Response.json(
    { ok: true, ...snapshot, dateLabel: `${formatDayName(date)}, ${formatDate(date)}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}
