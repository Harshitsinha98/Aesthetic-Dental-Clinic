import type { Metadata } from "next";
import Image from "next/image";
import { Visit } from "@/components/home/visit";
import { PageIntro } from "@/components/ui/section-head";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Visit — address, hours & directions",
  description: "Align Aesthetic Dental Hub, Gate No. 3, A-6, JK Road, New Minal Residency, Bhopal 462023. Open all 7 days: 10 am–2 pm and 5–9 pm; Wednesday 10 am–9 pm. Call +91 74770 03741.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageIntro label="Visit" title={<>Find the <em className="text-teal-700 italic">tooth-shaped sign.</em></>} lede="Look for the ALIGN signboard above the entrance at A-6, opposite Gate No. 3 of New Minal Residency." />
      <section className="container-page grid gap-6 pt-14 sm:grid-cols-2">
        <Reveal className="relative aspect-[16/7] overflow-hidden bg-paper sm:col-span-2">
          <Image src="/images/clinic/signboard.jpg" alt="The Align Aesthetic Dental Hub signboard" fill priority sizes="100vw" className="object-cover" />
        </Reveal>
      </section>
      <Visit index="01" />
    </>
  );
}
