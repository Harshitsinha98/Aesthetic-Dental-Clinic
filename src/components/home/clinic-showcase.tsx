"use client";

/**
 * "A day at Align" — the latest clinic shoot as an expanding filmstrip.
 *
 * Desktop: every photo stands side by side as a slim slat; the active one
 * opens wide with its caption, the others fold down. It advances on its own
 * like a day playing out, and hovering, focusing or tapping a slat opens it.
 * Autoplay pauses while the pointer is over the strip, when the strip is off
 * screen, and under prefers-reduced-motion.
 *
 * Phones: a swipeable snap carousel with the same captions and a counter.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type Shot = { src: string; time: string; title: string; note: string; focus?: string };

const SHOTS: Shot[] = [
  { src: "/images/clinic/exterior.jpg", time: "09:55", title: "On JK Road", note: "Look for the tooth-shaped sign at A-6, New Minal Residency.", focus: "50% 45%" },
  { src: "/images/clinic/reception-desk.jpg", time: "10:00", title: "The welcome", note: "Every visit starts at the tooth-shaped front desk.", focus: "55% 40%" },
  { src: "/images/clinic/reception-wide.jpg", time: "10:03", title: "The tooth wall", note: "Open all seven days, from ten in the morning.", focus: "50% 40%" },
  { src: "/images/clinic/lounge-window.jpg", time: "10:08", title: "The waiting lounge", note: "A calm, bright place to wait — rarely for long.", focus: "50% 45%" },
  { src: "/images/doctor/certificate-wall.jpg", time: "10:12", title: "Meet Dr. Nikita", note: "Your orthodontist, in front of the courses she has earned.", focus: "50% 42%" },
  { src: "/images/clinic/examination.jpg", time: "10:18", title: "The check-up", note: "A careful look before any plan is made.", focus: "45% 40%" },
  { src: "/images/clinic/camera-on-screen.jpg", time: "10:25", title: "On the big screen", note: "The intraoral camera puts your own teeth in front of you.", focus: "55% 42%" },
  { src: "/images/clinic/treatment-chair.jpg", time: "10:35", title: "In treatment", note: "Fifteen-minute tokens mean no one is rushed.", focus: "45% 42%" },
  { src: "/images/clinic/operatory.jpg", time: "10:45", title: "The treatment room", note: "Sterile instruments, one patient at a time.", focus: "45% 45%" },
  { src: "/images/doctor/sofa.jpg", time: "14:00", title: "Between appointments", note: "A quiet moment before the evening session.", focus: "55% 45%" },
  { src: "/images/clinic/tooth-sign-night.jpg", time: "21:00", title: "Until tomorrow", note: "Evening tokens run till nine. See you soon.", focus: "50% 45%" },
];

const AUTOPLAY_MS = 3800;
const ease = [0.22, 1, 0.36, 1] as const;

function Filmstrip() {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (hovering || !visible || reduce) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % SHOTS.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, hovering, visible, reduce]);

  return (
    <div ref={ref}>
      <div
        className="flex h-[clamp(24rem,calc(100svh-20rem),38rem)] gap-2"
        onMouseLeave={() => setHovering(false)}
        role="group"
        aria-label="A day at Align — clinic photographs"
      >
        {SHOTS.map((s, i) => {
          const open = i === active;
          return (
            <motion.button
              key={s.src}
              type="button"
              layout
              onMouseEnter={() => {
                setHovering(true);
                setActive(i);
              }}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={open}
              aria-label={`${s.time} · ${s.title}`}
              animate={{ flexGrow: open ? 12 : 1 }}
              transition={{ duration: reduce ? 0 : 0.75, ease }}
              style={{ flexBasis: 0 }}
              className="group relative min-w-0 overflow-hidden rounded-[18px] bg-bone text-left focus-visible:outline-offset-2"
            >
              <Image
                src={s.src}
                alt={`${s.title} — ${s.note}`}
                fill
                loading="eager"
                sizes="(min-width: 1024px) 60vw, 10vw"
                className={cn(
                  "object-cover transition-[transform,filter] duration-[900ms] ease-out-soft",
                  open ? "scale-100 saturate-100" : "scale-[1.18] saturate-[0.55] brightness-[0.8] group-hover:brightness-95",
                )}
                style={{ objectPosition: s.focus }}
              />
              <span aria-hidden className={cn("absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-950/10 to-transparent transition-opacity duration-700", open ? "opacity-100" : "opacity-60")} />

              {/* folded slat: vertical time */}
              <span
                className={cn(
                  "absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] tracking-[0.2em] text-porcelain/85 transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180",
                  open ? "opacity-0" : "opacity-100",
                )}
              >
                {s.time}
              </span>

              {/* open slide: caption */}
              <motion.span
                initial={false}
                animate={{ opacity: open ? 1 : 0, y: open ? 0 : 16 }}
                transition={{ duration: 0.5, delay: open ? 0.3 : 0, ease }}
                className="absolute inset-x-0 bottom-0 block p-6 text-porcelain xl:p-7"
              >
                <span className="label-mono text-teal-200">
                  {s.time} · {String(i + 1).padStart(2, "0")} / {SHOTS.length}
                </span>
                <span className="mt-2 block font-display text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none whitespace-nowrap">{s.title}</span>
                <span className="mt-2 block max-w-sm text-[0.95rem] text-teal-50/90">{s.note}</span>
              </motion.span>

              {/* autoplay progress */}
              {open && !reduce && (
                <motion.span
                  key={`${active}-${hovering}`}
                  aria-hidden
                  className="absolute top-0 left-0 h-[3px] bg-crimson"
                  initial={{ width: "0%" }}
                  animate={{ width: hovering || !visible ? "0%" : "100%" }}
                  transition={{ duration: hovering || !visible ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PhoneCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
    setIndex(Math.round(el.scrollLeft / (w + 12)));
  }, []);

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="A day at Align — clinic photographs"
      >
        {SHOTS.map((s, i) => (
          <figure key={s.src} className="relative aspect-[3/4] w-[80%] shrink-0 snap-start overflow-hidden rounded-[18px] bg-teal-900">
            <Image src={s.src} alt={`${s.title} — ${s.note}`} fill sizes="80vw" className="object-cover" style={{ objectPosition: s.focus }} priority={i < 2} />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-teal-950/85 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-porcelain">
              <span className="label-mono text-teal-200">{s.time}</span>
              <span className="mt-1.5 block font-display text-[1.7rem] leading-none">{s.title}</span>
              <span className="mt-1.5 block text-sm text-teal-50/90">{s.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-px flex-1 bg-ink/15" aria-hidden>
          <span className="absolute inset-y-0 left-0 bg-crimson transition-[width] duration-300" style={{ width: `${((index + 1) / SHOTS.length) * 100}%` }} />
        </div>
        <span className="label-mono tabular-nums text-ink-mute">
          {String(index + 1).padStart(2, "0")} / {SHOTS.length}
        </span>
      </div>
    </div>
  );
}

export function ClinicShowcase() {
  return (
    <section aria-labelledby="day-title" className="border-t border-ink/10 py-24 lg:py-32">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease }}
          className="grid gap-6 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-7">
            <p className="label-mono flex items-center gap-3 text-ink-mute">
              <span className="text-ink">04</span>
              <span className="h-px w-10 bg-ink/25" />
              A day at Align
            </p>
            <h2 id="day-title" className="mt-5 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">
              From the first hello <em className="text-teal-700 italic">to the last token.</em>
            </h2>
          </div>
          <p className="text-[1.02rem] leading-relaxed text-ink-soft lg:col-span-4 lg:col-start-9">
            Twelve moments from an ordinary day with Dr. Nikita. <span className="hidden lg:inline">Hover over any frame to open it.</span>
            <span className="lg:hidden">Swipe to walk through the day.</span>
          </p>
        </motion.div>

        <div className="mt-12 hidden lg:block">
          <Filmstrip />
        </div>
        <div className="mt-10 lg:hidden">
          <PhoneCarousel />
        </div>
      </div>
    </section>
  );
}
