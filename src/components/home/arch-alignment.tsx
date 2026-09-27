"use client";

/**
 * The signature graphic: an upper dental arch seen from above.
 *
 * Teeth start crowded and rotated — the way an orthodontist first sees a case —
 * and settle onto an ideal arch form while the archwire draws through them.
 * A soft gum band gives the teeth context so the first frame reads as "a
 * crowded mouth", not as scattered shapes. Measurement annotations (midline,
 * inter-molar width, arch form) fade in last, a nod to Dr. Nikita's research
 * on smile parameters.
 *
 * Driven entirely by a MotionValue `progress` (0 = crowded, 1 = aligned).
 */

import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";

const VIEW_W = 800;
const VIEW_H = 470;

/** Ideal arch: an inverted U. t ∈ [-1, 1]. */
function archPoint(t: number) {
  return { x: 400 + 318 * Math.sin(t * 1.25), y: 78 + 380 * (1 - Math.cos(t * 1.25)) };
}

/** Tooth widths / depths from the midline outwards (central incisor → 2nd molar). */
const WIDTHS = [60, 50, 50, 46, 46, 64, 66];
const DEPTHS = [30, 30, 40, 42, 42, 58, 60];

type Tooth = {
  id: string;
  x: number;
  y: number;
  angle: number;
  w: number;
  d: number;
  dx: number;
  dy: number;
  dr: number;
  kind: number;
};

function buildArch() {
  const samples = 600;
  const pts = Array.from({ length: samples + 1 }, (_, i) => archPoint(-1 + (2 * i) / samples));
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = cum[cum.length - 1];
  const mid = total / 2;
  const at = (s: number) => {
    let i = cum.findIndex((c) => c >= s);
    if (i <= 0) i = 1;
    const a = pts[i - 1];
    const b = pts[i];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  };

  // Deterministic "crowding" so server and client render identically.
  const jitter = (n: number) => {
    const v = Math.sin(n * 12.9898) * 43758.5453;
    return v - Math.floor(v) - 0.5;
  };

  const gap = 5;
  const scale = (total / 2 - gap * 7) / WIDTHS.reduce((a, b) => a + b, 0);
  const teeth: Tooth[] = [];
  for (const side of [-1, 1] as const) {
    let s = mid;
    WIDTHS.forEach((w0, k) => {
      const w = w0 * scale;
      const centre = s + side * (gap / 2 + w / 2);
      s = centre + side * (w / 2 + gap / 2);
      const p = at(centre);
      const seed = (k + 1) * (side === 1 ? 3.1 : 7.7);
      const severity = k < 3 ? 1 : 0.5;
      teeth.push({
        id: `${side}-${k}`,
        x: p.x,
        y: p.y,
        angle: p.angle,
        w,
        d: DEPTHS[k] * scale * 1.05,
        dx: jitter(seed) * 40 * severity,
        dy: jitter(seed + 1) * 46 * severity + (k === 2 ? -22 : 0),
        dr: jitter(seed + 2) * 60 * severity,
        kind: k,
      });
    });
  }

  const path = (dy = 0) =>
    pts
      .filter((_, i) => i % 6 === 0)
      .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${(p.y + dy).toFixed(1)}`)
      .join(" ");

  const molarDepth = DEPTHS[6] * scale * 1.05;
  return { teeth, wire: path(2), gum: path(0), gumWidth: molarDepth * 1.55 };
}

const { teeth, wire, gum, gumWidth } = buildArch();

function ToothShape({ tooth }: { tooth: Tooth }) {
  const { w, d, kind } = tooth;
  const r = kind < 3 ? Math.min(w, d) * 0.48 : Math.min(w, d) * 0.36;
  return (
    <g filter="url(#tooth-shadow)">
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={r} fill="url(#enamel)" stroke="#194f53" strokeWidth="1.3" />
      {kind >= 3 ? (
        <path
          d={kind >= 5 ? `M${-w * 0.26} 0 H${w * 0.26} M0 ${-d * 0.24} V${d * 0.24}` : `M${-w * 0.24} 0 H${w * 0.24}`}
          stroke="#82bdb7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ) : (
        <path d={`M${-w * 0.28} ${-d * 0.1} Q0 ${d * 0.1} ${w * 0.28} ${-d * 0.1}`} fill="none" stroke="#b0d6d1" strokeWidth="1.1" />
      )}
      {/* Enamel highlight */}
      <ellipse cx={-w * 0.16} cy={-d * 0.18} rx={w * 0.14} ry={d * 0.09} fill="#ffffff" opacity="0.9" />
    </g>
  );
}

function AnimatedTooth({ tooth, progress }: { tooth: Tooth; progress: MotionValue<number> }) {
  // Front teeth settle a little after the back teeth, which reads as the wire
  // pulling the arch into shape from the molars forwards.
  const lag = tooth.kind < 3 ? 0.12 : 0;
  const from = 0.05 + lag;
  const to = 0.72 + lag * 0.5;
  const ref = useRef<SVGGElement>(null);
  const bracket = useTransform(progress, [0.16, 0.3], [0, 1]);

  // The SVG `transform` attribute is written directly: SVG transform syntax
  // (unitless, space-separated) is not valid CSS, so it cannot go through style.
  const apply = (p: number) => {
    const v = 1 - Math.min(1, Math.max(0, (p - from) / (to - from)));
    ref.current?.setAttribute(
      "transform",
      `translate(${(tooth.x + tooth.dx * v).toFixed(2)} ${(tooth.y + tooth.dy * v).toFixed(2)}) rotate(${(tooth.angle + tooth.dr * v).toFixed(2)})`,
    );
  };
  useMotionValueEvent(progress, "change", apply);
  useEffect(() => apply(progress.get()));

  return (
    <g ref={ref} transform={`translate(${tooth.x + tooth.dx} ${tooth.y + tooth.dy}) rotate(${tooth.angle + tooth.dr})`}>
      <ToothShape tooth={tooth} />
      <motion.rect x={-5} y={-tooth.d / 2 - 2} width={10} height={8} rx={1.6} fill="#216466" style={{ opacity: bracket }} />
    </g>
  );
}

export function ArchAlignment({ progress }: { progress: MotionValue<number> }) {
  const wireLength = useTransform(progress, [0.2, 0.78], [0, 1]);
  const annotate = useTransform(progress, [0.74, 0.92], [0, 1]);
  const percentText = useTransform(progress, (v) => `${Math.round(Math.min(1, v / 0.8) * 100).toString().padStart(3, "0")}%`);
  const starScale = useTransform(progress, [0.84, 0.97], [0, 1]);
  const gumTint = useTransform(progress, [0, 1], ["#f3d7dc", "#f6e2e5"]);

  const left = teeth[6];
  const right = teeth[13];
  const molarsY = Math.max(left.y, right.y);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full" role="img" aria-label="Illustration: crowded teeth moving into a well-aligned dental arch">
      <defs>
        <radialGradient id="enamel" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f4f6f3" />
          <stop offset="1" stopColor="#e3e9e5" />
        </radialGradient>
        <filter id="tooth-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#0d3237" floodOpacity="0.16" />
        </filter>
        <radialGradient id="panel-fade" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0.55" stopColor="#fbfaf7" stopOpacity="0" />
          <stop offset="1" stopColor="#fbfaf7" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Measurement grid, faded towards the edges */}
      <g stroke="#0f1a1b" strokeOpacity="0.07">
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} x2={i * 40} y1={0} y2={VIEW_H} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`h${i}`} y1={i * 40} y2={i * 40} x1={0} x2={VIEW_W} />
        ))}
      </g>
      <rect width={VIEW_W} height={VIEW_H} fill="url(#panel-fade)" />

      {/* Gum band */}
      <motion.path d={gum} fill="none" style={{ stroke: gumTint }} strokeWidth={gumWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d={gum} fill="none" stroke="#fbeff1" strokeWidth={gumWidth * 0.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Archwire */}
      <motion.path d={wire} fill="none" stroke="#2f7d7a" strokeWidth="2" strokeLinecap="round" style={{ pathLength: wireLength }} />

      {teeth.map((tooth) => (
        <AnimatedTooth key={tooth.id} tooth={tooth} progress={progress} />
      ))}

      {/* Annotations */}
      <motion.g style={{ opacity: annotate }} fontFamily="var(--font-plex-mono)" fontSize="11" letterSpacing="1.6" fill="#3d4a4b">
        <line x1="400" x2="400" y1="34" y2={molarsY + 38} stroke="#c8243f" strokeWidth="1" strokeDasharray="4 5" />
        <text x="410" y="46" fill="#c8243f">MIDLINE</text>

        <line x1={left.x} x2={right.x} y1={molarsY + 50} y2={molarsY + 50} stroke="#3d4a4b" strokeWidth="1" />
        <line x1={left.x} x2={left.x} y1={molarsY + 44} y2={molarsY + 56} stroke="#3d4a4b" />
        <line x1={right.x} x2={right.x} y1={molarsY + 44} y2={molarsY + 56} stroke="#3d4a4b" />
        <text x="400" y={molarsY + 72} textAnchor="middle">INTER-MOLAR WIDTH · SYMMETRIC 1 : 1</text>

        <text x="400" y="240" textAnchor="middle" fill="#6b7677">IDEAL ARCH FORM</text>
      </motion.g>

      <motion.path d="M400 66l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#c8243f" style={{ scale: starScale, transformOrigin: "400px 78px" }} />

      <g fontFamily="var(--font-plex-mono)" fontSize="11" letterSpacing="1.6" fill="#6b7677">
        <text x="16" y="24">FIG. 01 — UPPER ARCH, OCCLUSAL VIEW</text>
        <text x={VIEW_W - 16} y="24" textAnchor="end">
          ALIGNMENT <motion.tspan fill="#0f1a1b">{percentText}</motion.tspan>
        </text>
      </g>
    </svg>
  );
}
