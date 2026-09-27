/**
 * Google reviews, fetched live from the Places API (New).
 *
 *   GOOGLE_PLACES_API_KEY   required to show reviews
 *   GOOGLE_PLACE_ID         optional — otherwise resolved once by text search
 *
 * What Google returns: the overall rating, the total review count, and up to
 * FIVE reviews that Google itself selects. That limit is Google's, not ours;
 * the page links to the full list on Google for everything else.
 *
 * Responses are cached by Next's fetch cache for REVALIDATE_SECONDS, which keeps
 * API usage to a handful of calls a day. Nothing here ever invents a review:
 * without a key (or if Google errors) the section shows links to the Google
 * profile instead.
 */

import { clinic } from "./clinic";

const REVALIDATE_SECONDS = 6 * 60 * 60;
const BASE = "https://places.googleapis.com/v1";

export type GoogleReview = {
  author: string;
  authorUrl: string | null;
  authorPhoto: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string | null;
};

export type ReviewsResult =
  | {
      ok: true;
      rating: number | null;
      total: number | null;
      reviews: GoogleReview[];
      mapsUrl: string | null;
      reviewsUrl: string | null;
      writeReviewUrl: string | null;
      placeId: string;
    }
  | { ok: false; reason: "not_configured" | "not_found" | "error"; detail?: string };

function key() {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

async function resolvePlaceId(apiKey: string): Promise<string | null> {
  const configured = process.env.GOOGLE_PLACE_ID?.trim();
  if (configured) return configured;

  const response = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: `${clinic.googlePlaceName}, ${clinic.city}`, maxResultCount: 1 }),
    next: { revalidate: 7 * 24 * 60 * 60 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`searchText ${response.status}`);
  const data = (await response.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id ?? null;
}

type PlaceDetails = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string; writeAReviewUri?: string };
  reviews?: Array<{
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }>;
};

export async function getGoogleReviews(): Promise<ReviewsResult> {
  const apiKey = key();
  if (!apiKey) return { ok: false, reason: "not_configured" };

  try {
    const placeId = await resolvePlaceId(apiKey);
    if (!placeId) return { ok: false, reason: "not_found" };

    const response = await fetch(`${BASE}/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri,googleMapsLinks",
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return { ok: false, reason: "error", detail: `${response.status} ${(await response.text()).slice(0, 200)}` };
    }
    const place = (await response.json()) as PlaceDetails;

    const reviews: GoogleReview[] = (place.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Google user",
        authorUrl: r.authorAttribution?.uri ?? null,
        authorPhoto: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 0,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime ?? null,
      }))
      .filter((r) => r.text.length > 0);

    return {
      ok: true,
      rating: place.rating ?? null,
      total: place.userRatingCount ?? null,
      reviews,
      mapsUrl: place.googleMapsUri ?? null,
      reviewsUrl: place.googleMapsLinks?.reviewsUri ?? null,
      writeReviewUrl: place.googleMapsLinks?.writeAReviewUri ?? null,
      placeId,
    };
  } catch (error) {
    console.error("[reviews] Google Places request failed:", error);
    return { ok: false, reason: "error", detail: (error as Error).message };
  }
}
