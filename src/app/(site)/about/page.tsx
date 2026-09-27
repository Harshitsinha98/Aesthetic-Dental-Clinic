import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/ui/section-head";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { doctor, learning } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Dr. Nikita Soni — Orthodontist, BDS, MDS",
  description: "Dr. Nikita Soni, BDS (People’s University, Bhopal) and MDS in Orthodontics & Dentofacial Orthopaedics (K.D. Dental College, Mathura). Braces and aligner specialist at Align Aesthetic Dental Hub.",
  alternates: { canonical: "/about" },
};

const certificates = [
  { src: "/images/credentials/mds.jpg", caption: "MDS · Orthodontics & Dentofacial Orthopaedics" },
  { src: "/images/credentials/bds.jpg", caption: "Bachelor of Dental Surgery" },
  { src: "/images/credentials/ios-best-paper.jpg", caption: "IOS PG Convention — Session’s Best Paper" },
  { src: "/images/credentials/isoi-2024.jpg", caption: "ISOI 30th National Conference" },
  { src: "/images/credentials/laser-2025.jpg", caption: "Laser dentistry — lecture & hands-on" },
  { src: "/images/credentials/coltene-2026.jpg", caption: "Aesthetic & cosmetic dentistry workshop" },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        label={`${doctor.name} · ${doctor.qualifications}`}
        title={<>An orthodontist, <em className="text-teal-700 italic">by specialist training.</em></>}
        lede={doctor.title}
      />

      <section className="container-page grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] bg-paper">
            <Image src="/images/doctor/scrubs-standing.jpg" alt="Dr. Nikita Soni in the clinic" fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <p className="mt-4 border-t border-ink/15 pt-3 label-mono text-ink-mute">{doctor.registration}</p>
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal className="prose-clinic text-[1.05rem]">
            {doctor.bio.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
            <p>
              An orthodontist is a dentist who has completed a further postgraduate specialist degree — the MDS — in the
              diagnosis and correction of misaligned teeth and jaws. That training covers braces, aligners and growth
              guidance in children, and it is why the practice is built around alignment.
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <h2 className="text-3xl">Degrees</h2>
          </Reveal>
          <RevealGroup className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
            {doctor.degrees.map((d) => (
              <div key={d.degree} className="grid gap-2 py-6 sm:grid-cols-[5rem_1fr]">
                <span className="font-display text-3xl text-teal-700">{d.year}</span>
                <div>
                  <p className="font-medium">{d.degree}</p>
                  <p className="text-ink-soft">{d.field}</p>
                  <p className="mt-1 text-sm text-ink-mute">{d.institution} · {d.university}</p>
                  {d.note && <p className="mt-3 text-sm italic text-ink-soft">{d.note}</p>}
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-teal-950 py-20 text-porcelain lg:py-28">
        <div className="container-page">
          <Reveal>
            <p className="label-mono text-teal-300">Continuing education</p>
            <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,3.4rem)] leading-[1.05]">Conferences, courses and hands-on training — from the certificates on the clinic wall.</h2>
          </Reveal>
          <RevealGroup as="ul" className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {learning.map((l) => (
              <li key={l.title} className="grid gap-2 py-5 md:grid-cols-[7rem_1fr_auto] md:items-baseline md:gap-8">
                <span className="label-mono text-teal-300">{l.when ?? "—"}</span>
                <div>
                  <p className="font-medium text-porcelain">{l.title}</p>
                  <p className="mt-1 text-sm text-teal-100/70">{l.by}</p>
                </div>
                {l.highlight && <span className="label-mono text-crimson">★ {l.highlight}</span>}
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <Reveal>
          <p className="label-mono text-ink-mute">Certificates</p>
        </Reveal>
        <RevealGroup className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
          {certificates.map((c) => (
            <figure key={c.src}>
              <div className="relative aspect-[4/5] overflow-hidden border border-ink/10 bg-paper">
                <Image src={c.src} alt={c.caption} fill sizes="(min-width:768px) 30vw, 50vw" className="object-contain p-2" />
              </div>
              <figcaption className="mt-2 text-sm text-ink-mute">{c.caption}</figcaption>
            </figure>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
