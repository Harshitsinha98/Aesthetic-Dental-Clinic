# Align Aesthetic Dental Hub

Website and online token system for **Dr. Nikita Soni, BDS, MDS (Orthodontics & Dentofacial Orthopaedics)**, JK Road, Bhopal.

Next.js 16 · React 19 · Tailwind CSS v4 · Motion · Turso/SQLite · WhatsApp Cloud API · Google Places API.

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
| `src/lib/notify.ts`, `whatsapp.ts` | WhatsApp messages to the patient and the doctor. |
| `src/lib/reviews.ts` | Live Google reviews. |
| `src/lib/ai.ts` | Align Assistant (works without a key). |
| `scripts/prepare-images.py` | Rebuilds `public/images` from `photos/originals` (strips EXIF/GPS). |

Pages: `/`, `/treatments`, `/treatments/[slug]`, `/technology`, `/about`, `/gallery`, `/reviews`, `/contact`, `/book`, `/my-token`, `/admin` (not linked, passcode-protected).

## Tokens

- The day is split into 15-minute slots: 32 tokens a day, or 44 on Wednesday (10 am–9 pm, no break). Token number = slot position, so it also tells the patient when to come.
- Patients can book up to 14 days ahead, as long as the slot starts at least 20 minutes from now. One live token per patient per day, but family members sharing a phone can each book.
- **/admin**: the day's register. Buttons for Seen, No-show, Undo and Cancel. Staff can add walk-in or phone tokens, and the WhatsApp outbox shows every message that was sent or logged.
- Patients check or cancel under **/my-token**, using the booking code plus their mobile number.
- To close a date, add it to `blackoutDates` in `schedule.ts`.

## WhatsApp: patient + doctor

Every booking sends two messages: the **token card** to the patient and a **"new booking"** alert to `DOCTOR_WHATSAPP_NUMBER` (currently the test number `+91 96530 43939`). Cancellations notify both too. Without credentials, nothing is sent; the messages are only written to the outbox on /admin.

Going live:

1. Go to Meta for Developers, create an app and add the **WhatsApp** product. Copy the *Phone number ID* and create a **permanent System User token**. Set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.
2. Meta only delivers business-initiated messages as **approved templates**. In WhatsApp Manager, create four *Utility* templates (language `en`) with exactly these body variables, then put their names in the matching env vars:

| Env var | Body variables, in order |
|---|---|
| `WHATSAPP_TEMPLATE_PATIENT_BOOKED` | {{1}} name · {{2}} token · {{3}} date · {{4}} time · {{5}} booking code |
| `WHATSAPP_TEMPLATE_DOCTOR_BOOKED` | {{1}} token · {{2}} date & time · {{3}} patient · {{4}} mobile · {{5}} reason |
| `WHATSAPP_TEMPLATE_PATIENT_CANCELLED` | {{1}} token · {{2}} date · {{3}} time |
| `WHATSAPP_TEMPLATE_DOCTOR_CANCELLED` | {{1}} token · {{2}} date & time · {{3}} patient · {{4}} cancelled by |

   Example patient template: *"Hello {{1}}, your token {{2}} at Align Aesthetic Dental Hub is confirmed for {{3}} at {{4}}. Booking code: {{5}}. Please arrive 10 minutes early."*
3. The sending number must be registered on the Cloud API. If that is 074770 03741, the doctor alert has to go to a **different** number, because a number cannot message itself.
4. Meta charges per template message. Check current pricing for India in WhatsApp Manager.

## Google reviews

1. In Google Cloud, enable **Places API (New)**, create an API key restricted to that API, and turn on billing.
2. Set `GOOGLE_PLACES_API_KEY`. `GOOGLE_PLACE_ID` is optional (the clinic is looked up by name).
3. The page shows Google's rating, the total count, and **up to 5 reviews chosen by Google** (Google's limit), refreshed every 6 hours. Everything else is behind "Read all reviews on Google". Without a key, only the Google links are shown. No review text is ever made up.

## Deploy (Vercel + Turso)

1. `npm run setup:turso` (or create a database at turso.tech) and copy the URL and token.
2. Import the repo into Vercel and add the env vars: at minimum `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_PASSCODE` and `NEXT_PUBLIC_SITE_URL`.
3. After deploying, open `/api/health`. It should say `bookingEnabled: true`.

## Still to confirm with the clinic

- `src/lib/instruments.ts`: two devices marked `confirmed: false` (a wall-mounted glass cabinet and a blue pen-shaped device). They stay hidden until identified.
- Photos with patients (`hasPatient` in `gallery.ts`) should only stay published if the patients have consented.
- The logo is a vector redraw of the signboard. Swap in the designer's master file if one exists (`src/components/brand/logo.tsx`, `public/icon.svg`).
- `NEXT_PUBLIC_SITE_URL`: the final domain.
