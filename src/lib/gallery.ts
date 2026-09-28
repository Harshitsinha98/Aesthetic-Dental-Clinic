import { learning } from "./clinic";
/**
 * Clinic photographs published on the site.
 *
 * `hasPatient` marks frames where a patient is visible in the chair. Set
 * SHOW_PATIENT_PHOTOS to false to drop them everywhere at once if consent is
 * not on file. Two waiting-room photos with clearly identifiable visitors
 * (photos/originals #41 and #43) are deliberately not published at all.
 */

export const SHOW_PATIENT_PHOTOS = true;

export type Photo = {
  src: string;
  alt: string;
  caption: string;
  category: "Clinic" | "Treatment" | "Dr. Nikita" | "Credentials";
  hasPatient?: boolean;
  wide?: boolean;
};

const all: Photo[] = [
  { src: "/images/clinic/signboard.jpg", alt: "Align Aesthetic Dental Hub signboard on JK Road", caption: "The signboard, JK Road", category: "Clinic", wide: true },
  { src: "/images/clinic/reception-tooth.jpg", alt: "Reception desk in front of an illuminated tooth-shaped wall", caption: "Reception", category: "Clinic" },
  { src: "/images/clinic/operatory.jpg", alt: "Treatment chair with overhead light and instrument delivery", caption: "Treatment room", category: "Clinic" },
  { src: "/images/clinic/entrance.jpg", alt: "Clinic entrance with the Align signboard above", caption: "Entrance", category: "Clinic" },
  { src: "/images/clinic/tooth-sign-night.jpg", alt: "Illuminated tooth-shaped sign at night", caption: "The tooth sign, after dark", category: "Clinic" },
  { src: "/images/clinic/counter.jpg", alt: "Instrument counter with framed certificates above", caption: "Instrument counter", category: "Clinic" },
  { src: "/images/clinic/logo-wall.jpg", alt: "Gold Align Aesthetic logo on the consultation room wall", caption: "Consultation room wall", category: "Clinic" },
  { src: "/images/clinic/exterior.jpg", alt: "Front of the clinic building", caption: "From the street", category: "Clinic" },
  { src: "/images/clinic/consultation.jpg", alt: "Dr. Nikita Soni in consultation at her desk", caption: "Consultation", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/treatment-bay-wide.jpg", alt: "Dr. Nikita Soni treating a patient", caption: "In treatment", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/treatment-bay-camera.jpg", alt: "Examination with the intraoral camera image on the chairside screen", caption: "Intraoral camera on screen", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/treatment-glass.jpg", alt: "Treatment chair beside a frosted glass partition", caption: "Chairside", category: "Treatment", hasPatient: true },
  { src: "/images/doctor/at-work-green.jpg", alt: "Dr. Nikita Soni examining a patient", caption: "Examination", category: "Treatment", hasPatient: true },
  { src: "/images/doctor/portrait-desk.jpg", alt: "Dr. Nikita Soni at her desk beneath the Align logo", caption: "Dr. Nikita Soni", category: "Dr. Nikita" },
  { src: "/images/doctor/scrubs-standing.jpg", alt: "Dr. Nikita Soni in scrubs", caption: "In the clinic", category: "Dr. Nikita" },
  { src: "/images/doctor/scrubs-desk.jpg", alt: "Dr. Nikita Soni at the consultation desk in scrubs", caption: "Consultation desk", category: "Dr. Nikita" },
  { src: "/images/doctor/reception.jpg", alt: "Dr. Nikita Soni at the reception", caption: "Reception", category: "Dr. Nikita" },
  { src: "/images/doctor/credentials-wall.jpg", alt: "Dr. Nikita Soni in front of her framed certificates", caption: "The certificate wall", category: "Dr. Nikita", wide: true },
  { src: "/images/credentials/mds.jpg", alt: "MDS degree certificate in Orthodontics", caption: "MDS · Orthodontics, 2023", category: "Credentials" },
  { src: "/images/credentials/bds.jpg", alt: "BDS degree certificate", caption: "BDS, 2018", category: "Credentials" },
];

/** Every continuing-education certificate also appears under "Credentials". */
const certificatePhotos: Photo[] = learning.flatMap((l) =>
  l.images.map((src) => ({ src, alt: `Certificate: ${l.title}`, caption: l.when ? `${l.title} · ${l.when}` : l.title, category: "Credentials" as const })),
);

export const photos = [...all, ...certificatePhotos].filter((p) => SHOW_PATIENT_PHOTOS || !p.hasPatient);
export const galleryCategories = ["All", "Clinic", "Treatment", "Dr. Nikita", "Credentials"] as const;
