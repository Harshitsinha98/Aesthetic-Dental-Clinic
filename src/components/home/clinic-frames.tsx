"use client";

/** A parallax strip of clinic photographs, each frame moving at its own rate. */

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const frames = [
  { src: "/images/clinic/reception-tooth.jpg", caption: "Reception", speed: -60, className: "lg:col-span-4 lg:row-span-2 aspect-[3/4]" },
  { src: "/images/clinic/operatory.jpg", caption: "Treatment room", speed: 40, className: "lg:col-span-3 aspect-[3/4] lg:mt-24" },
  { src: "/images/clinic/entrance.jpg", caption: "Entrance", speed: -20, className: "lg:col-span-5 aspect-[4/3]" },
  { src: "/images/clinic/counter.jpg", caption: "Instrument counter", speed: 70, className: "lg:col-span-3 lg:col-start-6 aspect-square" },
  { src: "/images/clinic/tooth-sign-night.jpg", caption: "After dark", speed: -40, className: "lg:col-span-4 aspect-[4/5]" },
];

function Frame({ f, i }: { f: (typeof frames)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [f.speed, -f.speed]);
  return (
    <motion.figure ref={ref} style={reduce ? undefined : { y }} className={f.className}>
      <div className="relative h-full w-full overflow-hidden bg-paper">
        <Image src={f.src} alt={f.caption} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <figcaption className="mt-2 flex justify-between label-mono text-ink-mute">
        <span>{f.caption}</span>
        <span>{String(i + 1).padStart(2, "0")}</span>
      </figcaption>
    </motion.figure>
  );
}

export function ClinicFrames() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
      {frames.map((f, i) => (
        <Frame key={f.src} f={f} i={i} />
      ))}
    </div>
  );
}
