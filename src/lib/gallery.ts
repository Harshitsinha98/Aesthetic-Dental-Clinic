/**
 * Clinic photographs published on the site.
 *
 * `hasPatient` marks frames where a patient is visible in the chair. Set
 * SHOW_PATIENT_PHOTOS to false to drop them everywhere at once if consent is
 * not on file.
 */

import { learning } from "./clinic";

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
  // Dr. Nikita — upright, current photos first
  { src: "/images/doctor/certificate-wall.jpg", alt: "Dr. Nikita Soni seated in front of her wall of framed certificates", caption: "Dr. Nikita Soni", category: "Dr. Nikita", wide: true },
  { src: "/images/doctor/reception-standing.jpg", alt: "Dr. Nikita Soni at the reception desk", caption: "At reception", category: "Dr. Nikita" },
  { src: "/images/doctor/sofa.jpg", alt: "Dr. Nikita Soni in the clinic lounge", caption: "In the lounge", category: "Dr. Nikita" },
  { src: "/images/doctor/portrait-desk.jpg", alt: "Dr. Nikita Soni at her desk beneath the Align logo", caption: "At her desk", category: "Dr. Nikita" },
  { src: "/images/doctor/scrubs-standing.jpg", alt: "Dr. Nikita Soni in scrubs", caption: "In the clinic", category: "Dr. Nikita" },
  { src: "/images/doctor/scrubs-desk.jpg", alt: "Dr. Nikita Soni at the consultation desk in scrubs", caption: "Consultation desk", category: "Dr. Nikita" },
  { src: "/images/doctor/sofa-2.jpg", alt: "Dr. Nikita Soni in the clinic lounge", caption: "A quiet moment", category: "Dr. Nikita" },

  // Clinic
  { src: "/images/clinic/signboard.jpg", alt: "Align Aesthetic Dental Hub signboard on JK Road", caption: "The signboard, JK Road", category: "Clinic", wide: true },
  { src: "/images/clinic/reception-desk.jpg", alt: "Reception desk in front of the illuminated tooth-shaped wall", caption: "Reception", category: "Clinic" },
  { src: "/images/clinic/reception-wide.jpg", alt: "Reception and the tooth-shaped LED wall", caption: "The reception wall", category: "Clinic" },
  { src: "/images/clinic/lounge-window.jpg", alt: "Clinic waiting lounge with a window and sofa", caption: "The waiting lounge", category: "Clinic" },
  { src: "/images/clinic/entrance.jpg", alt: "Clinic entrance with the Align signboard above", caption: "Entrance", category: "Clinic" },
  { src: "/images/clinic/exterior.jpg", alt: "Front of the clinic building on JK Road", caption: "From the street", category: "Clinic" },
  { src: "/images/clinic/signboard-nameplate.jpg", alt: "Signboard and the Matru Chhaya, New Minal A-6 nameplate", caption: "A-6, New Minal", category: "Clinic" },
  { src: "/images/clinic/operatory.jpg", alt: "Treatment chair with overhead light and instrument delivery", caption: "Treatment room", category: "Clinic" },
  { src: "/images/clinic/tooth-sign-night.jpg", alt: "Illuminated tooth-shaped sign at night", caption: "The tooth sign, after dark", category: "Clinic" },
  { src: "/images/clinic/logo-wall.jpg", alt: "Gold Align Aesthetic logo on the consultation room wall", caption: "Consultation room wall", category: "Clinic" },

  // Treatment (with patients)
  { src: "/images/clinic/camera-on-screen.jpg", alt: "Examination with the intraoral camera image on the chairside screen", caption: "Intraoral camera on screen", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/examination.jpg", alt: "Dr. Nikita Soni examining a patient with an assistant", caption: "In examination", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/treatment-chair.jpg", alt: "Dr. Nikita Soni treating a patient in the chair", caption: "In treatment", category: "Treatment", hasPatient: true },
  { src: "/images/clinic/consultation.jpg", alt: "Dr. Nikita Soni in consultation at her desk", caption: "Consultation", category: "Treatment", hasPatient: true },
];

/** Every continuing-education certificate also appears under "Credentials". */
const certificatePhotos: Photo[] = learning.flatMap((l) =>
  l.images.map((src) => ({ src, alt: `Certificate: ${l.title}`, caption: l.when ? `${l.title} · ${l.when}` : l.title, category: "Credentials" as const })),
);

export const photos = [...all, ...certificatePhotos].filter((p) => SHOW_PATIENT_PHOTOS || !p.hasPatient);
export const galleryCategories = ["All", "Clinic", "Treatment", "Dr. Nikita", "Credentials"] as const;
