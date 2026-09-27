"use client";

/**
 * "The instrument tray": the clinic's own equipment, laid out left to right
 * like a sterile tray. On desktop the vertical scroll drives the tray
 * sideways; on touch it is a native swipe with snap points.
 */

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { publishedInstruments, type Instrument } from "@/lib/instruments";

function Card({ item, i }: { item: Instrument; i: number }) {
  return (
    <article className="flex w-[82vw] max-w-[25rem] shrink-0 snap-start flex-col border-l border-white/15 pl-6 sm:w-[24rem]">
      <div className="flex items-baseline justify-between label-mono text-teal-300">
        <span>No. {String(i + 1).padStart(2, "0")}</span>
        <span>{item.category}</span>
      </div>
      <div className="relative mt-4 aspect-[4/3] overflow-hidden bg-teal-900">
        <Image src={item.image} alt={item.name} fill sizes="400px" className="object-cover opacity-90 transition duration-700 ease-out-soft hover:scale-105 hover:opacity-100" />
      </div>
      <h3 className="mt-6 font-display text-[1.9rem] leading-tight text-porcelain">{item.name}</h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-teal-100/80">{item.what}</p>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-porcelain">
        <span className="label-mono mr-2 text-crimson">For you</span>
        {item.why}
      </p>
      <dl className="mt-5 divide-y divide-white/10 border-y border-white/10 text-sm">
        {item.spec.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-teal-300">{k}</dt>
            <dd className="text-right text-teal-50">{v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function InstrumentTray({ header }: { header: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-72%"]);

  return (
    <section ref={ref} className="relative bg-teal-950 text-porcelain lg:h-[320vh]" aria-label="Technology in the clinic">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="container-page pt-24 lg:pt-10">{header}</div>

        {/* Desktop: scroll-driven */}
        <motion.div style={reduce ? undefined : { x }} className="mt-14 hidden gap-10 pl-[max(1.25rem,calc((100vw-1240px)/2))] lg:flex">
          {publishedInstruments.map((item, i) => (
            <Card key={item.id} item={item} i={i} />
          ))}
        </motion.div>

        {/* Touch: swipe */}
        <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-24 [scrollbar-width:none] lg:hidden">
          {publishedInstruments.map((item, i) => (
            <Card key={item.id} item={item} i={i} />
          ))}
        </div>

        <div className="container-page mt-10 hidden pb-10 lg:block">
          <div className="ruler text-teal-200" aria-hidden />
        </div>
      </div>
    </section>
  );
}
