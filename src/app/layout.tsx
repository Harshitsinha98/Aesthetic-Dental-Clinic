import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { clinic, doctor } from "@/lib/clinic";
import { treatments } from "@/lib/treatments";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

const title = "Align Aesthetic Dental Hub — Orthodontist & Dentist in Bhopal | Dr. Nikita Soni";
const description =
  "Braces, clear aligners, smile design, implants, root canal and laser dentistry by Dr. Nikita Soni, BDS, MDS (Orthodontics), at New Minal Residency, JK Road, Bhopal. Open all 7 days. Book a token online and get it on WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(clinic.siteUrl),
  title: { default: title, template: `%s · ${clinic.shortName}` },
  description,
  applicationName: clinic.name,
  keywords: [
    "orthodontist in Bhopal",
    "dentist in Bhopal",
    "braces Bhopal",
    "clear aligners Bhopal",
    "Invisalign Bhopal",
    "dental clinic JK Road Bhopal",
    "dentist New Minal Residency",
    "smile design Bhopal",
    "dental implants Bhopal",
    "root canal Bhopal",
    "Dr. Nikita Soni",
    "Align Aesthetic Dental Hub",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: clinic.siteUrl,
    siteName: clinic.name,
    title,
    description,
    images: [{ url: "/images/clinic/reception-tooth.jpg", width: 960, height: 1280, alt: "Align Aesthetic Dental Hub reception" }],
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  category: "health",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#072226",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function structuredData() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinic.name,
    slogan: clinic.tagline,
    url: clinic.siteUrl,
    telephone: `+${clinic.phone}`,
    image: `${clinic.siteUrl}/images/clinic/reception-tooth.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gate No. 3, A-6, JK Road, New Minal Residency",
      addressLocality: clinic.city,
      addressRegion: clinic.region,
      postalCode: clinic.postalCode,
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days.filter((d) => d !== "Wednesday"),
        opens: "10:00",
        closes: "14:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days.filter((d) => d !== "Wednesday"),
        opens: "17:00",
        closes: "21:00",
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "10:00", closes: "21:00" },
    ],
    employee: {
      "@type": "Person",
      name: doctor.name,
      jobTitle: "Orthodontist",
      hasCredential: doctor.degrees.map((d) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: `${d.degree}, ${d.field}`,
        recognizedBy: { "@type": "CollegeOrUniversity", name: d.university },
      })),
    },
    availableService: treatments.map((t) => ({ "@type": "MedicalProcedure", name: t.name, description: t.short })),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${hanken.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
        {children}
      </body>
    </html>
  );
}
