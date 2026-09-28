"use client";

/**
 * Continuing education on the About page: filter by area, each course with a
 * small stack of its certificate photo(s); tapping a row opens the
 * certificates full-size.
 */

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, Star, X } from "lucide-react";
import { learning, learningCategories, type Learning } from "@/lib/clinic";
import { cn } from "@/lib/cn";

type Filter = "All" | Learning["category"];
const FILTERS: Filter[] = ["All", ...learningCategories];

function Thumbs({ images, title }: { images: string[]; title: string }) {
  return (
    <span className="relative block h-20 w-24 shrink-0 sm:h-24 sm:w-32">
      {images.slice(0, 3).map((src, i) => (
        <span
          key={src}
          className="absolute inset-0 overflow-hidden rounded-md bg-white shadow-[0_8px_18px_-8px_rgb(0_0_0/0.5)] ring-1 ring-white/20 transition-transform duration-500 ease-out-soft group-hover:-translate-y-1"
          style={{ transform: `translate(${-i * 6}px, ${-i * 4}px) rotate(${-i * 3.5}deg)`, zIndex: 3 - i }}
        >
          <Image src={src} alt={i === 0 ? `Certificate: ${title}` : ""} fill sizes="128px" className="object-cover" />
        </span>
      )).reverse()}
    </span>
  );
}

export function Credentials() {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<{ item: Learning; i: number } | null>(null);
  const list = learning.filter((l) => filter === "All" || l.category === filter);

  const step = useCallback(
    (d: number) => setOpen((o) => (o ? { ...o, i: (o.i + d + o.item.images.length) % o.item.images.length } : o)),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const count = (f: Filter) => (f === "All" ? learning.length : learning.filter((l) => l.category === f).length);

  return (
    <div>
      <LayoutGroup>
        <div className="-mx-1 mt-10 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter courses">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn("relative shrink-0 rounded-full border px-4 py-2 text-sm transition", filter === f ? "border-transparent text-ink" : "border-white/15 text-teal-100/80 hover:text-porcelain")}
            >
              {filter === f && <motion.span layoutId="cred-pill" className="absolute inset-0 rounded-full bg-porcelain" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">
                {f} <span className="opacity-60">{count(f)}</span>
              </span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((l) => (
            <motion.li key={l.title} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <button
                type="button"
                onClick={() => setOpen({ item: l, i: 0 })}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-5 py-5 text-left md:grid-cols-[6.5rem_1fr_auto] md:gap-8"
              >
                <span className="label-mono hidden text-teal-300 md:block">{l.when ?? "—"}</span>
                <span className="min-w-0">
                  <span className="label-mono text-teal-300 md:hidden">{l.when ?? "—"} · </span>
                  <span className="label-mono text-teal-300/70">{l.category}</span>
                  <span className="mt-1.5 block font-medium text-porcelain transition-colors group-hover:text-white">{l.title}</span>
                  <span className="mt-1 block text-sm text-teal-100/70">{l.by}</span>
                  {l.highlight && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-crimson/90 px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-white"><Star className="size-3 fill-current" aria-hidden /> {l.highlight}</span>}
                </span>
                <span className="relative">
                  <Thumbs images={l.images} title={l.title} />
                  <span className="absolute -right-1 -bottom-1 z-10 grid size-7 place-items-center rounded-full bg-porcelain text-ink opacity-0 transition group-hover:opacity-100">
                    <Expand className="size-3.5" />
                  </span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-porcelain"
            role="dialog"
            aria-modal="true"
            aria-label={open.item.title}
            onClick={() => setOpen(null)}
          >
            <div className="flex items-start justify-between gap-4 p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
              <div className="min-w-0">
                <p className="label-mono text-teal-300">{open.item.when ?? ""}{open.item.images.length > 1 ? ` · ${open.i + 1} / ${open.item.images.length}` : ""}</p>
                <p className="mt-1 font-display text-xl leading-tight sm:text-2xl">{open.item.title}</p>
                <p className="mt-1 text-sm text-teal-100/70">{open.item.by}</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20"><X className="size-5" /></button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div key={open.item.images[open.i]} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-4 sm:inset-8">
                  <Image src={open.item.images[open.i]} alt={`Certificate: ${open.item.title}`} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              {open.item.images.length > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label="Previous certificate" className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10"><ChevronLeft /></button>
                  <button onClick={() => step(1)} aria-label="Next certificate" className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10"><ChevronRight /></button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
