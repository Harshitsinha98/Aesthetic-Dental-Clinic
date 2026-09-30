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
      institution: "People’s Dental College & Research Centre",
      university: "People’s University, Bhopal",
      year: "2019",
    },
  ],

  bio: [
    "Dr. Nikita Soni is an orthodontist and dentofacial orthopaedic specialist — a dentist who went on to a specialist postgraduate degree in moving teeth and guiding the growth of the jaws. As a consultant orthodontist she is a certified Invisalign provider and a braces expert, working across both labial and lingual braces and clear aligners for children and adults alike.",
    "Her postgraduate research measured what actually makes a smile look balanced, in growing children and in adults — published in the International Journal of Dental Science and Innovative Research, and later expanded into a book on orthodontic materials. That question — how a smile should sit within a face — is the thread running through Align Aesthetic, from a first set of braces to a full smile design.",
  ],
};

/**
 * Continuing education — every entry is transcribed from a certificate
 * photographed at the clinic (photos/originals and photos/new images). Only
 * dates printed on the certificate are given. Newest first.
 */
export type LearningCategory = "Orthodontics & aligners" | "Facial aesthetics" | "Restorative & endo" | "Conferences & research";

export type Learning = {
  title: string;
  by: string;
  when?: string;
  highlight?: string;
  category: LearningCategory;
  /** Certificate photo(s) in /public/images/credentials. */
  images: string[];
};

export const learningCategories: LearningCategory[] = [
  "Orthodontics & aligners",
  "Facial aesthetics",
  "Restorative & endo",
  "Conferences & research",
];

export const learning: Learning[] = [
  {
    title: "Post Graduate Diploma in Clinical Cosmetology",
    by: "Cosmetica India Academy, with the International Academy of Cosmetology, Ukraine · 6-month course",
    when: "Jul 2026",
    highlight: "PG Diploma",
    category: "Facial aesthetics",
    images: ["/images/credentials/cosmetica-pg-diploma-2026.jpg"],
  },
  {
    title: "Master Course in Facial Aesthetics (MCFA)",
    by: "Cosmetica India Academy · three-day workshop",
    when: "Jul 2026",
    category: "Facial aesthetics",
    images: ["/images/credentials/cosmetica-facial-aesthetics-2026.jpg", "/images/credentials/cosmetica-masterclass.jpg"],
  },
  {
    title: "Master Course in Trichology (MCIT)",
    by: "Cosmetica India Academy · two-day workshop",
    when: "Jul 2026",
    category: "Facial aesthetics",
    images: ["/images/credentials/cosmetica-trichology-2026.jpg"],
  },
  {
    title: "Master Course in Semi-Permanent Makeup",
    by: "Cosmetica India Academy · one-day workshop",
    when: "Jul 2026",
    category: "Facial aesthetics",
    images: ["/images/credentials/cosmetica-spmu-2026.jpg"],
  },
  {
    title: "Zirconia & E-max crowns, and crown troubleshooting",
    by: "DentCare with the Indian Dental Association, Bhopal branch",
    when: "Apr 2026",
    category: "Restorative & endo",
    images: ["/images/credentials/ida-crowns-2026.jpg"],
  },
  {
    title: "Aesthetic & Cosmetic Dentistry — lecture & demo workshop",
    by: "Indian Dental Association × Coltene",
    when: "Feb 2026",
    category: "Restorative & endo",
    images: ["/images/credentials/coltene-2026.jpg"],
  },
  {
    title: "Lights Up Your Practice — a precision approach to laser dentistry",
    by: "Lecture + hands-on · MP Dental Depot with Orikam, Bhopal",
    when: "Jun 2025",
    category: "Restorative & endo",
    images: ["/images/credentials/laser-2025.jpg"],
  },
  {
    title: "30th National Conference of the Indian Society of Oral Implantologists",
    by: "ISOI · Brilliant Convention Centre, Indore",
    when: "Sep 2024",
    category: "Conferences & research",
    images: ["/images/credentials/isoi-2024.jpg"],
  },
  {
    title: "Brava Plus & independent tooth-movement mechanics",
    by: "Brius Technologies with SheepMedical · certificate course",
    when: "Sep 2024",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/brius-2024.jpg"],
  },
  {
    title: "In-office aligners — hands-on workshop",
    by: "In Office Aligner Academy, Indore",
    when: "Jun 2024",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/in-office-aligners-2024.jpg"],
  },
  {
    title: "Rotary Endodontics Simplified with GenENDO",
    by: "Coltene · lecture & hands-on workshop",
    when: "May 2024",
    category: "Restorative & endo",
    images: ["/images/credentials/coltene-genendo-2024.jpg"],
  },
  {
    title: "Mastering Smile Transformations — hands-on course",
    by: "Dr. Kshama Chandan · Delhi",
    when: "6–7 Sep",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/smile-transformations.jpg"],
  },
  {
    title: "26th IOS National PG Students Convention",
    by: "Indian Orthodontic Society · Sardar Patel PG Institute of Dental & Medical Sciences, Lucknow — attended and presented",
    when: "Feb 2023",
    highlight: "Session’s Best Paper",
    category: "Conferences & research",
    images: [
      "/images/credentials/ios-best-paper.jpg",
      "/images/credentials/ios-appreciation-2023.jpg",
      "/images/credentials/ios-attendance-2023.jpg",
    ],
  },
  {
    title: "A complete guide to clinical cases of cleft lip & craniofacial orthodontics",
    by: "Dept. of Orthodontics, K.D. Dental College & Hospital, Mathura",
    when: "Jan 2023",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/kd-cleft-2023.jpg"],
  },
  {
    title: "Teeth straightening with clear aligners",
    by: "International College of Dentists · CDE programme, Moradabad",
    when: "Sep 2022",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/icd-aligners-2022.jpg"],
  },
  {
    title: "Introduction to research methodology — live CDE workshop",
    by: "K.D. Dental College & Hospital, Mathura",
    when: "Feb 2022",
    category: "Conferences & research",
    images: ["/images/credentials/kd-research-2022.jpg"],
  },
  {
    title: "Orthorachna 2K21",
    by: "Dept. of Orthodontics, Manav Rachna Dental College, Faridabad",
    when: "Nov 2021",
    category: "Orthodontics & aligners",
    images: ["/images/credentials/orthorachna-2021.jpg"],
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

export const navLinks: Array<{ href: string; label: string; badge?: string }> = [
  { href: "/treatments", label: "Treatments" },
  { href: "/facial-aesthetics", label: "Aesthetics", badge: "Soon" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "Dr. Nikita" },
  { href: "/gallery", label: "Clinic" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Visit" },
];
