/**
 * Google reviews for the carousel.
 *
 * Three sources, used in this order:
 *
 *  1. Google Business Profile API — ALL reviews. Requires the clinic owner's
 *     Google account (OAuth) and Google's approval of API access for the Cloud
 *     project. Env: GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN,
 *     GBP_ACCOUNT_ID, GBP_LOCATION_ID. See README → "All Google reviews".
 *
 *  2. Places API (New) — only the (up to) 5 reviews Google chooses to expose,
 *     plus the live rating and total. Env: GOOGLE_PLACES_API_KEY
 *     (+ optional GOOGLE_PLACE_ID).
 *
 *  3. src/lib/reviews-saved.ts — reviews copied by hand from the Google
 *     profile. Merged with (2), de-duplicated by author name.
 *
 * Nothing here ever invents a review: with no source configured the section
 * shows only the links to the Google profile.
 */

import { clinic } from "./clinic";
import { savedReviews, savedSummary } from "./reviews-saved";

const REVALIDATE_SECONDS = 6 * 60 * 60;

export type Review = {
  id: string;
  author: string;
  authorUrl: string | null;
  authorPhoto: string | null;
  rating: number;
  text: string;
  /** ISO timestamp when known (Business Profile / saved list). */
  time: string | null;
  /** Google's own phrase ("3 weeks ago"), when that is all we have (Places). */
  relativeTime: string | null;
  reply: string | null;
};

export type ReviewsData = {
  source: "business-profile" | "places" | "saved" | "none";
  rating: number | null;
  total: number | null;
  reviews: Review[];
  readUrl: string;
  writeUrl: string;
};

const nameKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function fallbackLinks(placeId?: string | null) {
  const search = `https://www.google.com/search?q=${encodeURIComponent(`${clinic.googlePlaceName} Bhopal reviews`)}`;
  return {
    readUrl: placeId ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}` : search,
    writeUrl: placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : search,
  };
}

/** Google appends machine translations; keep the readable (translated) part. */
function cleanComment(text: string) {
  let t = text.trim();
  if (t.startsWith("(Translated by Google)")) {
    t = t.replace("(Translated by Google)", "").split(/\n\s*\(Original\)/)[0].trim();
  }
  return t;
}

/* ------------------------------------------------------------------ */
/* 1. Google Business Profile API                                      */
/* ------------------------------------------------------------------ */

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

async function gbpAccessToken(): Promise<string | null> {
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) return null;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GBP_CLIENT_ID,
      client_secret: GBP_CLIENT_SECRET,
      refresh_token: GBP_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`oauth ${response.status} ${(await response.text()).slice(0, 200)}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

type GbpReview = {
  reviewId: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: { comment?: string };
};

async function fromBusinessProfile(): Promise<ReviewsData | null> {
  const account = process.env.GBP_ACCOUNT_ID?.replace(/^accounts\//, "");
  const location = process.env.GBP_LOCATION_ID?.replace(/^locations\//, "");
  if (!account || !location) return null;
  const token = await gbpAccessToken();
  if (!token) return null;

  const reviews: Review[] = [];
  let rating: number | null = null;
  let total: number | null = null;
  let pageToken: string | undefined;

  // 50 per page is the API maximum; 20 pages = 1,000 reviews is plenty.
  for (let page = 0; page < 20; page++) {
    const url = new URL(`https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`gbp ${response.status} ${(await response.text()).slice(0, 200)}`);
    const data = (await response.json()) as {
      reviews?: GbpReview[];
      averageRating?: number;
      totalReviewCount?: number;
      nextPageToken?: string;
    };
    rating ??= data.averageRating ?? null;
    total ??= data.totalReviewCount ?? null;
    for (const r of data.reviews ?? []) {
      const text = cleanComment(r.comment ?? "");
      if (!text) continue; // star-only reviews have nothing to show in a card
      reviews.push({
        id: r.reviewId,
        author: r.reviewer?.isAnonymous ? "A Google user" : r.reviewer?.displayName || "A Google user",
        authorUrl: null,
        authorPhoto: r.reviewer?.profilePhotoUrl ?? null,
        rating: STARS[r.starRating ?? ""] ?? 5,
        text,
        time: r.createTime ?? r.updateTime ?? null,
        relativeTime: null,
        reply: r.reviewReply?.comment?.trim() || null,
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return {
    source: "business-profile",
    rating,
    total,
    reviews,
    ...fallbackLinks(process.env.GOOGLE_PLACE_ID),
  };
}

/* ------------------------------------------------------------------ */
/* 2. Places API (New)                                                 */
/* ------------------------------------------------------------------ */

async function fromPlaces(): Promise<ReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return null;

  let placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!placeId) {
    const search = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id" },
      body: JSON.stringify({ textQuery: `${clinic.googlePlaceName}, ${clinic.city}`, maxResultCount: 1 }),
      next: { revalidate: 7 * 24 * 60 * 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!search.ok) throw new Error(`searchText ${search.status}`);
    placeId = ((await search.json()) as { places?: { id: string }[] }).places?.[0]?.id;
    if (!placeId) return null;
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsLinks" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`places ${response.status} ${(await response.text()).slice(0, 200)}`);
  const place = (await response.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsLinks?: { reviewsUri?: string; writeAReviewUri?: string };
    reviews?: Array<{
      name?: string;
      rating?: number;
      relativePublishTimeDescription?: string;
      publishTime?: string;
      text?: { text?: string };
      originalText?: { text?: string };
      authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
    }>;
  };

  const links = fallbackLinks(placeId);
  return {
    source: "places",
    rating: place.rating ?? null,
    total: place.userRatingCount ?? null,
    reviews: (place.reviews ?? [])
      .map((r, i) => ({
        id: r.name ?? `places-${i}`,
        author: r.authorAttribution?.displayName ?? "A Google user",
        authorUrl: r.authorAttribution?.uri ?? null,
        authorPhoto: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 5,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        time: r.publishTime ?? null,
        relativeTime: r.relativePublishTimeDescription ?? null,
        reply: null,
      }))
      .filter((r) => r.text),
    readUrl: place.googleMapsLinks?.reviewsUri ?? links.readUrl,
    writeUrl: place.googleMapsLinks?.writeAReviewUri ?? links.writeUrl,
  };
}

/* ------------------------------------------------------------------ */

function saved(): Review[] {
  return savedReviews.map((r, i) => ({
    id: `saved-${i}`,
    author: r.author,
    authorUrl: null,
    authorPhoto: null,
    rating: r.rating,
    text: r.text,
    time: r.date ? new Date(`${r.date}T00:00:00+05:30`).toISOString() : null,
    relativeTime: null,
    reply: null,
  }));
}

export async function getReviews(): Promise<ReviewsData> {
  try {
    const all = await fromBusinessProfile();
    if (all) return all;
  } catch (error) {
    console.error("[reviews] Business Profile API failed, falling back:", (error as Error).message);
  }

  let places: ReviewsData | null = null;
  try {
    places = await fromPlaces();
  } catch (error) {
    console.error("[reviews] Places API failed, falling back:", (error as Error).message);
  }

  const savedList = saved();
  if (places) {
    const seen = new Set(places.reviews.map((r) => nameKey(r.author)));
    return { ...places, reviews: [...places.reviews, ...savedList.filter((r) => !seen.has(nameKey(r.author)))] };
  }
  if (savedList.length) {
    return {
      source: "saved",
      rating: savedSummary.rating,
      total: savedSummary.total,
      reviews: savedList,
      ...fallbackLinks(process.env.GOOGLE_PLACE_ID),
    };
  }
  return { source: "none", rating: null, total: null, reviews: [], ...fallbackLinks(process.env.GOOGLE_PLACE_ID) };
}
