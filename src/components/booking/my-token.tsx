"use client";

/**
 * My token: tokens saved on this phone (no typing needed) with their live
 * status, plus a lookup by booking code + mobile number for everything else.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { SaveTokenActions } from "@/components/booking/save-token";
import { clinic, telHref } from "@/lib/clinic";
import { dateLabel, listSaved, removeToken, saveToken, to12h, type SavedToken } from "@/lib/token-save";
import { cn } from "@/lib/cn";

type Status = "confirmed" | "completed" | "no_show" | "cancelled";
type Live = { status: Status; ahead: number } | { status: "unknown" };

const STATUS: Record<Status, string> = {
  confirmed: "Confirmed",
  completed: "Visit completed",
  no_show: "Marked as missed",
  cancelled: "Cancelled",
};

async function fetchStatus(t: Pick<SavedToken, "reference" | "phone">): Promise<Live & { appointment?: SavedToken }> {
  const res = await fetch(`/api/appointments?reference=${encodeURIComponent(t.reference)}&phone=${encodeURIComponent(t.phone)}`, { cache: "no-store" });
  if (!res.ok) return { status: "unknown" };
  const data = await res.json();
  return {
    status: data.appointment.status,
    ahead: data.queueAhead ?? 0,
    appointment: { ...data.appointment, phone: t.phone, savedAt: "" },
  };
}

function TokenCard({ token, live, onCancelled, onRemove }: { token: SavedToken; live?: Live; onCancelled: () => void; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = live && live.status !== "unknown" ? live.status : null;
  const upcoming = status === "confirmed";

  const cancel = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/appointments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: token.reference, phone: token.phone }),
    });
    setBusy(false);
    setConfirming(false);
    if (!res.ok) setError((await res.json()).error ?? "Could not cancel. Please call the clinic.");
    else onCancelled();
  };

  return (
    <li className="border border-ink/15 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-end gap-5">
          <div>
            <p className="label-mono text-ink-mute">Token</p>
            <p className="font-display text-6xl leading-none text-teal-800">{String(token.tokenNumber).padStart(2, "0")}</p>
          </div>
          <div className="pb-1">
            <p className="font-medium">{dateLabel(token.date, "long")}</p>
            <p className="text-ink-soft">Report by {to12h(token.slotStart)} · {token.patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "label-mono rounded-full px-3 py-1.5",
              status === "cancelled" ? "bg-blush text-crimson-dark" : status ? "bg-teal-50 text-teal-800" : "bg-paper text-ink-mute",
            )}
          >
            {status ? STATUS[status] : live ? "Status unavailable" : "Checking…"}
          </span>
          <button type="button" onClick={onRemove} aria-label="Remove from this phone" className="grid size-8 place-items-center rounded-full text-ink-mute hover:bg-paper hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {upcoming && live && live.status === "confirmed" && (
        <p className="mt-4 text-sm text-ink-soft">
          {live.ahead > 0 ? `${live.ahead} patient${live.ahead > 1 ? "s are" : " is"} booked before you.` : "No one is booked before you."} Code{" "}
          <span className="font-mono text-ink">{token.reference}</span>
        </p>
      )}
      {error && <p className="mt-3 text-sm text-crimson">{error}</p>}

      {upcoming && (
        <div className="mt-5 flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <SaveTokenActions token={token} compact />
          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="self-start text-sm font-medium text-crimson hover:underline sm:self-auto">
              Cancel this token
            </button>
          ) : (
            <div className="flex gap-2">
              <button disabled={busy} onClick={cancel} className="rounded-full bg-crimson px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {busy ? "Cancelling…" : "Yes, cancel"}
              </button>
              <button onClick={() => setConfirming(false)} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium">Keep</button>
            </div>
          )}
        </div>
      )}
      {status === "cancelled" && (
        <Link href="/book" className="mt-5 inline-block rounded-full bg-crimson px-5 py-2.5 text-sm font-medium text-white">Book a new token</Link>
      )}
    </li>
  );
}

export function MyToken() {
  const [saved, setSaved] = useState<SavedToken[] | null>(null);
  const [live, setLive] = useState<Record<string, Live>>({});
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (list: SavedToken[]) => {
    const entries = await Promise.all(list.map(async (t) => [t.reference, await fetchStatus(t).catch(() => ({ status: "unknown" as const }))] as const));
    setLive(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    const list = listSaved();
    setSaved(list);
    void refresh(list);
  }, [refresh]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await fetchStatus({ reference: code.trim().toUpperCase(), phone });
      if (result.status === "unknown" || !result.appointment) {
        setError("No booking found for that code and mobile number.");
        return;
      }
      saveToken(result.appointment);
      const list = listSaved();
      setSaved(list);
      setLive((l) => ({ ...l, [result.appointment!.reference]: result }));
      setCode("");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none focus:border-crimson";

  return (
    <div>
      <section aria-labelledby="saved-title">
        <h2 id="saved-title" className="label-mono text-ink-mute">Saved on this phone</h2>
        {saved === null ? (
          <p className="mt-4 flex items-center gap-2 text-ink-mute"><Loader2 className="size-4 animate-spin" /> Loading…</p>
        ) : saved.length === 0 ? (
          <p className="mt-4 border border-dashed border-ink/20 p-6 text-ink-soft">
            Tokens you book on this phone appear here automatically. Booked on another phone? Find it below with your booking code.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {saved.map((t) => (
              <TokenCard
                key={t.reference}
                token={t}
                live={live[t.reference]}
                onCancelled={() => setLive((l) => ({ ...l, [t.reference]: { status: "cancelled", ahead: 0 } }))}
                onRemove={() => {
                  removeToken(t.reference);
                  setSaved(listSaved());
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10" aria-labelledby="find-title">
        <h2 id="find-title" className="text-2xl">Find a token</h2>
        <p className="mt-2 text-ink-soft">Enter the booking code and the mobile number it was booked with.</p>
        <form onSubmit={lookup} className="mt-6 grid gap-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label>
            <span className="label-mono text-ink-mute">Booking code</span>
            <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="AAD-XXXXXX" className={`${input} font-mono tracking-wider`} />
          </label>
          <label>
            <span className="label-mono text-ink-mute">Mobile number</span>
            <input required type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
          </label>
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-porcelain disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />} Find
          </button>
        </form>
        {error && <p role="alert" className="mt-6 border-l-2 border-crimson bg-blush/50 px-4 py-3 text-sm text-crimson-dark">{error}</p>}
        <p className="mt-8 text-sm text-ink-mute">
          Don’t have the code? Call <a href={telHref()} className="font-medium text-ink underline">{clinic.phoneDisplay}</a> — the front desk can find your token from your mobile number.
        </p>
      </section>
    </div>
  );
}
