"use client";

/**
 * Doctor spotlight — a full-bleed, cinematic band built around the photo of
 * Dr. Nikita in front of her wall of framed certificates.
 *
 * The certificate wall is the proof behind the "orthodontist" claim, so it is
 * given a dark, gallery-lit treatment: the photo sits under a soft top-down
 * "spotlight" glow, brightens and settles as it scrolls into view, and a short
 * caption plus a few credential facts sit alongside. Purely presentational;
 * degrades to a static, visible image with reduced motion.
 */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { doctor } from "@/lib/clinic";

const CREDENTIALS = [
  ["BDS", "People’s University, Bhopal"],
  ["MDS", "Orthodontics & Dentofacial Orthopaedics"],
  ["9+", "framed certifications & courses"],
];

export function DoctorSpotlight() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // The photo drifts up a touch and the spotlight blooms as the band enters.
  const y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const glow = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const dim = useTransform(scrollYProgress, [0.1, 0.55], [1.15, 1]); // slight brighten-in
  const brightness = useTransform(dim, (v) => `brightness(${v})`);

  return (
    <section
      ref={ref}
      aria-labelledby="spotlight-title"
      className="relative overflow-hidden bg-teal-950 text-porcelain"
    >
      {/* Full-bleed photo (z-0, above the section's own background) */}
      <motion.div style={reduce ? undefined : { y, filter: brightness }} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src="/images/doctor/credentials-wall.jpg"
          alt="Dr. Nikita Soni seated in front of her wall of framed dental certificates"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] lg:object-[72%_center]"
        />
      </motion.div>

      {/* The spotlight cone */}
      <motion.div
        aria-hidden
        style={reduce ? { opacity: 0.9 } : { opacity: glow }}
        className="absolute inset-0 z-[1] bg-[radial-gradient(70%_55%_at_74%_16%,rgba(255,251,240,0.30),transparent_62%)]"
      />
      {/* Left-to-right + bottom ink wash so the text is always legible over the photo */}
      <div aria-hidden className="absolute inset-0 z-[1] bg-gradient-to-r from-teal-950 via-teal-950/80 to-teal-950/5 lg:to-transparent" />
      <div aria-hidden className="absolute inset-0 z-[1] bg-gradient-to-t from-teal-950/85 via-transparent to-teal-950/45" />

      <div className="container-page relative z-10 flex min-h-[78svh] flex-col justify-end py-16 lg:min-h-[88svh] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="label-mono flex items-center gap-3 text-teal-300">
            <span className="text-porcelain">03</span>
            <span className="h-px w-10 bg-teal-300/50" />
            The proof on the wall
          </p>
          <h2 id="spotlight-title" className="mt-5 text-[clamp(2.2rem,5vw,4.2rem)] leading-[1]">
            Every frame behind her is a <em className="text-[#f0c9cf] italic">reason to trust her.</em>
          </h2>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-teal-100/85">
            {doctor.name} — {doctor.qualifications}. Degrees, national-conference certificates and hands-on
            courses in orthodontics, aligners, implants and laser dentistry, earned and displayed with pride.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {CREDENTIALS.map(([big, small]) => (
              <div key={small}>
                <dt className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-none text-porcelain">{big}</dt>
                <dd className="mt-1.5 text-[0.8rem] leading-snug text-teal-100/70">{small}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/about"
            className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-porcelain py-3 pr-3 pl-6 font-medium text-ink transition hover:bg-white"
          >
            Meet Dr. Nikita
            <span className="grid size-7 place-items-center rounded-full bg-crimson text-white transition-transform duration-500 ease-out-soft group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
