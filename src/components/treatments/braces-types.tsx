/**
 * "Types of braces" — an informative, labelled section for the braces page.
 * Four fixed-brace options plus a pointer to clear aligners, each with its own
 * on-brand SVG (bracket + archwire, tinted to show the difference), a short
 * description and honest pros/cons. Server component.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/ui/reveal";

const TEAL = "#194f53";
const TEAL2 = "#2f7d7a";
const ENAMEL = "#f4f6f3";

function ToothRow({ bracket, wire = TEAL2, lingual = false }: { bracket: string; wire?: string; lingual?: boolean }) {
  const xs = [40, 80, 120, 160];
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-hidden>
      <rect width="200" height="120" fill="none" />
      {/* archwire */}
      {!lingual && <path d="M24 58q76 26 152 0" fill="none" stroke={wire} strokeWidth="2.5" />}
      {xs.map((x) => (
        <path
          key={x}
          transform={`translate(${x} 44) scale(1.15)`}
          d="M0 -22c-9 0 -16 6 -16 15 0 8 3 13 5 20 3 7 3 15 7 15 3 0 3 -11 4 -11s1 11 4 11c4 0 4 -8 7 -15 2 -7 5 -12 5 -20 0 -9 -7 -15 -16 -15z"
          fill={ENAMEL}
          stroke={TEAL}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ))}
      {/* brackets */}
      {lingual
        ? xs.map((x) => <rect key={x} x={x - 5} y={58} width="10" height="7" rx="1.5" fill={TEAL} opacity="0.35" />)
        : xs.map((x, i) => <rect key={x} x={x - 6} y={40 + [4, 8, 8, 4][i]} width="12" height="9" rx="2" fill={bracket} stroke={bracket === "#f4f6f3" ? TEAL : "none"} strokeWidth="1.4" />)}
      {lingual && <path d="M24 62q76 22 152 0" fill="none" stroke={TEAL} strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />}
    </svg>
  );
}

const TYPES = [
  {
    name: "Metal braces",
    art: <ToothRow bracket="#8a9a99" />,
    body: "The classic, most economical option. Stainless-steel brackets and a wire, adjusted over time. Strong and effective for every kind of case.",
    good: "Most affordable · handles complex cases",
    note: "Most visible option",
  },
  {
    name: "Ceramic braces",
    art: <ToothRow bracket="#f4f6f3" wire="#cbb8a0" />,
    body: "Work exactly like metal braces, but the brackets are tooth-coloured ceramic, so they blend in and are far less noticeable.",
    good: "Discreet · as effective as metal",
    note: "Costs a little more · care with staining foods",
  },
  {
    name: "Self-ligating braces",
    art: <ToothRow bracket="#2f7d7a" />,
    body: "Brackets that hold the wire with a built-in clip instead of elastic ties. Often means fewer, quicker adjustment visits.",
    good: "Fewer visits · easier to keep clean",
    note: "Available in metal or ceramic",
  },
  {
    name: "Lingual braces",
    art: <ToothRow bracket="#8a9a99" lingual />,
    body: "Fixed to the inside (tongue side) of the teeth, so they are hidden from the front completely — invisible when you smile.",
    good: "Completely hidden",
    note: "For suitable cases · a short adjustment period",
  },
];

export function BracesTypes() {
  return (
    <section className="border-t border-ink/10 bg-paper py-16 lg:py-24" aria-labelledby="braces-types">
      <div className="container-page">
        <Reveal>
          <p className="label-mono text-ink-mute">Which braces?</p>
          <h2 id="braces-types" className="mt-3 text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]">
            Four kinds of braces, <em className="text-teal-700 italic">one right for you.</em>
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            All of them straighten teeth the same way — steady, gentle pressure over time. They differ in how visible they are and
            what they cost. Dr. Nikita will recommend the best fit at your consultation.
          </p>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2">
          {TYPES.map((t) => (
            <article key={t.name} className="flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white">
              <div className="border-b border-ink/10 bg-[linear-gradient(180deg,#f7f5ef,#eef6f2)] px-6 pt-4">{t.art}</div>
              <div className="p-6">
                <h3 className="font-display text-2xl text-teal-800">{t.name}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{t.body}</p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-teal-700">Best for</dt>
                    <dd className="text-ink-soft">{t.good}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-ink-mute">Note</dt>
                    <dd className="text-ink-mute">{t.note}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </RevealGroup>

        <Reveal className="mt-6">
          <Link
            href="/treatments/clear-aligners"
            className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-teal-950 p-6 text-porcelain lg:p-8"
          >
            <div>
              <p className="label-mono text-teal-300">Prefer no braces at all?</p>
              <p className="mt-2 font-display text-2xl lg:text-3xl">Invisalign / clear aligners — invisible &amp; removable</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-medium text-ink transition group-hover:bg-white">
              See clear aligners <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
