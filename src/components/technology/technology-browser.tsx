"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { publishedInstruments } from "@/lib/instruments";
import { cn } from "@/lib/cn";

const categories = ["All", ...Array.from(new Set(publishedInstruments.map((i) => i.category)))];

export function TechnologyBrowser() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(publishedInstruments[0].id);
  const list = publishedInstruments.filter((i) => filter === "All" || i.category === filter);

  return (
    <section className="container-page py-14 lg:py-20">
      <LayoutGroup>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition",
                filter === c ? "text-porcelain" : "text-ink-soft hover:text-ink",
              )}
            >
              {filter === c && <motion.span layoutId="tech-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <ul className="mt-10 border-t border-ink/15">
        <AnimatePresence initial={false}>
          {list.map((item) => {
            const isOpen = open === item.id;
            const n = publishedInstruments.indexOf(item) + 1;
            return (
              <motion.li key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-ink/15">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 text-left sm:grid-cols-[3.5rem_1fr_12rem_auto]"
                >
                  <span className="label-mono text-ink-mute">{String(n).padStart(2, "0")}</span>
                  <span className="font-display text-[clamp(1.5rem,3vw,2.6rem)] leading-none transition-colors group-hover:text-teal-700">{item.name}</span>
                  <span className="hidden text-sm text-ink-mute sm:block">{item.category}</span>
                  <span className={cn("text-2xl text-ink-mute transition-transform duration-500", isOpen && "rotate-45 text-crimson")}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 pb-10 md:grid-cols-12">
                        <div className="relative aspect-[4/3] overflow-hidden bg-paper md:col-span-5 md:col-start-2">
                          <Image src={item.image} alt={`${item.name} at Align Aesthetic Dental Hub`} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
                        </div>
                        <div className="md:col-span-5 md:col-start-8">
                          <p className="label-mono text-ink-mute">What it is</p>
                          <p className="mt-2 leading-relaxed text-ink-soft">{item.what}</p>
                          <p className="mt-6 label-mono text-crimson">What it means for you</p>
                          <p className="mt-2 leading-relaxed">{item.why}</p>
                          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-sm">
                            {item.spec.map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-4 py-2.5">
                                <dt className="text-ink-mute">{k}</dt>
                                <dd className="text-right">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
