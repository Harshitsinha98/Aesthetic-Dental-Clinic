/**
 * Google reviews section (server component): rating summary + carousel.
 * Renders only what Google (or the hand-copied list) provides — never
 * placeholder testimonials.
 */

import { ArrowUpRight } from "lucide-react";
import { ReviewCarousel, Stars } from "@/components/reviews/review-carousel";
import { getReviews } from "@/lib/reviews";

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export async function GoogleReviews() {
  const data = await getReviews();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-ink/15 pb-8">
        {data.rating ? (
          <div className="flex items-end gap-5">
            <span className="font-display text-[clamp(4rem,12vw,5.5rem)] leading-[0.8]">{data.rating.toFixed(1)}</span>
            <div className="pb-1">
              <Stars value={data.rating} className="text-crimson" />
              <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-mute">
                <GoogleG /> {data.total ? `${data.total.toLocaleString("en-IN")} reviews on Google` : "Google reviews"}
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
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
          <a href={data.readUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition hover:border-ink">
            Read all on Google <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </a>
          <a href={data.writeUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-porcelain transition hover:bg-teal-900">
            Write a review <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>

      {data.reviews.length > 0 && (
        <div className="mt-10">
          <ReviewCarousel reviews={data.reviews} />
          <p className="mt-6 flex items-center gap-2 label-mono text-ink-mute">
            <GoogleG /> Reviews from Google
            {data.source === "business-profile" ? " · all reviews, synced automatically" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
