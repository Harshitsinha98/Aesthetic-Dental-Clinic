"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Found = {
  reference: string;
  tokenNumber: number;
  date: string;
  slotStart: string;
  patientName: string;
  status: "confirmed" | "completed" | "no_show" | "cancelled";
};

const STATUS: Record<Found["status"], string> = {
  confirmed: "Confirmed",
  completed: "Visit completed",
  no_show: "Marked as missed",
  cancelled: "Cancelled",
};

function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function MyToken() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [ahead, setAhead] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?reference=${encodeURIComponent(code.trim())}&phone=${encodeURIComponent(phone)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setFound(null);
        setError(data.error);
        return;
      }
      setFound(data.appointment);
      setAhead(data.queueAhead ?? 0);
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: code.trim(), phone }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setFound((f) => (f ? { ...f, status: "cancelled" } : f));
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const input = "mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none focus:border-crimson";

  return (
    <div>
      <form onSubmit={lookup} className="grid gap-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label>
          <span className="label-mono text-ink-mute">Booking code</span>
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="AAD-XXXXXX" className={`${input} font-mono tracking-wider`} />
        </label>
        <label>
          <span className="label-mono text-ink-mute">Mobile number</span>
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </label>
        <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-porcelain disabled:opacity-60">
          {busy && !found ? <Loader2 className="size-4 animate-spin" /> : null} Find
        </button>
      </form>

      {error && <p role="alert" className="mt-6 border-l-2 border-crimson bg-blush/50 px-4 py-3 text-sm text-crimson-dark">{error}</p>}

      {found && (
        <div className="mt-10 border border-ink/15 bg-white p-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="label-mono text-ink-mute">Token</p>
              <p className="font-display text-7xl leading-none text-teal-800">{String(found.tokenNumber).padStart(2, "0")}</p>
            </div>
            <span className={`label-mono rounded-full px-3 py-1.5 ${found.status === "cancelled" ? "bg-blush text-crimson-dark" : "bg-teal-50 text-teal-800"}`}>
              {STATUS[found.status]}
            </span>
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="label-mono text-ink-mute">Patient</dt><dd className="mt-1 font-medium">{found.patientName}</dd></div>
            <div><dt className="label-mono text-ink-mute">Date</dt><dd className="mt-1 font-medium">{new Date(`${found.date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</dd></div>
            <div><dt className="label-mono text-ink-mute">Report by</dt><dd className="mt-1 font-medium">{to12h(found.slotStart)}</dd></div>
          </dl>
          {found.status === "confirmed" && (
            <>
              <p className="mt-6 text-sm text-ink-soft">{ahead > 0 ? `${ahead} patient(s) are booked before you.` : "No one is booked before you."}</p>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-6">
                {!confirming ? (
                  <button onClick={() => setConfirming(true)} className="rounded-full border border-crimson px-5 py-3 text-sm font-medium text-crimson">Cancel this token</button>
                ) : (
                  <>
                    <button disabled={busy} onClick={cancel} className="rounded-full bg-crimson px-5 py-3 text-sm font-medium text-white disabled:opacity-60">Yes, cancel it</button>
                    <button onClick={() => setConfirming(false)} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium">Keep it</button>
                  </>
                )}
              </div>
            </>
          )}
          {found.status === "cancelled" && (
            <Link href="/book" className="mt-6 inline-block rounded-full bg-crimson px-5 py-3 text-sm font-medium text-white">Book a new token</Link>
          )}
        </div>
      )}
    </div>
  );
}
