"use client";

/**
 * Hero. The arch aligns itself once when it comes into view, and the visitor
 * can drag the scrubber underneath to move the teeth back and forth, or press
 * Replay. Everything is sized to the viewport height so the whole hero fits on
 * a laptop screen without the headline wrapping onto a fourth line.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { ArchAlignment } from "@/components/home/arch-alignment";
import { clinic, doctor, telHref } from "@/lib/clinic";

const ease = [0.22, 1, 0.36, 1] as const;

const facts = [
  ["Orthodontist", "BDS · MDS, Orthodontics & Dentofacial Orthopaedics"],
  ["Open all 7 days", "10 am – 2 pm & 5 – 9 pm · Wednesday 10 am – 9 pm"],
  ["Online tokens", "Pick a 15-minute slot, get it on WhatsApp"],
];

export function Hero() {
  const reduce = useReducedMotion();
  const progress = useMotionValue(reduce ? 1 : 0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const range = useRef<HTMLInputElement>(null);
  const played = useRef(false);

  const fill = useTransform(progress, (v) => `${(v * 100).toFixed(2)}%`);
  useMotionValueEvent(progress, "change", (v) => {
    if (range.current) range.current.value = String(Math.round(v * 100));
  });

  useEffect(() => {
    if (reduce) progress.set(1);
    return () => controls.current?.stop();
  }, [reduce, progress]);

  const play = (delay = 0) => {
    controls.current?.stop();
    if (reduce) return progress.set(1);
    progress.set(0);
    controls.current = animate(progress, 1, { duration: 3.4, delay, ease: [0.65, 0, 0.35, 1] });
  };

  return (
    <section className="relative" aria-labelledby="hero-title">
      <div className="container-page grid gap-12 pt-12 pb-10 lg:min-h-[calc(100svh-13rem)] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-[clamp(1.25rem,3svh,2.5rem)]">
        <div className="lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="label-mono text-ink-mute"
          >
            <span className="whitespace-nowrap">Orthodontics · Smile design</span>
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            <span className="whitespace-nowrap">Advanced dentistry</span>
          </motion.p>

          <h1 id="hero-title" className="mt-5 text-[clamp(2.7rem,min(5.3vw,10.5svh),5.6rem)] leading-[0.96]">
            {["Every smile", "has a line it", "wants to follow."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em] lg:whitespace-nowrap">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease }}
                >
                  {i === 1 ? (
                    <>
                      has a <em className="text-teal-700 italic">line</em> it
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-[clamp(1.25rem,3.5svh,2rem)] flex max-w-lg items-start gap-4 sm:items-center"
          >
            <Link href="/about" className="relative mt-1 block h-[5.25rem] w-16 shrink-0 overflow-hidden rounded-t-full bg-paper ring-1 ring-ink/10 sm:mt-0 sm:h-[4.5rem] sm:w-14" aria-label={`About ${doctor.name}`}>
              <Image src="/images/doctor/portrait-desk.jpg" alt="" fill priority sizes="64px" className="scale-[1.6] object-cover object-[50%_78%]" />
            </Link>
            <p className="text-[1.02rem] leading-relaxed text-ink-soft">
              {clinic.name} is the practice of <strong className="font-semibold text-ink">{doctor.name}</strong>, an orthodontist
              in Bhopal — braces, clear aligners and smile design, with complete dental care alongside.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62, ease }}
            className="mt-[clamp(1.5rem,4svh,2.25rem)] grid gap-3 sm:flex sm:flex-wrap sm:items-center"
          >
            <Link
              href="/book"
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-crimson py-3.5 pr-3.5 pl-6 font-medium text-white transition hover:bg-crimson-dark sm:justify-start"
            >
              Book a token
              <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-out-soft group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <a href={telHref()} className="rounded-full border border-ink/15 px-6 py-3.5 text-center font-medium transition hover:border-ink">
              Call {clinic.phoneDisplay}
            </a>
          </motion.div>
        </div>

        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease }}
          onViewportEnter={() => {
            if (played.current) return;
            played.current = true;
            play(0.7);
          }}
          viewport={{ once: true, amount: 0.4 }}
          className="lg:col-span-6"
        >
          <div className="relative border border-ink/10 bg-porcelain p-3 shadow-[0_40px_80px_-50px_rgb(13_50_55/0.45)] sm:p-4">
            <div className="ruler absolute inset-x-0 -top-px text-ink" aria-hidden />
            <div className="bg-[linear-gradient(180deg,#f7f5ef,#fbfaf7)] lg:mx-auto lg:max-w-[min(100%,calc((100svh-17rem)*1.7))]">
              <ArchAlignment progress={progress} />
            </div>
          </div>

          {/* Scrubber */}
          <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-3 sm:flex sm:gap-4">
            <span className="label-mono text-ink-mute">Crowded</span>
            <div className="relative h-11 flex-1 touch-none sm:h-9">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/15" />
              <div className="ruler absolute inset-x-0 top-1/2 -translate-y-full text-ink" aria-hidden />
              <motion.div className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-crimson" style={{ width: fill }} />
              <motion.span
                aria-hidden
                className="absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-porcelain shadow-[0_2px_8px_rgb(15_26_27/0.25)] ring-1 ring-ink/15"
                style={{ left: fill }}
              >
                <span className="size-2 rounded-full bg-crimson" />
              </motion.span>
              <input
                ref={range}
                type="range"
                min={0}
                max={100}
                step={1}
                defaultValue={reduce ? 100 : 0}
                aria-label="Drag to move the teeth between crowded and aligned"
                onPointerDown={() => controls.current?.stop()}
                onInput={(e) => {
                  controls.current?.stop();
                  progress.set(Number(e.currentTarget.value) / 100);
                }}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
            <span className="label-mono text-ink">Aligned</span>
            <button
              type="button"
              onClick={() => play()}
              className="col-span-3 inline-flex items-center justify-self-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 label-mono sm:col-auto sm:px-3 sm:py-1.5 text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <RotateCcw className="size-3" /> Replay
            </button>
          </div>
          <figcaption className="sr-only">
            An upper dental arch moving from crowded to aligned, as braces or aligners would do over the course of treatment.
          </figcaption>
        </motion.figure>
      </div>

      <div className="container-page">
        <dl className="grid border-t border-ink/10 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="border-b border-ink/10 py-5 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
              <dt className="label-mono text-ink-mute">{k}</dt>
              <dd className="mt-1.5 text-sm text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
