import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { doctor } from "@/lib/clinic";

export function DoctorIntro() {
  return (
    <section className="border-t border-ink/10 py-24 lg:py-36" aria-labelledby="doctor-title">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-8">
        <Reveal className="relative lg:col-span-5">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-paper">
              <Image
                src="/images/doctor/portrait-desk.jpg"
                alt="Dr. Nikita Soni at her desk beneath the Align Aesthetic logo"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-4 flex justify-between gap-4 border-t border-ink/15 pt-3 label-mono text-ink-mute">
              <span>{doctor.name}</span>
              <span>BDS · MDS</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <Reveal>
            <p className="label-mono flex items-center gap-3 text-ink-mute">
              <span className="text-ink">02</span>
              <span className="h-px w-10 bg-ink/25" />
              The orthodontist
            </p>
            <h2 id="doctor-title" className="mt-5 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">
              She studied what makes a smile look <em className="text-teal-700 italic">right</em>.
            </h2>
            <div className="prose-clinic mt-4 max-w-xl text-[1.02rem]">
              {doctor.bio.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </Reveal>

          <RevealGroup className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {doctor.degrees.map((d) => (
              <div key={d.degree} className="grid gap-2 py-5 sm:grid-cols-[5rem_1fr]">
                <span className="font-display text-3xl text-teal-700">{d.year}</span>
                <div>
                  <p className="font-medium">{d.degree} · {d.field}</p>
                  <p className="mt-1 text-sm text-ink-mute">{d.institution}, {d.university}</p>
                </div>
              </div>
            ))}
          </RevealGroup>

          <Reveal className="mt-8">
            <Link href="/about" className="group inline-flex items-center gap-2 font-medium">
              <span className="border-b border-ink pb-0.5">Training &amp; continuing education</span>
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-soft group-hover:rotate-45" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
