/**
 * Reviews copied by hand from the clinic's Google Business Profile.
 *
 * Used when the Business Profile API (all reviews) is not connected: they are
 * merged with the up-to-5 live reviews from the Places API, or shown on their
 * own if no key is set.
 *
 * Paste ONLY real reviews, exactly as written on Google (written reviews only —
 * star-only reviews have nothing to show). `date` is optional, YYYY-MM-DD.
 *
 *   { author: "Name as on Google", rating: 5, text: "…", date: "2026-08-14" },
 */

export type SavedReview = { author: string; rating: number; text: string; date?: string };

export const savedReviews: SavedReview[] = [];

/** Rating and total as shown on the Google profile when the list was copied. */
export const savedSummary: { rating: number | null; total: number | null } = { rating: null, total: null };
