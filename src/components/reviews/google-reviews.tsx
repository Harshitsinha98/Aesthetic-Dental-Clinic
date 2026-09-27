/**
 * Google reviews — server component. Renders only what Google returns; with no
 * API key (or on error) it shows honest links to the Google profile instead of
 * placeholder testimonials.
 */

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { googleReviewsHref, googleWriteReviewHref } from "@/lib/clinic";
import { getGoogleReviews } from "@/lib/reviews";
import { cn } from "@/lib/cn";

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className="size-4" aria-hidden>
            <defs>
              <linearGradient id={`s${i}-${Math.round(value * 10)}`}>
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7z" fill={`url(#s${i}-${Math.round(value * 10)})`} />
          </svg>
        );
      })}
    </span>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export async function GoogleReviews({ limit = 5 }: { limit?: number }) {
  const data = await getGoogleReviews();
  const readHref = data.ok ? data.reviewsUrl ?? data.mapsUrl ?? googleReviewsHref(data.placeId) : googleReviewsHref();
  const writeHref = data.ok ? data.writeReviewUrl ?? googleWriteReviewHref(data.placeId) : googleWriteReviewHref();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-ink/15 pb-8">
        {data.ok && data.rating ? (
          <div className="flex items-end gap-5">
            <span className="font-display text-[5.5rem] leading-[0.8]">{data.rating.toFixed(1)}</span>
            <div className="pb-1">
              <Stars value={data.rating} className="text-crimson" />
              <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-mute">
                <GoogleG /> {data.total ?? 0} Google reviews
              </p>
            </div>
          </div>
        ) : (
          <div className="flex max-w-xl items-start gap-4">
            <span className="mt-1.5"><GoogleG /></span>
            <p className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">
              Read what patients say about us <em className="text-teal-700 italic">on Google.</em>
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <a href={readHref} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition hover:border-ink">
            Read all reviews on Google <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </a>
          <a href={writeHref} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-porcelain transition hover:bg-teal-900">
            Write a review <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>

      {data.ok && data.reviews.length > 0 && (
        <ul className="grid gap-x-10 md:grid-cols-2">
          {data.reviews.slice(0, limit).map((r, i) => (
            <li key={`${r.author}-${i}`} className={cn("border-b border-ink/10 py-9", i === 0 && "md:col-span-2")}>
              <Stars value={r.rating} className="text-crimson" />
              <blockquote
                className={cn(
                  "mt-4 font-display leading-snug",
                  i === 0 ? "text-[clamp(1.5rem,2.6vw,2.2rem)]" : "text-xl",
                )}
              >
                “{r.text.length > 420 ? `${r.text.slice(0, 420).trimEnd()}…` : r.text}”
              </blockquote>
              <p className="mt-5 flex items-center gap-3 text-sm">
                {r.authorPhoto ? (
                  <Image src={r.authorPhoto} alt="" width={28} height={28} className="rounded-full" />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">{r.author[0]}</span>
                )}
                {r.authorUrl ? (
                  <a href={r.authorUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{r.author}</a>
                ) : (
                  <span className="font-medium">{r.author}</span>
                )}
                <span className="text-ink-mute">· {r.relativeTime} · Google</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      {data.ok && (
        <p className="mt-6 label-mono text-ink-mute">Reviews shown are selected and supplied by Google.</p>
      )}
    </div>
  );
}
