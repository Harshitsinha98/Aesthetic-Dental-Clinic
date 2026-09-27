/**
 * Align Aesthetic logo — a vector redraw of the clinic signboard mark:
 * a tooth outline carrying a braces wire, a face profile forming its right
 * edge, and the crimson four-point star. Replace with the designer's master
 * file when available; the component API stays the same.
 */

import { cn } from "@/lib/cn";

type MarkProps = {
  className?: string;
  /** "brand" = teal + crimson; "light" = porcelain + crimson for dark backgrounds. */
  tone?: "brand" | "light";
  animated?: boolean;
  title?: string;
};

export function LogoMark({ className, tone = "brand", animated = false, title }: MarkProps) {
  const tooth = tone === "light" ? "#fbfaf7" : "url(#aad-tooth)";
  const wire = tone === "light" ? "#b0d6d1" : "#2f7d7a";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id="aad-tooth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3237" />
          <stop offset="1" stopColor="#2f7d7a" />
        </linearGradient>
      </defs>
      {/* Tooth: crown and roots, open on the right where the profile sits. */}
      <path
        d="M40 13C36 9 29 8.6 24.5 11 18.5 8 10.5 9.6 8.2 17.6 6.2 25.4 10 31.6 12 39.4 14 47.6 15 56 19.2 56c4 0 4-9.6 8.8-11.6 3.4-1.4 5.4 1.8 6.4 5.8.9 3.6 1.6 5.8 3.6 5"
        fill="none"
        stroke={tooth}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Face profile — forehead, nose, lips, chin. */}
      <path
        d="M40 13c4.8 1 7.8 4.6 8 8.8l3 5-2.6 1.2c1 1.8.1 3-1 3.4 1.1 1.6.1 3.4-1.9 3.8-.6 2.8-2.6 4.6-5.5 4.8V48"
        fill="none"
        stroke="#c8243f"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Braces wire and brackets. */}
      <path d="M40 13c3.6 8.4 3.4 20.6-2.2 31" fill="none" stroke="#c8243f" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d="M10.5 27.5Q26 33.5 41 28.2" fill="none" stroke={wire} strokeWidth="1.4" strokeLinecap="round" />
      {[15, 21, 27, 33, 38.5].map((x, i) => {
        const y = 29.2 + Math.sin((i / 4) * Math.PI) * 1.9 - i * 0.2;
        return <rect key={x} x={x - 1.7} y={y - 1.7} width="3.4" height="3.4" rx="0.7" fill={wire} />;
      })}
      {/* The star. */}
      <path
        className={animated ? "star-pulse" : undefined}
        d="M20.5 15.2l1 2.9 2.9 1-2.9 1-1 2.9-1-2.9-2.9-1 2.9-1z"
        fill="#c8243f"
      />
    </svg>
  );
}

/** "ALiGN" wordmark with the star over the i, as on the signboard. */
export function Wordmark({ className, tone = "brand" }: { className?: string; tone?: "brand" | "light" }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "relative font-sans text-[1.35rem] font-bold tracking-[0.18em]",
          tone === "light" ? "text-porcelain" : "text-teal-800",
        )}
      >
        AL
        <span className="relative">
          i
          <svg viewBox="0 0 10 10" aria-hidden className="absolute -top-[0.28em] left-1/2 size-[0.42em] -translate-x-1/2">
            <path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" fill="#c8243f" />
          </svg>
        </span>
        GN
      </span>
      <span className="mt-1 font-sans text-[0.5rem] font-semibold tracking-[0.28em] text-crimson">
        AESTHETIC DENTAL HUB
      </span>
    </span>
  );
}

export function Logo({ className, tone = "brand" }: { className?: string; tone?: "brand" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-10" tone={tone} animated />
      <Wordmark tone={tone} />
      <span className="sr-only">Align Aesthetic Dental Hub</span>
    </span>
  );
}
