"use client";

/**
 * Treatments as an index, not a card grid. On pointer devices the photo for
 * the hovered row follows the cursor; on touch the rows are simple links.
 */

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { treatments } from "@/lib/treatments";

export function TreatmentIndex() {
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="border-t border-ink/15"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const box = listRef.current?.getBoundingClientRect();
          if (!box) return;
          x.set(e.clientX - box.left);
          y.set(e.clientY - box.top);
        }}
        onPointerLeave={() => setActive(null)}
      >
        {treatments.map((t, i) => (
          <li key={t.slug} onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}>
            <Link
              href={`/treatments/${t.slug}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-ink/15 py-6 transition-colors sm:grid-cols-[3.5rem_1fr_14rem_auto] lg:py-7"
            >
              <span className="label-mono text-ink-mute">{t.no}</span>
              <span className="font-display text-[clamp(1.7rem,3.4vw,3rem)] leading-none transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-3 group-hover:text-teal-700">
                {t.name}
              </span>
              <span className="col-start-2 text-sm text-ink-mute sm:col-start-3 sm:row-start-1">{t.kind}</span>
              <ArrowUpRight className="col-start-3 row-start-1 size-5 self-center text-ink-mute transition-transform duration-500 ease-out-soft group-hover:rotate-45 group-hover:text-crimson sm:col-start-4" />
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-10 hidden h-64 w-52 -translate-x-1/2 -translate-y-1/2 overflow-hidden lg:block"
        style={{ x: sx, y: sy }}
      >
        <AnimatePresence mode="popLayout">
          {active !== null && (
            <motion.div
              key={active}
              initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
              animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={treatments[active].image} alt="" fill sizes="208px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
