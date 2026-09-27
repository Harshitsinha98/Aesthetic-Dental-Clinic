"use client";

/**
 * Front desk & doctor screen.
 *
 * Replaces WhatsApp alerts: whoever has this open (reception PC, or the
 * doctor's phone) sees new bookings the moment they refresh in — with a
 * toast, an optional chime, an optional desktop notification and a count in
 * the tab title.
 *
 *  • Now serving: the earliest token not yet seen, with one-tap Seen / No-show
 *  • Today's list, filterable, as a table on desktop and cards on a phone
 *  • Find a patient on any date by code, mobile number or name
 *  • Walk-in / phone tokens, print the day's list, open the waiting-room screen
 *
 * The passcode lives in sessionStorage and dies with the tab.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  LogOut,
  Monitor,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

type Status = "confirmed" | "completed" | "no_show" | "cancelled";
type Token = {
  reference: string;
  tokenNumber: number;
  date: string;
  slotStart: string;
  patientName: string;
  patientPhone: string;
  patientAge: number | null;
  patientGender: string | null;
  reason: string | null;
  channel: string;
  status: Status;
  createdAt: string;
};
type Register = {
  date: string;
  today: string;
  stats: { total: number; booked: number; available: number; closed: boolean };
  tokens: Token[];
  health: { storage: { backend: string; ephemeral: boolean } };
};

const KEY = "aad.admin.passcode";
const PREFS = "aad.admin.prefs";
const POLL_MS = 20_000;

const todayIst = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
const shiftDate = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const niceDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const telOf = (p: string) => `tel:${p.replace(/\s/g, "")}`;

const STATUS_LABEL: Record<Status, string> = { confirmed: "Waiting", completed: "Seen", no_show: "No-show", cancelled: "Cancelled" };
const STATUS_STYLE: Record<Status, string> = {
  confirmed: "bg-teal-50 text-teal-800",
  completed: "bg-ink text-porcelain",
  no_show: "bg-bone text-ink-soft",
  cancelled: "bg-blush text-crimson-dark",
};
const FILTERS = ["all", "confirmed", "completed", "no_show", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

function chime() {
  try {
    const ctx = new AudioContext();
    [0, 0.18].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = i ? 1046 : 784;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.4);
    });
  } catch {}
}

export function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayIst);
  const [data, setData] = useState<Register | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [walkIn, setWalkIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alerts, setAlerts] = useState<Token[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [prefs, setPrefs] = useState({ sound: true, desktop: false });
  const known = useRef<{ date: string; refs: Set<string> } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(KEY);
      if (stored) {
        setPasscode(stored);
        setAuthed(true);
      }
      const p = localStorage.getItem(PREFS);
      if (p) setPrefs(JSON.parse(p));
    } catch {}
  }, []);

  const updatePrefs = (next: typeof prefs) => {
    setPrefs(next);
    try { localStorage.setItem(PREFS, JSON.stringify(next)); } catch {}
  };

  const announce = useCallback(
    (fresh: Token[]) => {
      setAlerts((a) => [...fresh, ...a].slice(0, 4));
      setUnseen((n) => n + fresh.length);
      if (prefs.sound) chime();
      if (prefs.desktop && "Notification" in window && Notification.permission === "granted") {
        for (const t of fresh) {
          new Notification(`New booking — Token #${t.tokenNumber}`, {
            body: `${niceDate(t.date)} · ${to12h(t.slotStart)}\n${t.patientName}${t.reason ? ` · ${t.reason}` : ""}`,
            tag: t.reference,
          });
        }
      }
    },
    [prefs],
  );

  const load = useCallback(
    async (code: string, day: string, quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const res = await fetch(`/api/admin/appointments?date=${day}`, { headers: { "x-admin-passcode": code }, cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) {
          setError(payload.error ?? "Could not load the register.");
          if (res.status === 401) {
            setAuthed(false);
            sessionStorage.removeItem(KEY);
          }
          return;
        }
        setError(null);
        const reg = payload as Register;
        const refs = new Set(reg.tokens.map((t) => t.reference));
        const prev = known.current;
        if (prev && prev.date === day) {
          const fresh = reg.tokens.filter((t) => !prev.refs.has(t.reference) && t.status === "confirmed");
          if (fresh.length) announce(fresh);
        }
        known.current = { date: day, refs };
        setData(reg);
      } catch {
        if (!quiet) setError("Network error — retrying.");
      } finally {
        setLoading(false);
      }
    },
    [announce],
  );

  useEffect(() => {
    if (!authed) return;
    void load(passcode, date);
    const id = window.setInterval(() => void load(passcode, date, true), POLL_MS);
    const onFocus = () => {
      void load(passcode, date, true);
      setUnseen(0);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [authed, passcode, date, load]);

  useEffect(() => {
    document.title = unseen ? `(${unseen}) New booking · Front desk` : "Front desk · Align Aesthetic";
  }, [unseen]);

  const setStatus = async (reference: string, status: Status) => {
    if (status === "cancelled" && !window.confirm("Cancel this token? The slot will be released for someone else.")) return;
    // Optimistic, then confirm with the server.
    setData((d) => (d ? { ...d, tokens: d.tokens.map((t) => (t.reference === reference ? { ...t, status } : t)) } : d));
    const res = await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-passcode": passcode },
      body: JSON.stringify({ reference, status }),
    });
    if (!res.ok) setError((await res.json()).error ?? "Update failed.");
    await load(passcode, date, true);
  };

  const tokens = useMemo(() => data?.tokens ?? [], [data]);
  const active = tokens.filter((t) => t.status !== "cancelled");
  const waiting = active.filter((t) => t.status === "confirmed");
  const isToday = data?.date === data?.today;
  const current = isToday ? waiting[0] : undefined;
  const upNext = isToday ? waiting.slice(1, 4) : [];
  const shown = tokens.filter((t) => (filter === "all" ? t.status !== "cancelled" : t.status === filter));

  if (!authed) {
    return (
      <div className="grid min-h-svh place-items-center bg-teal-950 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try { sessionStorage.setItem(KEY, passcode); } catch {}
            setAuthed(true);
          }}
          className="w-full max-w-sm bg-porcelain p-8"
        >
          <LogoMark className="size-10" />
          <h1 className="mt-6 text-3xl">Front desk</h1>
          <p className="mt-2 text-sm text-ink-mute">Reception and doctor view. Enter the counter passcode.</p>
          <input type="password" required autoFocus value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" className="mt-6 w-full border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none focus:border-crimson" />
          {error && <p className="mt-3 text-sm text-crimson">{error}</p>}
          <button className="mt-6 w-full rounded-full bg-ink py-3.5 font-medium text-porcelain">Open register</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-paper pb-16" onClick={() => unseen && setUnseen(0)}>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-porcelain/95 backdrop-blur print:static">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <div>
              <p className="font-display text-xl leading-none">Front desk</p>
              <p className="label-mono mt-1 flex items-center gap-1.5 text-ink-mute">
                <span className="size-1.5 animate-pulse rounded-full bg-teal-500" /> Live · refreshes every 20s
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 print:hidden">
            <button onClick={() => setSearchOpen(true)} className="inline-flex items-center gap-2 border border-ink/15 bg-white px-3 py-2 text-sm"><Search className="size-4" /> Find patient</button>
            <button onClick={() => setWalkIn((v) => !v)} className="inline-flex items-center gap-2 bg-crimson px-3 py-2 text-sm text-white"><Plus className="size-4" /> Walk-in</button>
            <button onClick={() => updatePrefs({ ...prefs, sound: !prefs.sound })} aria-label={prefs.sound ? "Mute new-booking sound" : "Turn on new-booking sound"} className="grid size-9 place-items-center border border-ink/15 bg-white">
              {prefs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-ink-mute" />}
            </button>
            <button
              onClick={async () => {
                if (!("Notification" in window)) return setError("This browser does not support notifications.");
                if (prefs.desktop) return updatePrefs({ ...prefs, desktop: false });
                const p = await Notification.requestPermission();
                updatePrefs({ ...prefs, desktop: p === "granted" });
                if (p !== "granted") setError("Notifications are blocked for this site in the browser settings.");
              }}
              aria-label={prefs.desktop ? "Turn off desktop alerts" : "Turn on desktop alerts"}
              className="grid size-9 place-items-center border border-ink/15 bg-white"
            >
              {prefs.desktop ? <Bell className="size-4" /> : <BellOff className="size-4 text-ink-mute" />}
            </button>
            <Link href="/queue" target="_blank" aria-label="Open waiting-room screen" className="grid size-9 place-items-center border border-ink/15 bg-white"><Monitor className="size-4" /></Link>
            <button onClick={() => window.print()} aria-label="Print the day's list" className="grid size-9 place-items-center border border-ink/15 bg-white"><Printer className="size-4" /></button>
            <button onClick={() => { sessionStorage.removeItem(KEY); setAuthed(false); setData(null); setPasscode(""); known.current = null; }} aria-label="Sign out" className="grid size-9 place-items-center text-ink-mute"><LogOut className="size-4" /></button>
          </div>
        </div>
      </header>

      {/* New-booking toasts */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 print:hidden" aria-live="polite">
        <AnimatePresence>
          {alerts.map((t) => (
            <motion.div
              key={t.reference}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-3 border-l-4 border-crimson bg-white p-4 shadow-lg"
            >
              <div className="flex-1">
                <p className="label-mono text-crimson">New booking</p>
                <p className="mt-1 font-medium">Token #{t.tokenNumber} · {to12h(t.slotStart)}</p>
                <p className="text-sm text-ink-soft">{t.patientName}{t.reason ? ` · ${t.reason}` : ""}</p>
              </div>
              <button onClick={() => setAlerts((a) => a.filter((x) => x.reference !== t.reference))} aria-label="Dismiss" className="text-ink-mute"><X className="size-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="container-page py-6">
        {/* Date bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setDate((d) => shiftDate(d, -1))} aria-label="Previous day" className="grid size-10 place-items-center border border-ink/15 bg-white"><ChevronLeft className="size-4" /></button>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-10 border border-ink/15 bg-white px-3 text-sm" />
            <button onClick={() => setDate((d) => shiftDate(d, 1))} aria-label="Next day" className="grid size-10 place-items-center border border-ink/15 bg-white"><ChevronRight className="size-4" /></button>
            {date !== todayIst() && <button onClick={() => setDate(todayIst())} className="h-10 border border-ink/15 bg-white px-3 text-sm">Today</button>}
          </div>
          <button onClick={() => load(passcode, date)} className="inline-flex items-center gap-2 text-sm text-ink-mute">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh
          </button>
        </div>
        <h1 className="mt-5 hidden text-2xl print:block">Token list · {niceDate(date)}</h1>

        {error && <p className="mt-4 border-l-2 border-crimson bg-blush/60 px-4 py-3 text-sm text-crimson-dark">{error}</p>}
        {data?.health.storage.ephemeral && (
          <p className="mt-4 border-l-2 border-crimson bg-blush/60 px-4 py-3 text-sm text-crimson-dark">Storage is TEMPORARY — bookings will be lost. Configure Turso before taking real bookings.</p>
        )}

        {walkIn && <WalkInForm passcode={passcode} date={date} onDone={() => { setWalkIn(false); void load(passcode, date, true); }} />}

        {/* Now serving */}
        {isToday && !data?.stats.closed && (
          <section className="mt-6 grid gap-4 lg:grid-cols-3 print:hidden" aria-label="Now serving">
            <div className="bg-teal-950 p-6 text-porcelain lg:col-span-2">
              <p className="label-mono text-teal-300">Now serving</p>
              {current ? (
                <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
                  <div className="flex items-end gap-5">
                    <span className="font-display text-7xl leading-[0.8]">{String(current.tokenNumber).padStart(2, "0")}</span>
                    <div>
                      <p className="text-lg font-medium">{current.patientName}</p>
                      <p className="text-sm text-teal-100/80">
                        {to12h(current.slotStart)}
                        {current.patientAge ? ` · ${current.patientAge}` : ""}
                        {current.patientGender ? ` · ${current.patientGender}` : ""}
                      </p>
                      {current.reason && <p className="mt-1 max-w-md text-sm text-teal-50">“{current.reason}”</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setStatus(current.reference, "completed")} className="rounded-full bg-porcelain px-5 py-3 text-sm font-medium text-ink">Seen · call next</button>
                    <button onClick={() => setStatus(current.reference, "no_show")} className="rounded-full border border-white/25 px-5 py-3 text-sm font-medium">No-show</button>
                    <a href={telOf(current.patientPhone)} aria-label={`Call ${current.patientName}`} className="grid size-11 place-items-center rounded-full border border-white/25"><Phone className="size-4" /></a>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-lg text-teal-100/80">No one waiting right now.</p>
              )}
            </div>
            <div className="bg-white p-6">
              <p className="label-mono text-ink-mute">Up next</p>
              {upNext.length ? (
                <ul className="mt-3 divide-y divide-ink/10">
                  {upNext.map((t) => (
                    <li key={t.reference} className="flex items-baseline gap-3 py-2">
                      <span className="font-display text-2xl">{t.tokenNumber}</span>
                      <span className="flex-1 truncate">{t.patientName}</span>
                      <span className="text-sm text-ink-mute">{to12h(t.slotStart)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-ink-mute">—</p>
              )}
            </div>
          </section>
        )}

        {/* Stats */}
        {data && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 print:hidden">
            {[
              ["Booked", active.length],
              ["Waiting", waiting.length],
              ["Seen", active.filter((t) => t.status === "completed").length],
              ["Free slots", data.stats.available],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <p className="label-mono text-ink-mute">{k}</p>
                <p className="mt-1 font-display text-3xl">{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1 print:hidden">
          {FILTERS.map((f) => {
            const count = f === "all" ? active.length : tokens.filter((t) => t.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm", filter === f ? "border-ink bg-ink text-porcelain" : "border-ink/15 bg-white")}>
                {f === "all" ? "All" : STATUS_LABEL[f]} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {data?.stats.closed ? (
          <p className="mt-4 bg-white p-8 text-ink-mute">The clinic is closed on this date.</p>
        ) : shown.length === 0 ? (
          <p className="mt-4 bg-white p-8 text-ink-mute">{data ? "No tokens here yet." : "Loading…"}</p>
        ) : (
          <>
            {/* Phone: cards */}
            <ul className="mt-4 space-y-2 md:hidden print:hidden">
              {shown.map((t) => (
                <li key={t.reference} className={cn("bg-white p-4", t === current && "ring-2 ring-teal-500")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-3xl">{t.tokenNumber}</span>
                      <div>
                        <p className="font-medium">{t.patientName}</p>
                        <p className="text-sm text-ink-mute">{to12h(t.slotStart)} · {t.channel === "web" ? "online" : t.channel.replace("_", "-")}</p>
                      </div>
                    </div>
                    <span className={cn("label-mono shrink-0 px-2 py-1", STATUS_STYLE[t.status])}>{STATUS_LABEL[t.status]}</span>
                  </div>
                  {t.reason && <p className="mt-2 text-sm text-ink-soft">{t.reason}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <a href={telOf(t.patientPhone)} className="inline-flex items-center gap-1.5 border border-ink/15 px-3 py-2 text-xs"><Phone className="size-3.5" /> {t.patientPhone}</a>
                    <RowActions t={t} setStatus={setStatus} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop + print: table */}
            <div className="mt-4 hidden overflow-x-auto bg-white md:block print:block">
              <table className="w-full text-sm">
                <thead className="label-mono text-left text-ink-mute">
                  <tr className="border-b border-ink/10">
                    {["Token", "Time", "Patient", "Mobile", "Reason", "Code", "Status", ""].map((h) => (
                      <th key={h} className={cn("px-4 py-3 font-normal", h === "" && "print:hidden")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((t) => (
                    <tr key={t.reference} className={cn("border-b border-ink/5 align-top", t === current && "bg-teal-50/60")}>
                      <td className="px-4 py-3 font-display text-2xl">{t.tokenNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{to12h(t.slotStart)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.patientName}</p>
                        <p className="text-xs text-ink-mute">{[t.patientAge, t.patientGender, t.channel === "web" ? "online" : t.channel.replace("_", "-")].filter(Boolean).join(" · ")}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><a href={telOf(t.patientPhone)} className="underline">{t.patientPhone}</a></td>
                      <td className="max-w-[16rem] px-4 py-3 text-ink-soft">{t.reason ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                      <td className="px-4 py-3"><span className={cn("label-mono px-2 py-1", STATUS_STYLE[t.status])}>{STATUS_LABEL[t.status]}</span></td>
                      <td className="px-4 py-3 print:hidden"><div className="flex gap-1.5 whitespace-nowrap"><RowActions t={t} setStatus={setStatus} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {searchOpen && (
          <FindPatient
            passcode={passcode}
            onClose={() => setSearchOpen(false)}
            onOpenDate={(d) => { setDate(d); setFilter("all"); setSearchOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RowActions({ t, setStatus }: { t: Token; setStatus: (ref: string, s: Status) => void }) {
  if (t.status === "cancelled") return null;
  return (
    <>
      {t.status !== "completed" && <button onClick={() => setStatus(t.reference, "completed")} className="bg-ink px-3 py-2 text-xs text-porcelain">Seen</button>}
      {t.status === "confirmed" && <button onClick={() => setStatus(t.reference, "no_show")} className="border border-ink/15 px-3 py-2 text-xs">No-show</button>}
      {t.status !== "confirmed" && <button onClick={() => setStatus(t.reference, "confirmed")} className="border border-ink/15 px-3 py-2 text-xs">Undo</button>}
      <button onClick={() => setStatus(t.reference, "cancelled")} className="px-3 py-2 text-xs text-crimson">Cancel</button>
    </>
  );
}

function FindPatient({ passcode, onClose, onOpenDate }: { passcode: string; onClose: () => void; onOpenDate: (d: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Token[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/appointments?q=${encodeURIComponent(q)}`, { headers: { "x-admin-passcode": passcode }, cache: "no-store" });
    const data = await res.json();
    setResults(res.ok ? data.results : []);
    setBusy(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-ink/50 p-4 pt-[10vh]" onClick={onClose}>
      <motion.div initial={{ y: 12 }} animate={{ y: 0 }} className="w-full max-w-xl bg-porcelain p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Find a patient">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">Find a patient</p>
          <button onClick={onClose} aria-label="Close"><X className="size-5" /></button>
        </div>
        <p className="mt-1 text-sm text-ink-mute">Mobile number, booking code or name — any date.</p>
        <form onSubmit={run} className="mt-4 flex gap-2">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="98xxx xxxxx / AAD-… / name" className="flex-1 border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none focus:border-crimson" />
          <button disabled={busy || q.trim().length < 2} className="bg-ink px-4 text-sm text-porcelain disabled:opacity-50">{busy ? "…" : "Search"}</button>
        </form>
        {results && (
          <ul className="mt-5 max-h-[50vh] divide-y divide-ink/10 overflow-y-auto">
            {results.length === 0 && <li className="py-4 text-ink-mute">No bookings found.</li>}
            {results.map((t) => (
              <li key={t.reference} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">#{t.tokenNumber} · {t.patientName}</p>
                  <p className="text-sm text-ink-mute">{niceDate(t.date)} · {to12h(t.slotStart)} · {t.patientPhone} · <span className="font-mono">{t.reference}</span></p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn("label-mono px-2 py-1", STATUS_STYLE[t.status])}>{STATUS_LABEL[t.status]}</span>
                  <button onClick={() => onOpenDate(t.date)} aria-label="Open that day" className="grid size-8 place-items-center border border-ink/15"><ExternalLink className="size-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}

function WalkInForm({ passcode, date, onDone }: { passcode: string; date: string; onDone: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", reason: "", channel: "walk_in" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const field = "w-full border-b border-ink/25 bg-transparent py-2 outline-none focus:border-crimson";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        const res = await fetch("/api/admin/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-passcode": passcode },
          body: JSON.stringify({ date, patientName: f.name, patientPhone: f.phone, reason: f.reason || null, channel: f.channel }),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) return setMsg(data.error);
        onDone();
      }}
      className="mt-6 grid gap-5 bg-white p-6 md:grid-cols-5 md:items-end print:hidden"
    >
      <p className="label-mono text-ink-mute md:col-span-5">Next free token on {niceDate(date)}</p>
      <input required placeholder="Patient name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
      <input required placeholder="Mobile" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={field} />
      <input placeholder="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} className={field} />
      <select value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} className={field}>
        <option value="walk_in">Walk-in</option>
        <option value="phone">Phone call</option>
      </select>
      <button disabled={busy} className="bg-ink px-4 py-2.5 text-sm text-porcelain disabled:opacity-60">{busy ? "…" : "Issue token"}</button>
      {msg && <p className="text-sm text-crimson md:col-span-5">{msg}</p>}
    </form>
  );
}
