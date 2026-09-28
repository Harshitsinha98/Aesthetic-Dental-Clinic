"use client";

/**
 * A side-profile line drawing — the face from the Align logo, scaled up —
 * that draws itself in, followed by the facial-proportion guides used in
 * aesthetic planning (facial thirds, the E-line from nose to chin).
 */

import { motion, useReducedMotion } from "motion/react";

const ease = [0.65, 0, 0.35, 1] as const;

const PROFILE =
  "M118 34C204 18 276 58 288 132c4 26-2 48 6 70l40 58c5 8 1 16-9 18l-16 4c7 13 5 24-5 29 11 7 11 20-1 27-7 4-7 12-1 22 8 20-4 42-34 48-22 4-38 20-42 62";

export function ProfileArt() {
  const reduce = useReducedMotion();
  const draw = (delay: number, duration = 1.6) =>
    reduce
      ? { initial: { pathLength: 1, opacity: 1 }, animate: { pathLength: 1, opacity: 1 } }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration, delay, ease }, opacity: { duration: 0.2, delay } },
        };
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay } };

  const guides = [
    { y: 34, label: "HAIRLINE" },
    { y: 176, label: "BROW" },
    { y: 290, label: "NOSE BASE" },
    { y: 420, label: "CHIN" },
  ];

  return (
    <svg viewBox="0 0 420 540" className="h-auto w-full" role="img" aria-label="Line drawing of a face in profile with facial-proportion guides">
      <defs>
        <linearGradient id="fa-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dfe3" />
          <stop offset="1" stopColor="#e8566e" />
        </linearGradient>
        <radialGradient id="fa-glow" cx="0.6" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#e8566e" stopOpacity="0.22" />
          <stop offset="1" stopColor="#e8566e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.circle cx="250" cy="230" r="210" fill="url(#fa-glow)" {...fade(0.2)} />

      {/* Facial thirds */}
      <g fontFamily="var(--font-plex-mono)" fontSize="10" letterSpacing="1.6" fill="#82bdb7">
        {guides.map((g, i) => (
          <motion.g key={g.label} {...fade(1.4 + i * 0.12)}>
            <line x1="20" x2="400" y1={g.y} y2={g.y} stroke="#82bdb7" strokeOpacity="0.35" strokeDasharray="3 6" />
            <text x="20" y={g.y - 6}>{g.label}</text>
          </motion.g>
        ))}
        <motion.g {...fade(2)}>
          <line x1="392" x2="392" y1="34" y2="420" stroke="#82bdb7" strokeOpacity="0.5" />
          {[34, 176, 290, 420].map((y) => (
            <line key={y} x1="386" x2="398" y1={y} y2={y} stroke="#82bdb7" strokeOpacity="0.6" />
          ))}
          <text x="380" y="110" textAnchor="end">1/3</text>
          <text x="380" y="238" textAnchor="end">1/3</text>
          <text x="380" y="360" textAnchor="end">1/3</text>
        </motion.g>
      </g>

      {/* E-line: nose tip to chin */}
      <motion.path d="M334 262 L310 412" stroke="#f6dfe3" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 5" fill="none" {...draw(2.2, 0.8)} />
      <motion.text x="320" y="392" fontFamily="var(--font-plex-mono)" fontSize="10" letterSpacing="1.6" fill="#f6dfe3" {...fade(2.6)}>
        E-LINE
      </motion.text>

      {/* The profile */}
      <motion.path d={PROFILE} fill="none" stroke="url(#fa-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...draw(0.2, 2.2)} />

      {/* Star from the logo */}
      <motion.path
        d="M226 96l5 14 14 5-14 5-5 14-5-14-14-5 14-5z"
        fill="#c8243f"
        initial={reduce ? undefined : { scale: 0, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        transition={{ delay: 2.4, type: "spring", stiffness: 260, damping: 14 }}
        style={{ transformOrigin: "226px 115px" }}
      />
    </svg>
  );
}
