"use client";

/**
 * Front-desk register: the day's tokens in clock order, one-tap status
 * changes, walk-in / phone tokens, and the WhatsApp outbox so staff can see
 * exactly what the patient and the doctor were sent.
 *
 * The passcode lives in sessionStorage and dies with the tab — a counter PC
 * left logged in overnight is a realistic risk at a small clinic.
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, LogOut, Plus, RefreshCw } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

type Status = "confirmed" | "completed" | "no_show" | "cancelled";
type Token = {
  reference: string;
  tokenNumber: number;
  slotStart: string;
  patientName: string;
  patientPhone: string;
  patientAge: number | null;
  patientGender: string | null;
  reason: string | null;
  channel: string;
  status: Status;
};
type Outbox = { id: number; to: string; body: string; kind: string; audience: string | null; reference: string | null; status: string; error: string | null; createdAt: string };
type Register = {
  date: string;
  stats: { total: number; booked: number; available: number; closed: boolean };
  tokens: Token[];
  outbox: Outbox[];
  health: { whatsapp: string; doctorNumber: string; storage: { backend: string; ephemeral: boolean } };
};

const KEY = "aad.admin.passcode";
const todayIst = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const STATUS_STYLE: Record<Status, string> = {
  confirmed: "bg-teal-50 text-teal-800",
  completed: "bg-ink text-porcelain",
  no_show: "bg-bone text-ink-soft",
  cancelled: "bg-blush text-crimson-dark",
};

export function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayIst);
  const [data, setData] = useState<Register | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"tokens" | "outbox">("tokens");
  const [walkIn, setWalkIn] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(KEY);
      if (stored) {
        setPasscode(stored);
        setAuthed(true);
      }
    } catch {}
  }, []);

  const load = useCallback(async (code: string, day: string) => {
    setLoading(true);
    setError(null);
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
      setData(payload);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void load(passcode, date);
    const id = window.setInterval(() => void load(passcode, date), 60_000);
    return () => window.clearInterval(id);
  }, [authed, passcode, date, load]);

  const setStatus = async (reference: string, status: Status) => {
    if (status === "cancelled" && !window.confirm("Cancel this token? The patient and doctor will be notified on WhatsApp.")) return;
    const res = await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-passcode": passcode },
      body: JSON.stringify({ reference, status }),
    });
    if (!res.ok) setError((await res.json()).error ?? "Update failed.");
    await load(passcode, date);
  };

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
          <p className="mt-2 text-sm text-ink-mute">Enter the counter passcode to open the token register.</p>
          <input type="password" required autoFocus value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" className="mt-6 w-full border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none focus:border-crimson" />
          {error && <p className="mt-3 text-sm text-crimson">{error}</p>}
          <button className="mt-6 w-full rounded-full bg-ink py-3.5 font-medium text-porcelain">Open register</button>
        </form>
      </div>
    );
  }

  const active = data?.tokens.filter((t) => t.status !== "cancelled") ?? [];
  const cancelled = data?.tokens.filter((t) => t.status === "cancelled") ?? [];
  const nextUp = active.find((t) => t.status === "confirmed");

  return (
    <div className="min-h-svh bg-paper">
      <header className="border-b border-ink/10 bg-porcelain">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <div>
              <p className="font-display text-xl leading-none">Token register</p>
              <p className="label-mono mt-1 text-ink-mute">Dr. Nikita Soni</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-ink/15 bg-white px-3 py-2 text-sm" />
            <button onClick={() => load(passcode, date)} className="inline-flex items-center gap-2 border border-ink/15 bg-white px-3 py-2 text-sm">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh
            </button>
            <button onClick={() => setWalkIn((v) => !v)} className="inline-flex items-center gap-2 bg-crimson px-3 py-2 text-sm text-white">
              <Plus className="size-4" /> Walk-in / phone
            </button>
            <button onClick={() => { sessionStorage.removeItem(KEY); setAuthed(false); setData(null); setPasscode(""); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-ink-mute">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {error && <p className="mb-6 border-l-2 border-crimson bg-blush/60 px-4 py-3 text-sm text-crimson-dark">{error}</p>}

        {data && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className={cn("px-3 py-1.5", data.health.whatsapp === "live" ? "bg-teal-50 text-teal-800" : "bg-blush text-crimson-dark")}>
              WhatsApp: {data.health.whatsapp === "live" ? "live" : "test mode — messages are logged below, not sent"}
            </span>
            <span className="bg-white px-3 py-1.5">Doctor alerts: {data.health.doctorNumber}</span>
            <span className={cn("px-3 py-1.5", data.health.storage.ephemeral ? "bg-blush text-crimson-dark" : "bg-white")}>
              Storage: {data.health.storage.backend}{data.health.storage.ephemeral ? " (TEMPORARY — bookings will be lost)" : ""}
            </span>
          </div>
        )}

        {walkIn && <WalkInForm passcode={passcode} date={date} onDone={() => { setWalkIn(false); void load(passcode, date); }} />}

        {data && (
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Booked", data.stats.booked],
              ["Free slots", data.stats.available],
              ["Seen", active.filter((t) => t.status === "completed").length],
              ["Next up", nextUp ? `#${nextUp.tokenNumber} · ${to12h(nextUp.slotStart)}` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-5">
                <p className="label-mono text-ink-mute">{k}</p>
                <p className="mt-2 font-display text-3xl">{v}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-6 border-b border-ink/15">
          {(["tokens", "outbox"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 pb-3 text-sm font-medium", tab === t ? "border-crimson" : "border-transparent text-ink-mute")}>
              {t === "tokens" ? `Tokens (${active.length})` : `WhatsApp outbox (${data?.outbox.length ?? 0})`}
            </button>
          ))}
        </div>

        {tab === "tokens" && (
          <div className="mt-4 overflow-x-auto bg-white">
            {data?.stats.closed ? (
              <p className="p-8 text-ink-mute">The clinic is closed on this date.</p>
            ) : active.length === 0 ? (
              <p className="p-8 text-ink-mute">No tokens booked for this date yet.</p>
            ) : (
              <table className="w-full min-w-[56rem] text-sm">
                <thead className="label-mono text-left text-ink-mute">
                  <tr className="border-b border-ink/10">
                    {["Token", "Time", "Patient", "Mobile", "Reason", "Code", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.map((t) => (
                    <tr key={t.reference} className="border-b border-ink/5 align-top">
                      <td className="px-4 py-3 font-display text-2xl">{t.tokenNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{to12h(t.slotStart)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.patientName}</p>
                        <p className="text-xs text-ink-mute">{[t.patientAge, t.patientGender, t.channel === "web" ? "online" : t.channel.replace("_", "-")].filter(Boolean).join(" · ")}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><a href={`tel:${t.patientPhone.replace(/\s/g, "")}`} className="underline">{t.patientPhone}</a></td>
                      <td className="max-w-[16rem] px-4 py-3 text-ink-soft">{t.reason ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                      <td className="px-4 py-3"><span className={cn("label-mono px-2 py-1", STATUS_STYLE[t.status])}>{t.status.replace("_", "-")}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 whitespace-nowrap">
                          {t.status !== "completed" && <button onClick={() => setStatus(t.reference, "completed")} className="bg-ink px-2.5 py-1.5 text-xs text-porcelain">Seen</button>}
                          {t.status === "confirmed" && <button onClick={() => setStatus(t.reference, "no_show")} className="border border-ink/15 px-2.5 py-1.5 text-xs">No-show</button>}
                          {t.status !== "confirmed" && <button onClick={() => setStatus(t.reference, "confirmed")} className="border border-ink/15 px-2.5 py-1.5 text-xs">Undo</button>}
                          <button onClick={() => setStatus(t.reference, "cancelled")} className="px-2.5 py-1.5 text-xs text-crimson">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {cancelled.length > 0 && (
              <p className="border-t border-ink/10 px-4 py-3 text-xs text-ink-mute">
                Cancelled: {cancelled.map((t) => `#${t.tokenNumber} ${t.patientName}`).join(", ")}
              </p>
            )}
          </div>
        )}

        {tab === "outbox" && (
          <ul className="mt-4 space-y-3">
            {data?.outbox.length === 0 && <li className="bg-white p-8 text-ink-mute">No messages yet.</li>}
            {data?.outbox.map((m) => (
              <li key={m.id} className="bg-white p-5">
                <div className="flex flex-wrap items-center gap-3 label-mono text-ink-mute">
                  <span className={cn("px-2 py-1", m.audience === "doctor" ? "bg-teal-50 text-teal-800" : "bg-paper text-ink")}>{m.audience ?? "—"}</span>
                  <span>+{m.to}</span>
                  <span className={cn(m.status === "sent" ? "text-teal-700" : m.status === "failed" ? "text-crimson" : "text-ink-mute")}>{m.status}</span>
                  <span>{m.kind}</span>
                  <span>{new Date(m.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                </div>
                <pre className="mt-3 font-sans text-sm whitespace-pre-wrap text-ink-soft">{m.body}</pre>
                {m.error && <p className="mt-2 text-xs text-crimson">{m.error}</p>}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function WalkInForm({ passcode, date, onDone }: { passcode: string; date: string; onDone: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", reason: "", channel: "walk_in", notify: true });
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
          body: JSON.stringify({ date, patientName: f.name, patientPhone: f.phone, reason: f.reason || null, channel: f.channel, notify: f.notify }),
        });
        const data = await res.json();
        setBusy(false);
        if (!res.ok) return setMsg(data.error);
        onDone();
      }}
      className="mb-8 grid gap-5 bg-white p-6 md:grid-cols-5 md:items-end"
    >
      <p className="label-mono text-ink-mute md:col-span-5">Next free token on {date}</p>
      <input required placeholder="Patient name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
      <input required placeholder="Mobile" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={field} />
      <input placeholder="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} className={field} />
      <select value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} className={field}>
        <option value="walk_in">Walk-in</option>
        <option value="phone">Phone call</option>
      </select>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.notify} onChange={(e) => setF({ ...f, notify: e.target.checked })} /> WhatsApp</label>
        <button disabled={busy} className="flex-1 bg-ink px-4 py-2.5 text-sm text-porcelain disabled:opacity-60">{busy ? "…" : "Issue token"}</button>
      </div>
      {msg && <p className="text-sm text-crimson md:col-span-5">{msg}</p>}
    </form>
  );
}
