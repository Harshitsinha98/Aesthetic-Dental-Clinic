"use client";

/**
 * The signature graphic: an upper dental arch seen from above.
 *
 * Teeth start crowded and rotated — the way an orthodontist first sees a case —
 * and, as the visitor scrolls, settle onto an ideal arch form while the
 * archwire draws through them. Measurement annotations (midline, arch form,
 * symmetry) fade in last, a nod to Dr. Nikita's research on smile parameters.
 *
 * Driven by scroll progress passed in as a MotionValue (0 → 1). Under
 * prefers-reduced-motion the parent passes a static 1 and the aligned arch is
 * shown immediately.
 */

import { motion, useTransform, type MotionValue } from "motion/react";

const VIEW_W = 800;
const VIEW_H = 560;

/** Ideal arch: an inverted U. t ∈ [-1, 1]. */
function archPoint(t: number) {
  return { x: 400 + 318 * Math.sin(t * 1.25) , y: 96 + 380 * (1 - Math.cos(t * 1.25)) };
}

/** Tooth widths from the midline outwards (mesio-distal, arbitrary units). */
const WIDTHS = [60, 50, 50, 46, 46, 64, 66];
const DEPTHS = [30, 30, 40, 42, 42, 58, 60];
const NAMES = ["Central incisor", "Lateral incisor", "Canine", "1st premolar", "2nd premolar", "1st molar", "2nd molar"];

type Tooth = {
  id: string;
  x: number;
  y: number;
  angle: number;
  w: number;
  d: number;
  /** Crowding offsets for the "before" state. */
  dx: number;
  dy: number;
  dr: number;
  kind: number;
};

function buildArch(): { teeth: Tooth[]; wire: string } {
  // Sample the curve and build a cumulative arc-length table.
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
      const severity = k < 3 ? 1 : 0.55;
      teeth.push({
        id: `${side}-${k}`,
        x: p.x,
        y: p.y,
        angle: p.angle,
        w,
        d: DEPTHS[k] * scale * 1.05,
        dx: jitter(seed) * 44 * severity,
        dy: jitter(seed + 1) * 52 * severity + (k === 2 ? -30 * side * 0 - 26 : 0),
        dr: jitter(seed + 2) * 64 * severity,
        kind: k,
      });
    });
  }

  const wirePts = pts.filter((_, i) => i % 6 === 0).map((p) => ({ x: p.x, y: p.y + 2 }));
  const wire = wirePts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return { teeth, wire };
}

const { teeth, wire } = buildArch();

function ToothShape({ tooth }: { tooth: Tooth }) {
  const { w, d, kind } = tooth;
  const r = kind < 3 ? Math.min(w, d) * 0.46 : Math.min(w, d) * 0.34;
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={r} fill="url(#enamel)" stroke="#133f44" strokeWidth="1.4" />
      {kind >= 3 ? (
        // Occlusal fissures on premolars and molars.
        <path
          d={kind >= 5 ? `M${-w * 0.28} 0 H${w * 0.28} M0 ${-d * 0.26} V${d * 0.26}` : `M${-w * 0.26} 0 H${w * 0.26}`}
          stroke="#82bdb7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ) : (
        <path d={`M${-w * 0.3} ${-d * 0.12} Q0 ${d * 0.08} ${w * 0.3} ${-d * 0.12}`} fill="none" stroke="#b0d6d1" strokeWidth="1.1" />
      )}
    </g>
  );
}

function AnimatedTooth({ tooth, progress }: { tooth: Tooth; progress: MotionValue<number> }) {
  // Front teeth settle a little later than back teeth, which reads as the wire
  // pulling the arch into shape from the molars forwards.
  const lag = tooth.kind < 3 ? 0.12 : 0;
  const settle = useTransform(progress, [0.05 + lag, 0.72 + lag * 0.5], [1, 0], { clamp: true });
  const x = useTransform(settle, (v) => tooth.x + tooth.dx * v);
  const y = useTransform(settle, (v) => tooth.y + tooth.dy * v);
  const rotate = useTransform(settle, (v) => tooth.angle + tooth.dr * v);
  const transform = useTransform([x, y, rotate], ([tx, ty, tr]) => `translate(${tx} ${ty}) rotate(${tr})`);
  const bracket = useTransform(progress, [0.18, 0.3], [0, 1]);

  return (
    <motion.g style={{ transform }} transform={`translate(${tooth.x + tooth.dx} ${tooth.y + tooth.dy}) rotate(${tooth.angle + tooth.dr})`}>
      <ToothShape tooth={tooth} />
      <motion.rect
        x={-5}
        y={-tooth.d / 2 - 2}
        width={10}
        height={8}
        rx={1.6}
        fill="#2f7d7a"
        style={{ opacity: bracket }}
      />
    </motion.g>
  );
}

export function ArchAlignment({ progress }: { progress: MotionValue<number> }) {
  const wireLength = useTransform(progress, [0.2, 0.78], [0, 1]);
  const annotate = useTransform(progress, [0.72, 0.9], [0, 1]);
  const percent = useTransform(progress, [0.05, 0.8], [0, 100], { clamp: true });
  const percentText = useTransform(percent, (v) => `${Math.round(v).toString().padStart(3, "0")}%`);
  const starScale = useTransform(progress, [0.82, 0.95], [0, 1]);

  const molarsY = teeth.find((t) => t.kind === 6)!.y;

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full" role="img" aria-label="Illustration: crowded teeth moving into a well-aligned dental arch">
      <defs>
        <radialGradient id="enamel" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7ede9" />
        </radialGradient>
      </defs>

      {/* Measurement grid */}
      <g stroke="#0f1a1b" strokeOpacity="0.07">
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} x2={i * 40} y1={0} y2={VIEW_H} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`h${i}`} y1={i * 40} y2={i * 40} x1={0} x2={VIEW_W} />
        ))}
      </g>

      {/* Archwire */}
      <motion.path d={wire} fill="none" stroke="#2f7d7a" strokeWidth="2" strokeLinecap="round" style={{ pathLength: wireLength }} />

      {teeth.map((tooth) => (
        <AnimatedTooth key={tooth.id} tooth={tooth} progress={progress} />
      ))}

      {/* Annotations */}
      <motion.g style={{ opacity: annotate }} fontFamily="var(--font-plex-mono)" fontSize="11" letterSpacing="1.6" fill="#3d4a4b">
        <line x1="400" x2="400" y1="30" y2={molarsY + 40} stroke="#c8243f" strokeWidth="1" strokeDasharray="4 5" />
        <text x="410" y="44" fill="#c8243f">MIDLINE</text>

        <line x1={teeth[6].x} x2={teeth[13].x} y1={molarsY + 52} y2={molarsY + 52} stroke="#3d4a4b" strokeWidth="1" />
        <line x1={teeth[6].x} x2={teeth[6].x} y1={molarsY + 46} y2={molarsY + 58} stroke="#3d4a4b" />
        <line x1={teeth[13].x} x2={teeth[13].x} y1={molarsY + 46} y2={molarsY + 58} stroke="#3d4a4b" />
        <text x="400" y={molarsY + 74} textAnchor="middle">INTER-MOLAR WIDTH · SYMMETRIC 1 : 1</text>

        <text x={teeth[2].x + 60} y={teeth[2].y + 4}>CANINE GUIDANCE</text>
        <text x={Math.min(...teeth.map((t) => t.x)) - 6} y="150" textAnchor="start">ARCH FORM</text>
      </motion.g>

      <motion.path
        d="M400 70l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"
        fill="#c8243f"
        style={{ scale: starScale, transformOrigin: "400px 82px" }}
      />

      <g fontFamily="var(--font-plex-mono)" fontSize="11" letterSpacing="1.6" fill="#6b7677">
        <text x="16" y="24">FIG. 01 — UPPER ARCH, OCCLUSAL VIEW</text>
        <text x={VIEW_W - 16} y="24" textAnchor="end">
          ALIGNMENT <motion.tspan fill="#0f1a1b">{percentText}</motion.tspan>
        </text>
      </g>
    </svg>
  );
}

export const toothNames = NAMES;
