/**
 * Reviews copied by hand from the clinic's Google Business Profile
 * (Align Aesthetic Dental Hub, 5.0 · 8 reviews — captured 27 Sep 2026).
 *
 * Only the written reviews are listed; two star-only reviews (Amit Tiwari,
 * Ayush Chouksey) have no text to show. All text is the reviewer's own words,
 * copied in full. When the Business Profile API is connected (see README) this
 * list is replaced automatically by the live reviews and count.
 *
 * Paste more as they come in, exactly as written:
 *   { author: "Name as on Google", rating: 5, text: "…", date: "2026-08-25" },
 */

export type SavedReview = { author: string; rating: number; text: string; date?: string };

export const savedReviews: SavedReview[] = [
  {
    author: "Divya Sahu",
    rating: 5,
    text: "I visited the clinic for my aligner treatment, and I had a great experience. Dr. Nikita Soni explained everything clearly, answered all my questions patiently, and made me feel comfortable throughout the process. The staff was friendly, and the clinic was clean and well-maintained. I highly recommend Dr. Nikita Soni and the entire team!",
    date: "2026-08-26",
  },
  {
    author: "Sherlz Paradise",
    rating: 5,
    text: "Finding a dentist you can genuinely trust makes such a difference, and I’m so glad I visited Align Aesthetic Dental Hub. Dr. Nikita Soni is wonderful, very calm, attentive, and thorough. She patiently answered all my questions and made sure I was comfortable throughout. The entire experience was smooth and pleasant. Highly recommended! ❤️",
    date: "2026-08-25",
  },
  {
    author: "Riya Bhardwaj",
    rating: 5,
    text: "Visited Align Aesthetics Clinic for a cavity that was causing sensitivity and occasional pain. From the very first consultation, Dr. Nikita Soni was very patient and explained the problem to me in a simple way. Treatment was done very smoothly and I was guided properly about the aftercare as well. Really happy with the overall experience and would definitely recommend to visit.",
    date: "2026-08-24",
  },
  {
    author: "Shaun Devre",
    rating: 5,
    text: "Really good experience at the clinic. Dr. Nikita Soni was very kind and patient, and explained everything properly before starting the treatment. The staff was friendly and the clinic was clean and comfortable. Overall, I’m happy with the treatment and would definitely recommend Dr. Nikita Soni.",
    date: "2026-08-23",
  },
  {
    author: "Reena Devre",
    rating: 5,
    text: "Finally decided to get my teeth aligned, and I’m so glad I chose Dr. Nikita for my aligner treatment! The whole process has been smooth and much easier than I expected.",
    date: "2026-08-22",
  },
  {
    author: "Sherin Charles",
    rating: 5,
    text: "I visited Align Aesthetic and Dr. Nikita was very kind and polite. The staff was also very nice, respectful, and welcoming. The clinic was neat and clean. I highly recommend Align Aesthetic for any dental issues.",
    date: "2026-08-21",
  },
];

/** Rating and total as shown on the Google profile when the list was copied. */
export const savedSummary: { rating: number | null; total: number | null } = { rating: 5.0, total: 8 };
