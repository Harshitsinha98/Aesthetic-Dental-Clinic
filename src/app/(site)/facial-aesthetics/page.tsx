import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { ProfileArt } from "@/components/aesthetics/profile-art";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { clinic, doctor, learning, telHref, whatsappHref } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Facial Aesthetics — coming soon",
  description:
    "Facial aesthetic treatments are coming soon to Align Aesthetic Dental Hub, Bhopal — planned alongside smile design by Dr. Nikita Soni, who holds a PG Diploma in Clinical Cosmetology.",
  alternates: { canonical: "/facial-aesthetics" },
};

/**
 * Areas the clinic is preparing, described in general terms only. Nothing
 * here is on offer yet, so no results, prices or timelines are claimed.
 */
const PLANNED = [
  { no: "01", name: "Anti-wrinkle treatment", body: "Softening expression lines on the forehead and around the eyes." },
  { no: "02", name: "Dermal fillers", body: "Restoring volume and definition to lips, smile lines and jawline." },
  { no: "03", name: "Lip enhancement", body: "Shape and balance planned together with the smile beneath." },
  { no: "04", name: "Gummy-smile correction", body: "Reducing how much gum shows when you smile." },
  { no: "05", name: "Skin rejuvenation", body: "Treatments for texture, tone and a fresher-looking complexion." },
  { no: "06", name: "Hair & scalp care", body: "Trichology-based assessment and treatment for thinning hair." },
];

export default function FacialAestheticsPage() {
  const training = learning.filter((l) => l.category === "Facial aesthetics");
  const interest = `Hello, I'd like to know when facial aesthetic treatments start at ${clinic.name}.`;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-teal-950 text-porcelain">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,rgba(232,86,110,0.14),transparent_70%)]" />
        <div className="container-page relative grid items-center gap-10 py-16 lg:min-h-[calc(100svh-6.5rem)] lg:grid-cols-12 lg:py-10">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 label-mono text-teal-100">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-crimson opacity-70" />
                <span className="relative size-2 rounded-full bg-crimson" />
              </span>
              Coming soon
            </p>
            <h1 className="mt-7 text-[clamp(2.9rem,6.5vw,5.8rem)] leading-[0.95]">
              Beyond the smile, <em className="text-[#f0c9cf] italic">the whole face.</em>
            </h1>
            <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-teal-100/85">
              A smile sits inside a face. Soon, {clinic.shortName} will plan both together — gentle, natural-looking facial
              aesthetic treatments by {doctor.name}, alongside the dentistry you already know.
            </p>
            <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
              <a
                href={whatsappHref(interest)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-3 rounded-full bg-porcelain py-3.5 pr-3.5 pl-6 font-medium text-ink transition hover:bg-white sm:justify-start"
              >
                Tell me when it opens
                <span className="grid size-7 place-items-center rounded-full bg-crimson text-white transition-transform duration-500 ease-out-soft group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </a>
              <a href={telHref()} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-medium transition hover:border-white">
                <Phone className="size-4" /> {clinic.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8 lg:max-w-none">
            <ProfileArt />
          </div>
        </div>
        <div className="ruler text-teal-200" aria-hidden />
      </section>

      {/* What's coming */}
      <section className="py-20 lg:py-28">
        <div className="container-page">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="label-mono flex items-center gap-3 text-ink-mute">
                <span className="text-ink">01</span>
                <span className="h-px w-10 bg-ink/25" />
                What we’re preparing
              </p>
              <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1]">
                Subtle changes, <em className="text-teal-700 italic">planned around your smile.</em>
              </h2>
            </div>
            <p className="text-ink-soft lg:col-span-4 lg:col-start-9">
              The treatments below are being prepared. Every one will start with a consultation to decide whether it suits
              you at all.
            </p>
          </Reveal>
          <RevealGroup as="ul" className="mt-12 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {PLANNED.map((p) => (
              <li key={p.no} className="group border-b border-ink/15 py-7 sm:pr-8 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-8">
                <span className="label-mono text-crimson">{p.no}</span>
                <p className="mt-3 font-display text-[1.7rem] leading-tight transition-colors group-hover:text-teal-700">{p.name}</p>
                <p className="mt-2 text-ink-soft">{p.body}</p>
                <span className="mt-4 inline-block rounded-full bg-paper px-2.5 py-1 label-mono text-ink-mute">Coming soon</span>
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Why a dentist */}
      <section className="border-t border-ink/10 bg-paper py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="label-mono flex items-center gap-3 text-ink-mute">
              <span className="text-ink">02</span>
              <span className="h-px w-10 bg-ink/25" />
              Why here
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4vw,3.2rem)] leading-[1.02]">
              She already studies how a smile <em className="text-teal-700 italic">sits in a face.</em>
            </h2>
            <p className="mt-6 leading-relaxed text-ink-soft">
              Orthodontists work with the proportions of the lips, jaw and lower face every day, and {doctor.name}’s
              postgraduate research was on smile parameters. She has since completed formal training in clinical
              cosmetology and facial aesthetics.
            </p>
          </Reveal>
          <RevealGroup as="ul" className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-6 lg:col-start-7">
            {training.map((t) => (
              <li key={t.title} className="grid gap-1 py-5 sm:grid-cols-[6rem_1fr] sm:gap-6">
                <span className="label-mono text-teal-700">{t.when ?? ""}</span>
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="mt-1 text-sm text-ink-mute">{t.by}</p>
                </div>
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Closing */}
      <section className="py-20 lg:py-24">
        <Reveal className="container-page text-center">
          <p className="label-mono text-ink-mute">Until then</p>
          <p className="mx-auto mt-5 max-w-3xl font-display text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.1]">
            Smile design, aligners and braces are open for booking today.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/book" className="rounded-full bg-crimson px-6 py-3.5 font-medium text-white transition hover:bg-crimson-dark">Book a token</Link>
            <Link href="/treatments/smile-design" className="rounded-full border border-ink/20 px-6 py-3.5 font-medium transition hover:border-ink">About smile design</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
