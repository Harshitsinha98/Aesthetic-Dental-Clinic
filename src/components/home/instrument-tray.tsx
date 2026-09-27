"use client";

/**
 * "The instrument tray": the clinic's own equipment, laid out left to right
 * like a sterile tray. On desktop the vertical scroll drives the tray
 * sideways; on touch it is a native swipe with snap points.
 *
 * Layout notes (desktop):
 *  • The stage is pinned BELOW the sticky site header (top 4.5rem), not at 0,
 *    so the section heading is never hidden behind the header.
 *  • Content is top-aligned and every size is tied to viewport height, so on a
 *    short laptop screen nothing overflows and gets clipped. Secondary text
 *    (spec table, "for you" line) drops out on very short screens.
 *  • The sideways distance is measured from the real track width, so the last
 *    card always lands fully in view at any window size.
 */

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { publishedInstruments, type Instrument } from "@/lib/instruments";

function Card({ item, i }: { item: Instrument; i: number }) {
  return (
    <article className="flex w-[82vw] max-w-[25rem] shrink-0 snap-start flex-col border-l border-white/15 pl-6 sm:w-[24rem] lg:w-[clamp(18rem,25vw,23rem)]">
      <div className="flex items-baseline justify-between label-mono text-teal-300">
        <span>No. {String(i + 1).padStart(2, "0")}</span>
        <span>{item.category}</span>
      </div>
      <div className="relative mt-4 aspect-[4/3] overflow-hidden bg-teal-900 lg:aspect-auto lg:h-[clamp(8rem,27svh,15rem)]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width:1024px) 25vw, 82vw"
          className="object-cover opacity-90 transition duration-700 ease-out-soft hover:scale-105 hover:opacity-100"
        />
      </div>
      <h3 className="mt-5 font-display text-[1.8rem] leading-tight text-porcelain lg:text-[clamp(1.35rem,3.4svh,1.9rem)]">
        {item.name}
      </h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-teal-100/80 lg:[@media(max-height:720px)]:line-clamp-2">
        {item.what}
      </p>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-porcelain lg:[@media(max-height:780px)]:hidden">
        <span className="label-mono mr-2 text-crimson">For you</span>
        {item.why}
      </p>
      <dl className="mt-5 divide-y divide-white/10 border-y border-white/10 text-sm lg:[@media(max-height:940px)]:hidden">
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
  const track = useRef<HTMLDivElement>(null);
  const distance = useRef(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      // Travel exactly far enough for the last card to finish inside the
      // viewport with the same margin the first card starts with.
      const margin = Math.max(20, (window.innerWidth - 1240) / 2);
      distance.current = Math.max(0, el.scrollWidth - el.clientWidth + margin);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const x = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.06) / 0.86));
    return -distance.current * t;
  });

  return (
    <section ref={ref} className="relative bg-teal-950 text-porcelain lg:h-[300vh]" aria-label="Technology in the clinic">
      <div className="lg:sticky lg:top-[4.5rem] lg:flex lg:h-[calc(100svh-4.5rem)] lg:flex-col lg:overflow-hidden">
        <div className="container-page pt-24 lg:pt-[clamp(1.5rem,5svh,3.5rem)]">{header}</div>

        {/* Desktop: scroll-driven */}
        <motion.div
          ref={track}
          style={reduce ? undefined : { x }}
          className="mt-[clamp(1.25rem,4.5svh,3rem)] hidden gap-10 pl-[max(1.25rem,calc((100vw-1240px)/2))] lg:flex"
        >
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

        <div className="container-page mt-auto hidden pt-6 pb-6 lg:block">
          <div className="ruler text-teal-200" aria-hidden />
        </div>
      </div>
    </section>
  );
}
