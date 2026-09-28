/**
 * Single source of truth for every fact shown on the site.
 *
 * Provenance matters for a medical practice, so each block notes where it came
 * from. Sources:
 *   • the exterior signboard and the illuminated tooth sign (photos in
 *     photos/originals — see INDEX.txt)
 *   • the framed degree certificates and CDE certificates on the clinic wall
 *   • the clinic's Google Business Profile (address, phone, hours)
 *   • details confirmed directly by the clinic owner
 *
 * Deliberately NOT published: fees, registration validity/renewal dates,
 * "years of experience" or patient-count claims, and any review text that did
 * not come from Google itself. Please do not "fill in" plausible values.
 */

export const clinic = {
  name: "Align Aesthetic Dental Hub",
  shortName: "Align Aesthetic",
  /** From the signboard. */
  tagline: "Beautiful Smiles. Confident You.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://alignaesthetic.in",

  /** E.164 digits without '+'. Signboard + Google Business Profile. */
  phone: "917477003741",
  phoneDisplay: "+91 74770 03741",

  addressLines: [
    "Gate No. 3, A-6, JK Road",
    "New Minal Residency",
    "Bhopal, Madhya Pradesh 462023",
  ],
  /** Name plate on the gate: "Matru Chhaya, New Minal A-6". */
  landmark: "“Matru Chhaya”, A-6 — opposite Gate No. 3, New Minal Residency",
  locality: "New Minal Residency, JK Road, Bhopal",
  postalCode: "462023",
  city: "Bhopal",
  region: "Madhya Pradesh",
  mapsQuery: "Align Aesthetic Dental Hub, A-6, JK Road, New Minal Residency, Bhopal 462023",
  googlePlaceName: "Align Aesthetic Dental Hub",
};

export const doctor = {
  name: "Dr. Nikita Soni",
  /** Signboard: "BDS, MDS (Orthodontist) · Braces / Aligner Specialist". */
  qualifications: "BDS, MDS (Orthodontics & Dentofacial Orthopaedics)",
  title: "Orthodontist · Braces & Aligner Specialist",
  /** Confirmed by the clinic owner. */
  yearsOfExperience: 3,
  /** Shown on the signboard itself. Validity dates are intentionally omitted. */
  registration: "MP State Dental Council · Reg. No. A-09775",

  degrees: [
    {
      degree: "Master of Dental Surgery (MDS)",
      field: "Orthodontics & Dentofacial Orthopaedics",
      institution: "K.D. Dental College & Hospital, Mathura",
      university: "Dr. Bhimrao Ambedkar University, Agra",
      year: "2023",
      note: "Thesis: “Evaluation of smile parameters in growing and non-growing individuals — a photographic study.”",
    },
    {
      degree: "Bachelor of Dental Surgery (BDS)",
      field: "Dentistry",
      institution: "People’s College of Dental Sciences & Research Centre",
      university: "People’s University, Bhopal",
      year: "2018",
    },
  ],

  bio: [
    "Dr. Nikita Soni is an orthodontist with three years of clinical practice — a dentist who went on to a specialist postgraduate degree in moving teeth and guiding the growth of the jaws. She trained in Bhopal for her BDS and completed her MDS in Orthodontics & Dentofacial Orthopaedics at K.D. Dental College, Mathura.",
    "Her postgraduate research measured what actually makes a smile look balanced, in growing children and in adults. That question — how a smile should sit within a face — is the thread running through Align Aesthetic, from a first set of braces to a full smile design.",
  ],
};

/**
 * Continuing education — every entry is transcribed from a framed certificate
 * on the clinic wall. Only dates that are legible on the certificate are given.
 */
export const learning: Array<{
  title: string;
  by: string;
  when?: string;
  highlight?: string;
}> = [
  {
    title: "26th IOS National PG Students Convention",
    by: "Indian Orthodontic Society · Sardar Patel PG Institute of Dental & Medical Sciences, Lucknow",
    when: "Feb 2023",
    highlight: "Session’s Best Paper",
  },
  {
    title: "30th National Conference of the Indian Society of Oral Implantologists",
    by: "ISOI · Brilliant Convention Centre, Indore",
    when: "Sep 2024",
  },
  {
    title: "Lights Up Your Practice — a precision approach to laser dentistry",
    by: "Lecture + hands-on · MP Dental Depot with Orikam, Bhopal",
    when: "Jun 2025",
  },
  {
    title: "Aesthetic & Cosmetic Dentistry — lecture & demo workshop",
    by: "Indian Dental Association × Coltene",
    when: "Feb 2026",
  },
  {
    title: "In-office aligners — hands-on workshop",
    by: "In Office Aligner Academy, Indore",
  },
  {
    title: "Teeth straightening with clear aligners",
    by: "International College of Dentists · CDE programme, Moradabad",
    when: "Sep 2022",
  },
  {
    title: "Bravo Plus & independent tooth-movement mechanics",
    by: "Brius Technologies · certificate course",
  },
  {
    title: "Orthorachna",
    by: "Dept. of Orthodontics, Manav Rachna Dental College, Faridabad",
    when: "Nov 2021",
  },
  {
    title: "A complete guide to clinical cases of cleft lip & craniofacial orthodontics",
    by: "K.D. Dental College & Hospital, Mathura",
  },
];

export const telHref = (phone: string = clinic.phone) => `tel:+${phone}`;

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${clinic.phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mapsHref() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.mapsQuery)}`;
}

export function mapsEmbedSrc() {
  return `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery)}&output=embed`;
}

/** Google search for the business — lands on the profile with its reviews. */
export function googleReviewsHref(placeId?: string) {
  if (placeId) {
    return `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${clinic.googlePlaceName} Bhopal reviews`)}`;
}

export function googleWriteReviewHref(placeId?: string) {
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return googleReviewsHref();
}

export const navLinks = [
  { href: "/treatments", label: "Treatments" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "Dr. Nikita" },
  { href: "/gallery", label: "Clinic" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Visit" },
];
