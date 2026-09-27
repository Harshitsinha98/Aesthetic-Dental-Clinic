import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { clinic, doctor } from "@/lib/clinic";
import { treatmentBySlug, treatments } from "@/lib/treatments";

export function generateStaticParams() {
  return treatments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = treatmentBySlug((await params).slug);
  if (!t) return {};
  return {
    title: `${t.name} in Bhopal`,
    description: `${t.short} ${t.name} by ${doctor.name}, ${doctor.qualifications}, at ${clinic.name}.`,
    alternates: { canonical: `/treatments/${t.slug}` },
  };
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = treatmentBySlug((await params).slug);
  if (!t) notFound();
  const idx = treatments.indexOf(t);
  const next = treatments[(idx + 1) % treatments.length];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="border-b border-ink/10">
        <div className="container-page grid gap-10 pt-14 pb-14 lg:grid-cols-12 lg:pt-20">
          <Reveal className="lg:col-span-7">
            <Link href="/treatments" className="inline-flex items-center gap-2 label-mono text-ink-mute hover:text-ink"><ArrowLeft className="size-3.5" /> Treatments</Link>
            <p className="mt-8 label-mono text-ink-mute">{t.no} · {t.kind}</p>
            <h1 className="mt-4 text-[clamp(2.8rem,7vw,6rem)] leading-[0.95]">{t.name}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{t.short}</p>
          </Reveal>
          <Reveal className="relative aspect-[4/5] overflow-hidden bg-paper lg:col-span-4 lg:col-start-9" scale>
            <Image src={t.image} alt="" fill priority sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </header>

      <div className="container-page grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="text-3xl">What it is</h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-soft">{t.intro}</p>
          </Reveal>

          <Reveal className="mt-16">
            <h2 className="text-3xl">How it goes</h2>
          </Reveal>
          <RevealGroup as="ol" className="mt-6">
            {t.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-ink/10 py-5">
                <span className="font-display text-2xl text-teal-700">{i + 1}</span>
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </RevealGroup>

          <Reveal className="mt-16">
            <h2 className="text-3xl">Questions patients ask</h2>
            <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {t.faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium">
                    {f.q}
                    <span className="text-xl text-ink-mute transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-28">
            <Reveal className="border border-ink/10 bg-paper/60 p-7">
              <p className="label-mono text-ink-mute">Often suits</p>
              <ul className="mt-4 space-y-3">
                {t.forWhom.map((w) => (
                  <li key={w} className="flex gap-3 text-[0.95rem]">
                    <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-crimson" />
                    {w}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink-mute">
                Only an examination can say what is right for you. {doctor.name}, {doctor.qualifications}.
              </p>
              <Link href="/book" className="mt-6 flex items-center justify-between rounded-full bg-crimson px-5 py-3.5 font-medium text-white transition hover:bg-crimson-dark">
                Book a consultation <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </aside>
      </div>

      <Link href={`/treatments/${next.slug}`} className="group block border-t border-ink/10 bg-teal-950 text-porcelain">
        <div className="container-page flex items-center justify-between gap-6 py-14">
          <div>
            <p className="label-mono text-teal-300">Next · {next.no}</p>
            <p className="mt-2 font-display text-[clamp(2rem,5vw,4rem)] leading-none transition-transform duration-500 group-hover:translate-x-3">{next.name}</p>
          </div>
          <ArrowUpRight className="size-10 transition-transform duration-500 group-hover:rotate-45" />
        </div>
      </Link>
    </article>
  );
}
