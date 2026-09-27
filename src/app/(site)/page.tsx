import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClinicFrames } from "@/components/home/clinic-frames";
import { DoctorIntro } from "@/components/home/doctor-intro";
import { Hero } from "@/components/home/hero";
import { InstrumentTray } from "@/components/home/instrument-tray";
import { TokenCta } from "@/components/home/token-cta";
import { TreatmentIndex } from "@/components/home/treatment-index";
import { Visit } from "@/components/home/visit";
import { GoogleReviews } from "@/components/reviews/google-reviews";
import { SectionHead } from "@/components/ui/section-head";
import { clinic } from "@/lib/clinic";

export const revalidate = 21600;

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* 01 — statement */}
      <section className="bg-teal-950 py-20 text-porcelain lg:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <p className="label-mono text-teal-300 lg:col-span-3">01 — The practice</p>
          <p className="font-display text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[1.15] lg:col-span-9">
            An orthodontic practice first — braces, aligners and the shape of a smile — with implants, root canals,
            laser and everyday dentistry under the same roof. <span className="text-teal-300">{clinic.tagline}</span>
          </p>
        </div>
      </section>

      <DoctorIntro />

      {/* 03 — treatments */}
      <section className="py-24 lg:py-32" aria-labelledby="treat-title">
        <div className="container-page">
          <SectionHead
            index="03"
            label="Treatments"
            title={<span id="treat-title">What we do, <em className="text-teal-700 italic">in order of what we do most.</em></span>}
            lede="Every plan starts with an examination and a clear explanation of the options — including when nothing needs doing yet."
          />
          <div className="mt-14">
            <TreatmentIndex />
          </div>
        </div>
      </section>

      <InstrumentTray
        header={
          <SectionHead
            tone="dark"
            index="04"
            label="The instrument tray"
            title={<>Equipment photographed <em className="text-teal-300 italic">in this clinic</em>, not a catalogue.</>}
            lede="What each device is, and what it changes for you in the chair."
          />
        }
      />

      <TokenCta />

      {/* 06 — clinic + reviews */}
      <section className="border-t border-ink/10 py-24 lg:py-32">
        <div className="container-page">
          <SectionHead
            index="06"
            label="The clinic & what patients say"
            title={<>A calm room on <em className="text-teal-700 italic">JK Road.</em></>}
          />
          <div className="mt-14">
            <ClinicFrames />
          </div>
          <div className="mt-8 flex justify-end">
            <Link href="/gallery" className="group inline-flex items-center gap-2 font-medium">
              <span className="border-b border-ink pb-0.5">See the whole clinic</span>
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </Link>
          </div>
          <div className="mt-24">
            <GoogleReviews />
          </div>
        </div>
      </section>

      <Visit />
    </>
  );
}
