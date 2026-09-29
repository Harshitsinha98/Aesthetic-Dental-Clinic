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
  { src: "/images/showcase/01-welcome.jpg", time: "09:58", title: "The welcome", note: "Every visit starts at the tooth-shaped front desk.", focus: "50% 45%" },
  { src: "/images/showcase/02-front-desk.jpg", time: "10:00", title: "Doors open", note: "Open all seven days, from ten in the morning.", focus: "50% 40%" },
  { src: "/images/showcase/03-tooth-light.jpg", time: "10:05", title: "First hello", note: "Your token is checked in and you’re shown right through.", focus: "50% 42%" },
  { src: "/images/showcase/04-closer-look.jpg", time: "10:15", title: "A closer look", note: "A careful examination before any plan is made.", focus: "55% 40%" },
  { src: "/images/showcase/05-checkup.jpg", time: "10:20", title: "The check-up", note: "Teeth, gums and bite — looked at properly.", focus: "45% 40%" },
  { src: "/images/showcase/06-on-screen.jpg", time: "10:25", title: "On the big screen", note: "The intraoral camera puts your own teeth in front of you.", focus: "55% 45%" },
  { src: "/images/showcase/07-seeing.jpg", time: "10:28", title: "See it yourself", note: "No guesswork — you see exactly what the doctor sees.", focus: "65% 35%" },
  { src: "/images/showcase/08-explained.jpg", time: "10:32", title: "Explained, simply", note: "Options talked through in plain words.", focus: "60% 40%" },
  { src: "/images/showcase/09-treatment-room.jpg", time: "10:40", title: "The treatment room", note: "Sterile instruments, one patient at a time.", focus: "40% 45%" },
  { src: "/images/showcase/10-unhurried.jpg", time: "10:50", title: "Unhurried care", note: "Fifteen-minute tokens mean no one is rushed.", focus: "65% 45%" },
  { src: "/images/showcase/11-between.jpg", time: "14:00", title: "Between appointments", note: "A moment on the sofa before the evening session.", focus: "62% 60%" },
  { src: "/images/showcase/12-unwind.jpg", time: "21:00", title: "Until tomorrow", note: "Evening tokens run till nine. See you soon.", focus: "55% 60%" },
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
