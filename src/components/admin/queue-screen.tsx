"use client";

/**
 * Waiting-room display: open /queue on the TV or a spare tablet. Shows token
 * numbers only — never names — and updates every 15 seconds. When reception
 * taps "Seen · call next", the next number appears here.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogoMark } from "@/components/brand/logo";

type Queue = {
  ok: boolean;
  dateLabel: string;
  current: { token: number; time: string } | null;
  next: { token: number; time: string }[];
  seen: number;
  waiting: number;
};

export function QueueScreen() {
  const [q, setQ] = useState<Queue | null>(null);
  const [clock, setClock] = useState("");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/queue", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        setQ(await res.json());
        setOffline(false);
      } catch {
        setOffline(true);
      }
    };
    const tick = () =>
      setClock(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    load();
    tick();
    const a = window.setInterval(load, 15_000);
    const b = window.setInterval(tick, 10_000);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);

  return (
    <main className="flex min-h-svh flex-col bg-teal-950 p-[4vmin] text-porcelain">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-[7vmin] place-items-center rounded-full bg-porcelain"><LogoMark className="size-[5vmin]" /></span>
          <div>
            <p className="text-[2.6vmin] font-bold tracking-[0.18em]">ALiGN</p>
            <p className="text-[1.5vmin] tracking-[0.28em] text-[#e8566e]">AESTHETIC DENTAL HUB</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-[4vmin] leading-none">{clock}</p>
          <p className="label-mono mt-1 text-teal-300">{q?.dateLabel}</p>
        </div>
      </header>

      <section className="grid flex-1 items-center gap-[4vmin] md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label-mono text-[2vmin] text-teal-300">Now serving</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={q?.current?.token ?? "none"}
              initial={{ opacity: 0, y: "8vmin" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-8vmin" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[34vmin] leading-[0.85]"
            >
              {q?.current ? String(q.current.token).padStart(2, "0") : "—"}
            </motion.p>
          </AnimatePresence>
          <p className="mt-[2vmin] text-[3vmin] text-teal-100/80">
            {q?.current ? `Token ${q.current.token} · ${q.current.time} slot — please come to the chair` : "No one waiting right now"}
          </p>
        </div>
        <div className="border-l border-white/15 pl-[4vmin]">
          <p className="label-mono text-[2vmin] text-teal-300">Next</p>
          <ul className="mt-[2vmin] space-y-[1.5vmin]">
            {(q?.next ?? []).map((n) => (
              <li key={n.token} className="flex items-baseline justify-between gap-6 border-b border-white/10 pb-[1.5vmin]">
                <span className="font-display text-[9vmin] leading-none">{String(n.token).padStart(2, "0")}</span>
                <span className="text-[2.6vmin] text-teal-100/70">{n.time}</span>
              </li>
            ))}
            {q && !q.next.length && <li className="text-[3vmin] text-teal-100/60">—</li>}
          </ul>
        </div>
      </section>

      <footer className="flex items-center justify-between label-mono text-[1.6vmin] text-teal-300">
        <span>{q ? `${q.waiting} waiting · ${q.seen} seen today` : "Loading…"}</span>
        <span>{offline ? "Reconnecting…" : "Book your next token online"}</span>
      </footer>
    </main>
  );
}
