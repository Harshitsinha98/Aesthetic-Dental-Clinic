"use client";

/**
 * Review carousel. Native horizontal scroll with snap points (so swipe,
 * trackpad and keyboard all just work), plus arrow buttons, a position
 * counter and a gentle autoplay that pauses whenever the visitor hovers,
 * touches, focuses inside it, or the carousel is off-screen.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Review } from "@/lib/reviews";
import { cn } from "@/lib/cn";

const AUTOPLAY_MS = 5500;

export function Stars({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={cn("relative inline-block", size)}>
            <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7z" fill="currentColor" opacity="0.2" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" className={cn("h-full", size)} aria-hidden>
                <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7z" fill="currentColor" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;
function relative(iso: string) {
  const days = Math.round((Date.parse(iso) - Date.now()) / 86_400_000);
  if (!rtf) return "";
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(days) < 45) return rtf.format(Math.round(days / 7), "week");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

function When({ review }: { review: Review }) {
  const [label, setLabel] = useState(review.relativeTime ?? "");
  // Computed after mount: a relative date rendered on the server would be
  // stale by the time the cached page is served.
  useEffect(() => {
    if (review.time) setLabel(relative(review.time));
  }, [review.time]);
  return label ? <>{label}</> : null;
}

function Avatar({ review }: { review: Review }) {
  const [broken, setBroken] = useState(false);
  if (review.authorPhoto && !broken) {
    return (
      <Image
        src={review.authorPhoto}
        alt=""
        width={40}
        height={40}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="size-10 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="grid size-10 place-items-center rounded-full bg-teal-100 font-semibold text-teal-800">
      {review.author.trim()[0]?.toUpperCase() ?? "G"}
    </span>
  );
}

function Card({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > 260;
  return (
    <article className="flex h-full flex-col border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.rating} className="text-crimson" />
        <span className="label-mono text-ink-mute">Google</span>
      </div>
      <blockquote className={cn("mt-5 font-display text-[1.08rem] leading-snug text-ink sm:text-[1.2rem]", long && !open && "line-clamp-6")}>
        “{review.text}”
      </blockquote>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-2 self-start text-sm font-medium text-teal-700 hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
      {review.reply && (
        <p className="mt-4 border-l-2 border-teal-200 pl-3 text-sm text-ink-soft">
          <span className="label-mono mr-1 text-teal-700">Reply</span> {review.reply}
        </p>
      )}
      <footer className="mt-auto flex items-center gap-3 border-t border-ink/10 pt-5 text-sm">
        <Avatar review={review} />
        <div className="min-w-0">
          {review.authorUrl ? (
            <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="block truncate font-medium hover:underline">
              {review.author}
            </a>
          ) : (
            <p className="truncate font-medium">{review.author}</p>
          )}
          <p className="text-xs text-ink-mute">
            <When review={review} />
          </p>
        </div>
      </footer>
    </article>
  );
}

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(false);

  const cardWidth = () => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    if (!first || !track.current) return 1;
    const gap = parseFloat(getComputedStyle(track.current).columnGap || "0");
    return first.offsetWidth + gap;
  };

  const lastIndex = Math.max(0, reviews.length - perView);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const target = i > lastIndex ? 0 : i < 0 ? lastIndex : i;
      el.scrollTo({ left: target * cardWidth(), behavior: reduce ? "auto" : "smooth" });
    },
    [lastIndex, reduce],
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      setPerView(Math.max(1, Math.round(el.clientWidth / cardWidth())));
      setIndex(Math.round(el.scrollLeft / cardWidth()));
    };
    const onScroll = () => setIndex(Math.round(el.scrollLeft / cardWidth()));
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (root.current) io.observe(root.current);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (paused || !visible || reduce || reviews.length <= perView) return;
    const id = window.setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, visible, reduce, perView, reviews.length, goTo]);

  if (!reviews.length) return null;
  const shown = Math.min(index + perView, reviews.length);

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Google reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={track}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r, i) => (
          <div
            key={r.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${reviews.length}`}
            className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <Card review={r} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-px flex-1 bg-ink/15" aria-hidden>
          <span
            className="absolute inset-y-0 left-0 bg-crimson transition-[width] duration-500"
            style={{ width: `${(shown / reviews.length) * 100}%` }}
          />
        </div>
        <span className="label-mono text-ink-mute tabular-nums" aria-live="polite">
          {String(shown).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous reviews" className="grid size-11 place-items-center rounded-full border border-ink/15 transition hover:border-ink">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} aria-label="Next reviews" className="grid size-11 place-items-center rounded-full border border-ink/15 transition hover:border-ink">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
