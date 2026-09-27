"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { ArchAlignment } from "@/components/home/arch-alignment";
import { clinic, doctor, telHref } from "@/lib/clinic";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = reduce ? still : scrollYProgress;
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section ref={ref} className="relative lg:h-[230vh]" aria-labelledby="hero-title">
      <div className="lg:sticky lg:top-[4.5rem] lg:flex lg:h-[calc(100svh-4.5rem)] lg:items-center">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-0">
          <div className="lg:col-span-5 lg:self-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
              className="label-mono text-ink-mute"
            >
              Orthodontics · Smile design · Advanced dentistry
            </motion.p>

            <h1 id="hero-title" className="mt-6 text-[clamp(2.9rem,6.4vw,5.6rem)] leading-[0.95]">
              {["Every smile", "has a line it", "wants to follow."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease }}
                  >
                    {i === 1 ? (
                      <>
                        has a <em className="font-display text-teal-700 italic">line</em> it
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease }}
              className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-ink-soft"
            >
              {clinic.name} is the practice of <strong className="font-semibold text-ink">{doctor.name}</strong>,
              an orthodontist in Bhopal. Braces, clear aligners and smile design, with complete dental care alongside.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/book"
                className="group inline-flex items-center gap-3 rounded-full bg-crimson py-3.5 pr-3.5 pl-6 font-medium text-white transition hover:bg-crimson-dark"
              >
                Book a token
                <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-out-soft group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <a href={telHref()} className="rounded-full border border-ink/15 px-6 py-3.5 font-medium transition hover:border-ink">
                Call {clinic.phoneDisplay}
              </a>
            </motion.div>

            <motion.div style={{ opacity: hintOpacity }} className="mt-12 hidden items-center gap-3 label-mono text-ink-mute lg:flex">
              <ArrowDown className="size-3.5 animate-bounce" /> Scroll to align
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="relative lg:col-span-7"
          >
            <div className="relative rounded-[2px] border border-ink/10 bg-paper/60 p-3 sm:p-5">
              <div className="ruler absolute inset-x-0 -top-px text-ink" aria-hidden />
              <MobileAutoplay progress={progress} reduce={!!reduce} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * On desktop the arch is scroll-linked inside the sticky stage. On small
 * screens the stage is not sticky, so the arch animates on its own once shown.
 */
function MobileAutoplay({ progress, reduce }: { progress: ReturnType<typeof useMotionValue<number>>; reduce: boolean }) {
  const auto = useMotionValue(reduce ? 1 : 0);
  const desktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
  return (
    <>
      <div className="hidden lg:block">
        <ArchAlignment progress={progress} />
      </div>
      <motion.div
        className="lg:hidden"
        onViewportEnter={() => {
          if (reduce || desktop) return;
          const start = performance.now();
          const step = (t: number) => {
            const p = Math.min((t - start) / 3200, 1);
            auto.set(1 - Math.pow(1 - p, 3));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <ArchAlignment progress={auto} />
      </motion.div>
    </>
  );
}
