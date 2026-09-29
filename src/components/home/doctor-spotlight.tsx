"use client";

/**
 * "Say hello" — a casual, human moment with Dr. Nikita.
 *
 * The photo (Dr. Nikita relaxing on the clinic sofa) is revealed through an
 * arch-shaped window that widens into a full frame as the visitor scrolls,
 * like a door opening onto the room. The framed certificates behind her are
 * simply part of the room — the copy never points at them.
 *
 * Next to it: a friendly, first-person-plural introduction, three short
 * phrases patients actually used in their Google reviews, and a live line
 * saying whether the clinic is open right now.
 */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Hand } from "lucide-react";
import { OpenStatus } from "@/components/layout/open-status";
import { doctor } from "@/lib/clinic";

/** Verbatim fragments from the clinic's Google reviews (see reviews-saved.ts). */
const WORDS = [
  { phrase: "very calm, attentive, and thorough", who: "Sherlz Paradise" },
  { phrase: "answered all my questions patiently", who: "Divya Sahu" },
  { phrase: "much easier than I expected", who: "Reena Devre" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function DoctorSpotlight() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  // Arch window → full frame. Values are percentages of the frame's box.
  const side = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const top = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const clipPath = useTransform([side, top], ([s, t]) =>
    `inset(${t}% ${s}% 0% ${s}% round ${Math.max(28, 999 * (Number(s) / 16))}px ${Math.max(28, 999 * (Number(s) / 16))}px 28px 28px)`,
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1.14, 1]);

  return (
    <section ref={ref} aria-labelledby="hello-title" className="relative overflow-hidden bg-paper py-24 lg:py-32">

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Photo */}
        <figure className="lg:col-span-7">
          <motion.div
            style={reduce ? { borderRadius: 28 } : { clipPath }}
            className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-bone shadow-[0_50px_90px_-50px_rgb(13_50_55/0.55)]"
          >
            <motion.div style={reduce ? undefined : { scale }} className="absolute inset-0">
              <Image
                src="/images/doctor/certificate-wall.jpg"
                alt="Dr. Nikita Soni seated in front of her wall of framed certificates"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-[50%_42%] brightness-[1.08] saturate-[1.03]"
              />
            </motion.div>
            {/* warm light from the top-left, like a window */}
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_18%_0%,rgba(255,244,228,0.32),transparent_60%)]" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent" />
            <span className="absolute bottom-4 left-5 flex items-center gap-2 rounded-full bg-porcelain/90 px-3.5 py-1.5 text-xs font-medium text-ink backdrop-blur">
              <Hand className="size-3.5 text-teal-700" aria-hidden /> Between appointments
            </span>
          </motion.div>
          <figcaption className="mt-3 flex flex-col gap-1.5 label-mono text-ink-mute sm:flex-row sm:justify-between">
            <span>JK Road, Bhopal</span>
            <OpenStatus />
          </figcaption>
        </figure>

        {/* Words */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="label-mono flex items-center gap-3 text-ink-mute">
              <span className="text-ink">03</span>
              <span className="h-px w-10 bg-ink/25" />
              Say hello
            </p>
            <h2 id="hello-title" className="mt-5 text-[clamp(2.3rem,4.6vw,3.9rem)] leading-[1]">
              Pull up a chair. <em className="text-teal-700 italic">She’ll take it from there.</em>
            </h2>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-ink-soft">
              {doctor.yearsOfExperience} years in, {doctor.name} still does the same thing at every first visit:
              sits down, listens to what’s bothering you, and walks you through the plan before anything begins. No
              rush, no jargon — just a clear idea of what happens next.
            </p>
          </motion.div>

          <div className="mt-10">
            <p className="label-mono text-ink-mute">What patients say first</p>
            <ul className="mt-4 space-y-3">
              {WORDS.map((w, i) => (
                <motion.li
                  key={w.who}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease }}
                  className="group flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3"
                >
                  <span className="font-display text-[1.35rem] leading-snug text-ink transition-colors group-hover:text-teal-700">
                    “{w.phrase}”
                  </span>
                  <span className="shrink-0 text-xs text-ink-mute">{w.who.split(" ")[0]}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/book"
              className="group inline-flex items-center gap-3 rounded-full bg-crimson py-3 pr-3 pl-6 font-medium text-white transition hover:bg-crimson-dark"
            >
              Book a first visit
              <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-out-soft group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <Link href="/about" className="text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-crimson">
              More about Dr. Nikita
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
