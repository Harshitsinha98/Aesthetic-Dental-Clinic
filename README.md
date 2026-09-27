# Align Aesthetic Dental Hub

Website and online token system for **Dr. Nikita Soni, BDS, MDS (Orthodontics & Dentofacial Orthopaedics)**, JK Road, Bhopal.

Next.js 16 · React 19 · Tailwind CSS v4 · Motion · Turso/SQLite · Google Business Profile / Places API.

```bash
npm install
cp .env.example .env.local   # optional, every value can stay empty
npm run dev                  # http://localhost:3000
npm test                     # booking engine, incl. multi-process race test
npm run build
```

## What is where

| Path | Purpose |
|---|---|
| `src/lib/clinic.ts` | Every fact about the clinic and doctor, with sources noted. Edit this, not the pages. |
| `src/lib/treatments.ts` | Treatment pages (copy, steps, FAQs). |
| `src/lib/instruments.ts` | The instrument tray. Entries with `confirmed: false` are hidden until the clinic confirms them. |
| `src/lib/gallery.ts` | Published photos. `SHOW_PATIENT_PHOTOS = false` hides every photo with a patient in it. |
| `src/lib/schedule.ts` | Hours, 15-minute slots, holidays (`blackoutDates`) and "hours may differ" notes. |
| `src/lib/booking.ts`, `db.ts` | Token engine. A partial UNIQUE index makes double-booking impossible at the database level. |
| `src/lib/token-save.ts` | Patient-side saving: on-device list, token image, calendar, share / SMS draft. |
| `src/lib/reviews.ts`, `reviews-saved.ts` | Google reviews for the carousel (all via Business Profile API, or 5 live + hand-copied list). |
| `src/lib/ai.ts` | Align Assistant (works without a key). |
| `scripts/prepare-images.py` | Rebuilds `public/images` from `photos/originals` (strips EXIF/GPS). |

Pages: `/`, `/treatments`, `/treatments/[slug]`, `/technology`, `/about`, `/gallery`, `/reviews`, `/contact`, `/book`, `/my-token`, `/admin` (not linked, passcode-protected).

## Tokens

- The day is split into 15-minute slots: 32 tokens a day, or 44 on Wednesday (10 am–9 pm, no break). Token number = slot position, so it also tells the patient when to come.
- Booking up to 14 days ahead, as long as the slot starts at least 20 minutes from now. One live token per patient per day; family members sharing a phone can each book.
- To close a date, add it to `blackoutDates` in `schedule.ts`.

No WhatsApp or SMS is sent. Tokens are seen by the clinic on screen and kept by the patient on their phone.

### Reception & doctor — `/admin`
Same passcode (`ADMIN_PASSCODE`) on the reception PC and the doctor's phone.
- **Live:** refreshes every 20 seconds. A new booking shows a toast, plays a chime (can be muted), puts a count in the tab title, and, if turned on with the bell button, sends a desktop/phone notification while the page is open.
- **Now serving:** the earliest token not yet seen, with **Seen · call next**, **No-show** and a call button, plus the next three.
- **List:** All / Waiting / Seen / No-show / Cancelled filters. Table on desktop, cards on a phone. Print button for the day's list.
- **Find patient:** search any date by mobile number, booking code or name, for a patient who lost their code.
- **Walk-in:** issues the next free token for a walk-in or phone call.

### Waiting-room screen — `/queue`
Open on a TV or spare tablet. Shows **Now serving** and the next numbers, updating every 15 seconds. Token numbers only, never names or phone numbers.

### Patient — keeping the token
- Saved **automatically on the phone they booked from**. **/my-token** lists it with live status, no code needed, and they can cancel from there.
- **Save token image** (PNG to the gallery/downloads), **Add to calendar** (Google, or .ics for iPhone/Outlook with a 1-hour reminder), **Share** (the phone's share sheet: WhatsApp, SMS or email to themselves or family), **Send by SMS** (opens their own Messages app pre-filled, free), and **Print**.
- Lost everything? Reception finds the booking by mobile number.

### Optional later: automatic SMS from the clinic
Needs an Indian SMS provider (MSG91, Fast2SMS, 2Factor, Gupshup…) and **TRAI DLT registration**: register the business as a principal entity, get a 6-letter sender ID (e.g. `ALIGND`), and get the exact message template approved. This takes a few days, and costs roughly ₹0.15–0.30 per SMS plus a one-time DLT fee. Once you have the provider key, sender ID and template ID, sending an SMS after booking can be added to `POST /api/appointments`.

## All Google reviews (carousel)

The carousel uses the first source that is configured:

1. **Google Business Profile API: all reviews, auto-synced.** Needs the Google account that manages the clinic's Business Profile.
   1. In Google Cloud, create a project and submit the **Business Profile API access request** (Google approves it, usually in a few days).
   2. Once approved, enable *My Business Account Management API*, *My Business Business Information API* and *Google My Business API*.
   3. Create an OAuth client (type *Web*, redirect `https://developers.google.com/oauthplayground`). In the [OAuth Playground](https://developers.google.com/oauthplayground), use your own client, authorise scope `https://www.googleapis.com/auth/business.manage` **with the clinic's Google account**, and exchange for a **refresh token**.
   4. `GBP_CLIENT_ID=… GBP_CLIENT_SECRET=… GBP_REFRESH_TOKEN=… node scripts/gbp-ids.mjs` prints `GBP_ACCOUNT_ID` and `GBP_LOCATION_ID`.
   5. Put all five `GBP_*` values in Vercel. Reviews refresh every 6 hours, including owner replies.
2. **Places API (New): up to 5 live reviews** chosen by Google, plus the live rating and count. Set `GOOGLE_PLACES_API_KEY` (a server key: API restriction *Places API (New)*, application restriction *None*; billing enabled).
3. **Hand-copied list:** paste real reviews into `src/lib/reviews-saved.ts`. This list is merged with (2), with duplicates removed.

With none of these set, the section shows only the "Read all / Write a review" links. No review text is ever made up.

## Deploy (Vercel + Turso)

1. `npm run setup:turso` (or create a database at turso.tech) and copy the URL and token.
2. Import the repo into Vercel and add the env vars: at minimum `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSCODE` and `NEXT_PUBLIC_SITE_URL`. Add review keys if you have them.
3. After deploying, open `/api/health`. It should say `bookingEnabled: true`.

## Still to confirm with the clinic

- `src/lib/instruments.ts`: two devices marked `confirmed: false` (a wall-mounted glass cabinet and a blue pen-shaped device). They stay hidden until identified.
- Photos with patients (`hasPatient` in `gallery.ts`) should only stay published if the patients have consented.
- The logo is a vector redraw of the signboard. Swap in the designer's master file if one exists (`src/components/brand/logo.tsx`, `public/icon.svg`).
- `NEXT_PUBLIC_SITE_URL`: the final domain.
