/**
 * On-brand SVG illustrations for each treatment — license-free, sharp at any
 * size, and drawn in the site palette (porcelain, teal, crimson). Used as the
 * "at a glance" diagram on each treatment detail page.
 *
 * Server component: pure markup, no client JS.
 *
 * Coordinate system: a 200×120 canvas. Every element is kept inside a safe
 * band (roughly y=14 to y=110) so nothing clips at any aspect ratio.
 */

import { cn } from "@/lib/cn";

const TEAL = "#194f53";
const TEAL2 = "#2f7d7a";
const MINT = "#bfe3d8";
const CRIMSON = "#c8243f";
const ENAMEL = "#f4f6f3";

/**
 * A single front-tooth outline. The path spans about y=-22 (top) to y=+22
 * (root tips) around (cx, cy) before scaling, so with scale s the tooth
 * occupies cy-22*s to cy+22*s vertically and cx-16*s to cx+16*s horizontally.
 */
function ToothPath({
  cx,
  cy,
  s = 1,
  fill = ENAMEL,
  stroke = TEAL,
  sw = 2,
}: {
  cx: number;
  cy: number;
  s?: number;
  fill?: string;
  stroke?: string;
  sw?: number;
}) {
  return (
    <path
      transform={`translate(${cx} ${cy}) scale(${s})`}
      d="M0 -22c-9 0 -16 6 -16 15 0 8 3 13 5 20 3 7 3 15 7 15 3 0 3 -11 4 -11s1 11 4 11c4 0 4 -8 7 -15 2 -7 5 -12 5 -20 0 -9 -7 -15 -16 -15z"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw / s}
      strokeLinejoin="round"
    />
  );
}

function Sparkle({ x, y, r = 5, fill = CRIMSON }: { x: number; y: number; r?: number; fill?: string }) {
  return <path d={`M${x} ${y - r}l${r * 0.4} ${r * 0.6} ${r * 0.6} ${r * 0.4}-${r * 0.6} ${r * 0.4}-${r * 0.4} ${r * 0.6}-${r * 0.4}-${r * 0.6}-${r * 0.6}-${r * 0.4} ${r * 0.6}-${r * 0.4}z`} fill={fill} />;
}

function Frame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label={label ?? "Treatment illustration"} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ta-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f5ef" />
          <stop offset="1" stopColor="#eef6f2" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#ta-bg)" />
      {children}
    </svg>
  );
}

function Art({ slug }: { slug: string }) {
  switch (slug) {
    case "check-up":
      return (
        <Frame label="A dental mirror and probe examining a tooth">
          <ToothPath cx={116} cy={60} s={1.5} />
          {/* mirror */}
          <circle cx="64" cy="52" r="15" fill={MINT} stroke={TEAL} strokeWidth="2.5" />
          <line x1="74" y1="63" x2="96" y2="86" stroke={TEAL2} strokeWidth="4" strokeLinecap="round" />
          {/* sparkle = healthy */}
          <Sparkle x={150} y={44} r={7} />
        </Frame>
      );
    case "clear-aligners":
      return (
        <Frame label="A clear aligner tray over the teeth">
          {[70, 100, 130].map((x) => (
            <ToothPath key={x} cx={x} cy={56} s={1.05} />
          ))}
          {/* tray */}
          <path d="M52 44c0 30 18 42 48 42s48-12 48-42c0-6-96-6-96 0z" fill="#bfe3d8" opacity="0.26" />
          <path d="M52 44c0 30 18 42 48 42s48-12 48-42" fill="none" stroke={TEAL2} strokeWidth="3" opacity="0.55" />
        </Frame>
      );
    case "braces":
      return (
        <Frame label="Teeth with brackets and an archwire">
          {[54, 92, 130, 168].map((x) => (
            <ToothPath key={x} cx={x} cy={62} s={1.15} />
          ))}
          {/* archwire */}
          <path d="M30 58q81 26 162 0" fill="none" stroke={TEAL2} strokeWidth="2.5" />
          {[54, 92, 130, 168].map((x, i) => (
            <rect key={x} x={x - 7} y={52 + [2, 6, 6, 2][i]} width="14" height="10" rx="2" fill={i === 1 || i === 2 ? CRIMSON : TEAL} />
          ))}
        </Frame>
      );
    case "root-canal":
      return (
        <Frame label="A cross-section of a tooth showing the root canals">
          <ToothPath cx={100} cy={58} s={2.1} fill="#fff" />
          {/* canals */}
          <path d="M91 46c-2 18-5 26-7 40M109 46c2 18 5 26 7 40" fill="none" stroke={CRIMSON} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="40" r="4" fill={CRIMSON} />
        </Frame>
      );
    case "crowns-veneers":
      return (
        <Frame label="A crown being placed over a tooth">
          <ToothPath cx={100} cy={68} s={1.6} stroke={TEAL} />
          {/* crown cap descending */}
          <path d="M76 48c0-16 10-24 24-24s24 8 24 24c-16 6-32 6-48 0z" fill={MINT} stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" />
          <Sparkle x={152} y={40} r={6} />
        </Frame>
      );
    case "smile-design":
      return (
        <Frame label="A smile arch with proportion guides">
          <path d="M46 54q54 40 108 0" fill="none" stroke={TEAL} strokeWidth="2.5" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const t = i / 5;
            const x = 46 + t * 108;
            const y = 54 + Math.sin(t * Math.PI) * 28;
            return <rect key={i} x={x - 7} y={y - 9} width="14" height="18" rx="4" fill={ENAMEL} stroke={TEAL} strokeWidth="1.6" />;
          })}
          <line x1="100" y1="28" x2="100" y2="98" stroke={CRIMSON} strokeWidth="1" strokeDasharray="3 4" />
          <Sparkle x={152} y={34} r={6} />
        </Frame>
      );
    case "kids-dentistry":
      return (
        <Frame label="A happy tooth character for children">
          <ToothPath cx={100} cy={58} s={2.2} fill="#fff" />
          <circle cx="88" cy="50" r="3.5" fill={TEAL} />
          <circle cx="112" cy="50" r="3.5" fill={TEAL} />
          <path d="M86 62q14 12 28 0" fill="none" stroke={CRIMSON} strokeWidth="3" strokeLinecap="round" />
          {/* rosy cheeks */}
          <circle cx="76" cy="60" r="4" fill={CRIMSON} opacity="0.35" />
          <circle cx="124" cy="60" r="4" fill={CRIMSON} opacity="0.35" />
          <Sparkle x={154} y={38} r={6} />
        </Frame>
      );
    case "dental-implants":
      return (
        <Frame label="A dental implant post and crown in the jaw">
          {/* gum line */}
          <path d="M40 78h120" stroke={MINT} strokeWidth="10" strokeLinecap="round" />
          {/* crown */}
          <ToothPath cx={100} cy={54} s={1.3} />
          {/* screw post below gum */}
          <g stroke={TEAL2} strokeWidth="3" strokeLinecap="round">
            <line x1="100" y1="78" x2="100" y2="106" />
            <line x1="94" y1="86" x2="106" y2="86" />
            <line x1="94" y1="94" x2="106" y2="94" />
            <line x1="96" y1="102" x2="104" y2="102" />
          </g>
        </Frame>
      );
    case "laser-dentistry":
      return (
        <Frame label="A dental laser treating the gum line">
          <path d="M50 84h100" stroke={MINT} strokeWidth="12" strokeLinecap="round" />
          {[82, 112].map((x) => (
            <ToothPath key={x} cx={x} cy={60} s={1.1} />
          ))}
          {/* laser handpiece + beam */}
          <rect x="36" y="30" width="42" height="14" rx="7" fill={TEAL} transform="rotate(28 57 37)" />
          <line x1="74" y1="52" x2="96" y2="78" stroke={CRIMSON} strokeWidth="2.5" strokeDasharray="2 4" strokeLinecap="round" />
          <circle cx="96" cy="78" r="4" fill={CRIMSON} opacity="0.6" />
        </Frame>
      );
    case "fillings":
      return (
        <Frame label="A tooth cavity being filled">
          <ToothPath cx={100} cy={58} s={2.1} fill="#fff" />
          {/* filled cavity */}
          <path d="M92 42c-4 4-6 10-2 14s12 2 14-2-2-14-6-14-4 0-6 2z" fill={MINT} stroke={TEAL} strokeWidth="2" />
          <Sparkle x={150} y={40} r={6} />
        </Frame>
      );
    case "extraction":
      return (
        <Frame label="A tooth being gently removed with forceps">
          <ToothPath cx={100} cy={52} s={1.6} />
          {/* forceps cradling the tooth */}
          <path d="M84 74c4 8 8 12 16 12s12-4 16-12" fill="none" stroke={TEAL2} strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="82" x2="80" y2="104" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
          <line x1="110" y1="82" x2="120" y2="104" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
          {/* lift arrow (tooth is being drawn upward) */}
          <g stroke={CRIMSON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1="100" y1="40" x2="100" y2="18" />
            <path d="M94 26l6 -8 6 8" />
          </g>
        </Frame>
      );
    default:
      return (
        <Frame label="Dental treatment illustration">
          <ToothPath cx={100} cy={60} s={2.2} />
        </Frame>
      );
  }
}

export function TreatmentArt({ slug, className }: { slug: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-ink/10 bg-paper", className)}>
      <Art slug={slug} />
    </div>
  );
}
