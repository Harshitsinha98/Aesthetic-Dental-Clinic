"use client";

import { useState } from "react";
import { CalendarPlus, Check, Download, Loader2, MessageSquare, Printer, Share2 } from "lucide-react";
import { clinicWhatsAppHref, downloadIcs, downloadImage, googleCalendarHref, shareToken, smsHref, type SavedToken } from "@/lib/token-save";
import { cn } from "@/lib/cn";

/** The row of "keep your token" actions, used on the success screen and My token. */
export function SaveTokenActions({ token, compact = false }: { token: SavedToken; compact?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  const run = async (key: string, fn: () => Promise<unknown> | unknown) => {
    setBusy(key);
    try {
      await fn();
      setDone(key);
      setTimeout(() => setDone((d) => (d === key ? null : d)), 2200);
    } finally {
      setBusy(null);
    }
  };

  const btn = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white font-medium transition hover:border-ink",
    compact ? "px-3.5 py-2 text-xs" : "px-5 py-3 text-sm",
  );
  const icon = (key: string, Icon: typeof Download) =>
    busy === key ? <Loader2 className="size-4 animate-spin" /> : done === key ? <Check className="size-4 text-teal-700" /> : <Icon className="size-4" />;

  const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  );

  return (
    <div className={cn("grid gap-2 sm:flex sm:flex-wrap", compact ? "grid-cols-2" : "grid-cols-2")}>
      <a
        href={clinicWhatsAppHref(token)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp font-medium text-white transition hover:bg-whatsapp-dark",
          compact ? "px-3.5 py-2 text-xs" : "px-5 py-3 text-sm",
        )}
      >
        <WhatsAppIcon className={compact ? "size-4" : "size-4"} /> Send to the clinic on WhatsApp
      </a>
      <button type="button" className={cn(btn, "col-span-2 border-ink bg-ink text-porcelain hover:bg-teal-900 sm:col-auto")} onClick={() => run("img", () => downloadImage(token))}>
        {icon("img", Download)} Save token image
      </button>
      <div className="relative">
        <button type="button" className={cn(btn, "w-full")} aria-expanded={calOpen} onClick={() => setCalOpen((v) => !v)}>
          <CalendarPlus className="size-4" /> Add to calendar
        </button>
        {calOpen && (
          <div className="absolute top-full left-0 z-20 mt-2 w-56 border border-ink/10 bg-white p-1 shadow-lg">
            <a href={googleCalendarHref(token)} target="_blank" rel="noopener noreferrer" onClick={() => setCalOpen(false)} className="block px-3 py-2.5 text-sm hover:bg-paper">
              Google Calendar
            </a>
            <button type="button" onClick={() => { downloadIcs(token); setCalOpen(false); }} className="block w-full px-3 py-2.5 text-left text-sm hover:bg-paper">
              Apple / Outlook (.ics)
            </button>
          </div>
        )}
      </div>
      <button type="button" className={btn} onClick={() => run("share", () => shareToken(token))}>
        {icon("share", Share2)} Share
      </button>
      <a href={smsHref(token)} className={btn}>
        <MessageSquare className="size-4" /> Send by SMS
      </a>
      {!compact && (
        <button type="button" className={cn(btn, "col-span-2 sm:col-auto")} onClick={() => window.print()}>
          <Printer className="size-4" /> Print
        </button>
      )}
    </div>
  );
}
