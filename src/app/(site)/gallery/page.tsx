import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageIntro } from "@/components/ui/section-head";

export const metadata: Metadata = {
  title: "The clinic",
  description: "Photographs of Align Aesthetic Dental Hub on JK Road, Bhopal — reception, treatment rooms, Dr. Nikita Soni and her certificates.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageIntro label="The clinic" title={<>Take a look around <em className="text-teal-700 italic">before you visit.</em></>} />
      <GalleryGrid />
    </>
  );
}
