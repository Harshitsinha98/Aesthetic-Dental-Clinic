"use client";

/**
 * Align Assistant — a small chat that answers practical questions (hours,
 * directions, treatments, booking). Streams from /api/chat; with no AI key the
 * server answers from a built-in responder, so it always works.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUp, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What are your timings?", "Aligners or braces?", "How do I book a token?", "Where is the clinic?"];
const GREETING: Msg = {
  role: "assistant",
  content: "Hello — I’m the Align Assistant. I can help with **timings**, **directions**, **treatments** and **booking a token**. What would you like to know?",
};

function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const bullet = /^\s*[-•*]\s+/.test(line);
        const parts = line.replace(/^\s*[-•*]\s+/, "").split(/(\*\*[^*]+\*\*)/g);
        const content = parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong> : <Fragment key={j}>{p}</Fragment>,
        );
        if (!line.trim()) return <span key={i} className="block h-2" />;
        return bullet ? (
          <span key={i} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rotate-45 bg-crimson" /><span>{content}</span></span>
        ) : (
          <span key={i} className="block">{content}</span>
        );
      })}
    </>
  );
}

export function Assistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // The launcher waits until the visitor scrolls past the hero, so it never
  // sits on top of the hero controls on a short laptop screen.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480 || pathname !== "/");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("align:assistant", openIt);
    return () => window.removeEventListener("align:assistant", openIt);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (pathname.startsWith("/admin")) return null;

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m !== GREETING).slice(-12) }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([...history, { role: "assistant", content: "Sorry, I couldn’t answer just now. Please call **+91 74770 03741**." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && scrolled && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => setOpen(true)}
            className="fixed right-6 bottom-6 z-40 hidden items-center lg:flex gap-2.5 rounded-full border border-ink/10 bg-porcelain py-2 pr-4 pl-2 text-sm font-medium shadow-[0_14px_30px_-14px_rgb(15_26_27/0.45)]"
            aria-label="Open Align Assistant"
          >
            <span className="grid size-8 place-items-center rounded-full bg-teal-50"><LogoMark className="size-6" animated /></span>
            Ask Align
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Align Assistant"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 z-[60] flex max-h-[80svh] flex-col overflow-hidden border border-ink/10 bg-porcelain shadow-[0_30px_60px_-20px_rgb(15_26_27/0.45)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem]"
          >
            <header className="flex items-center justify-between border-b border-ink/10 bg-teal-950 px-4 py-3 text-porcelain">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-porcelain"><LogoMark className="size-7" /></span>
                <div>
                  <p className="font-medium leading-tight">Align Assistant</p>
                  <p className="label-mono text-teal-300">General info · not medical advice</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={cn("max-w-[88%] px-3.5 py-2.5 text-[0.92rem] leading-relaxed", m.role === "user" ? "ml-auto bg-ink text-porcelain" : "bg-white text-ink")}>
                  {m.content ? <Rich text={m.content} /> : <span className="inline-flex gap-1"><span className="size-1.5 animate-bounce rounded-full bg-ink-mute" /><span className="size-1.5 animate-bounce rounded-full bg-ink-mute [animation-delay:.15s]" /><span className="size-1.5 animate-bounce rounded-full bg-ink-mute [animation-delay:.3s]" /></span>}
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:border-ink">{s}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-ink/10 p-3">
              <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Type a question…" className="flex-1 bg-transparent px-2 py-2 text-base outline-none sm:text-sm" aria-label="Your question" />
                <button disabled={busy || !input.trim()} aria-label="Send" className="grid size-9 place-items-center rounded-full bg-crimson text-white disabled:opacity-40"><ArrowUp className="size-4" /></button>
              </form>
              <Link href="/book" onClick={() => setOpen(false)} className="mt-1 flex items-center justify-center gap-1.5 label-mono text-ink-mute hover:text-ink">Book a token <ArrowRight className="size-3" /></Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
