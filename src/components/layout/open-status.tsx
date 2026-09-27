"use client";

import { useEffect, useState } from "react";
import { openNow } from "@/lib/schedule";
import { cn } from "@/lib/cn";

/**
 * Live "open now" line. Computed after mount so the server render (which has
 * no idea what time the visitor is looking) never mismatches on hydration.
 */
export function OpenStatus({ className }: { className?: string }) {
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => setState(openNow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-live="polite">
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === null ? "bg-current opacity-40" : state.open ? "bg-teal-400" : "bg-crimson",
        )}
      />
      {state?.label ?? "Open all 7 days"}
    </span>
  );
}
