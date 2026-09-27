"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { galleryCategories, photos } from "@/lib/gallery";
import { cn } from "@/lib/cn";

export function GalleryGrid() {
  const [filter, setFilter] = useState<(typeof galleryCategories)[number]>("All");
  const [index, setIndex] = useState<number | null>(null);
  const list = photos.filter((p) => filter === "All" || p.category === filter);

  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, step]);

  return (
    <section className="container-page py-14 lg:py-20">
      <div className="flex flex-wrap gap-2">
        {galleryCategories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn("rounded-full border px-4 py-2 text-sm transition", filter === c ? "border-ink bg-ink text-porcelain" : "border-ink/15 hover:border-ink")}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
        <AnimatePresence>
          {list.map((p, i) => (
            <motion.button
              layout
              key={p.src}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIndex(i)}
              className="group mb-6 block w-full break-inside-avoid text-left"
            >
              <span className={cn("relative block overflow-hidden bg-paper", p.wide ? "aspect-[16/9]" : p.category === "Credentials" ? "aspect-[4/5]" : "aspect-[3/4]")}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className={cn("transition duration-700 ease-out-soft group-hover:scale-105", p.category === "Credentials" ? "object-contain p-2" : "object-cover")} />
              </span>
              <span className="mt-2 flex justify-between label-mono text-ink-mute">
                <span>{p.caption}</span>
                <span>{p.category}</span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {index !== null && list[index] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-porcelain"
            role="dialog"
            aria-modal="true"
            aria-label={list[index].caption}
          >
            <div className="flex items-center justify-between p-4 label-mono">
              <span>{String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")} · {list[index].caption}</span>
              <button onClick={() => setIndex(null)} aria-label="Close" className="grid size-11 place-items-center rounded-full border border-white/20"><X className="size-5" /></button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <motion.div key={list[index].src} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-4">
                  <Image src={list[index].src} alt={list[index].alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button onClick={() => step(-1)} aria-label="Previous" className="absolute top-1/2 left-4 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10"><ChevronLeft /></button>
              <button onClick={() => step(1)} aria-label="Next" className="absolute top-1/2 right-4 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10"><ChevronRight /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
