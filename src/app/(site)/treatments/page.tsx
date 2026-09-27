import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui/section-head";
import { Reveal } from "@/components/ui/reveal";
import { treatments } from "@/lib/treatments";

export const metadata: Metadata = {
  title: "Treatments — braces, aligners, smile design, implants",
  description: "Orthodontics, clear aligners, smile design, dental implants, root canal treatment, laser dentistry and zirconia crowns at Align Aesthetic Dental Hub, Bhopal.",
  alternates: { canonical: "/treatments" },
};

export default function TreatmentsPage() {
  return (
    <>
      <PageIntro
        label="Treatments"
        title={<>Orthodontics at the centre. <em className="text-teal-700 italic">Complete dentistry around it.</em></>}
        lede="Each page below explains what a treatment is, who it tends to suit and what the visits look like — so you arrive at your consultation already knowing the right questions."
      />
      <div className="container-page py-16 lg:py-24">
        {treatments.map((t, i) => (
          <Reveal key={t.slug} as="article" className="border-b border-ink/10 py-12 first:pt-0">
            <Link href={`/treatments/${t.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className={`relative aspect-[4/3] overflow-hidden bg-paper lg:col-span-4 ${i % 2 ? "lg:order-2 lg:col-start-9" : ""}`}>
                <Image src={t.image} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 ease-out-soft group-hover:scale-105" />
              </div>
              <div className={`lg:col-span-7 ${i % 2 ? "lg:order-1" : "lg:col-start-6"}`}>
                <p className="label-mono text-ink-mute">{t.no} · {t.kind}</p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-none transition-colors group-hover:text-teal-700">{t.name}</h2>
                <p className="mt-4 max-w-xl text-ink-soft">{t.short}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  <span className="border-b border-ink pb-0.5">Read about {t.name.toLowerCase()}</span>
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
