"use client";

import { useEffect, useState } from "react";
import { dayOfWeek, istDateKey } from "@/lib/time";
import { cn } from "@/lib/cn";

/** An hours row that highlights itself when it is today (IST), after mount. */
export function TodayRow({ dow, day, hours }: { dow: number; day: string; hours: string }) {
  const [today, setToday] = useState(false);
  useEffect(() => setToday(dayOfWeek(istDateKey()) === dow), [dow]);
  return (
    <tr className={cn("border-t border-ink/10", today && "text-teal-800")}>
      <td className="py-2.5">
        {day}
        {today && <span className="ml-2 label-mono text-crimson">Today</span>}
      </td>
      <td className="py-2.5 text-right font-medium">{hours}</td>
    </tr>
  );
}
