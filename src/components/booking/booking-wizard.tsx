"use client";

/**
 * Token booking: day → time → details → slip.
 *
 * Availability is always re-read from the server rather than tracked
 * optimistically; when the server refuses because a slot went, the day filled
 * or the time passed, the wizard rewinds to a freshly loaded grid so the
 * patient chooses from reality.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { TokenSlip } from "@/components/home/token-cta";
import { clinic, whatsappHref } from "@/lib/clinic";
import { cn } from "@/lib/cn";

type SlotDto = {
  index: number;
  token: number;
  startLabel: string;
  sessionLabel: string;
  available: boolean;
  unavailableBecause?: "taken" | "passed";
};

type DateDto = {
  date: string;
  free: number;
  total: number;
  weekday: string;
  dayNumber: number;
  month: string;
  relative: string;
  label: string;
  note: string | null;
};

type Booked = {
  reference: string;
  tokenNumber: number;
  date: string;
  slotStart: string;
  patientName: string;
};

const ease = [0.22, 1, 0.36, 1] as const;
const STEPS = ["Day", "Time", "Details"];

function to12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<string>();
  const [slotIndex, setSlotIndex] = useState<number>();
  const [dates, setDates] = useState<DateDto[]>([]);
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ appt: Booked; ahead: number; note: string | null } | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", reason: "", website: "" });
  const abort = useRef<AbortController | null>(null);

  const load = useCallback(async (target?: string) => {
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setLoading(true);
    try {
      const res = await fetch(`/api/availability${target ? `?date=${target}` : ""}`, { signal: ctl.signal, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load the timings. Please call the clinic.");
        return;
      }
      setDates(data.dates);
      setSlots(data.availability.slots);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Network problem. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const selectedDate = dates.find((d) => d.date === date);
  const selectedSlot = slots.find((s) => s.index === slotIndex);

  const grouped = useMemo(() => {
    const g = new Map<string, SlotDto[]>();
    for (const s of slots) g.set(s.sessionLabel, [...(g.get(s.sessionLabel) ?? []), s]);
    return [...g.entries()];
  }, [slots]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || slotIndex === undefined || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          slotIndex,
          patientName: form.name,
          patientPhone: form.phone,
          patientAge: form.age ? Number(form.age) : null,
          patientGender: form.gender || null,
          reason: form.reason || null,
          website: form.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        if (["slot_taken", "day_full", "slot_passed"].includes(data.reason)) {
          setSlotIndex(undefined);
          setStep(1);
          await load(date);
        }
        return;
      }
      setBooked({ appt: data.appointment, ahead: data.queueAhead ?? 0, note: data.note });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network problem. Your token was not booked — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) return <Success booked={booked} onAgain={() => { setBooked(null); setStep(0); setDate(undefined); setSlotIndex(undefined); void load(); }} />;

  return (
    <div>
      {/* Progress */}
      <ol className="grid grid-cols-3 border-y border-ink/15">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={cn("relative w-full py-4 text-left", i > step && "cursor-default")}
            >
              <span className={cn("label-mono", i === step ? "text-ink" : "text-ink-mute")}>
                {String(i + 1).padStart(2, "0")} · {s}
              </span>
              <span className="mt-1 block truncate text-sm text-ink-soft">
                {i === 0 && selectedDate && step > 0 ? selectedDate.label : null}
                {i === 1 && selectedSlot && step > 1 ? `${selectedSlot.startLabel} · Token ${selectedSlot.token}` : null}
              </span>
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink/0">
                {i <= step && <motion.span layoutId={i === step ? "step-bar" : undefined} className={cn("block h-full", i === step ? "bg-crimson" : "bg-ink")} />}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mt-6 border-l-2 border-crimson bg-blush/50 px-4 py-3 text-sm text-crimson-dark">
          {error}
        </p>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="day" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease }} className="pt-10">
            <h2 className="text-3xl">Which day suits you?</h2>
            <p className="mt-2 text-ink-mute">Open every day. Book up to two weeks ahead.</p>
            {loading && !dates.length ? (
              <Loading />
            ) : (
              <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                {dates.map((d) => {
                  const full = d.free === 0;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      disabled={full}
                      onClick={() => {
                        setDate(d.date);
                        setSlotIndex(undefined);
                        setError(null);
                        setStep(1);
                      }}
                      className={cn(
                        "group relative flex flex-col items-start border p-3 text-left transition",
                        date === d.date ? "border-ink bg-ink text-porcelain" : "border-ink/15 hover:border-ink",
                        full && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="label-mono opacity-70">{d.relative === "Today" || d.relative === "Tomorrow" ? d.relative : d.weekday}</span>
                      <span className="mt-1 font-display text-4xl leading-none">{d.dayNumber}</span>
                      <span className="text-xs opacity-70">{d.month}</span>
                      <span className={cn("mt-3 text-xs", date === d.date ? "text-teal-200" : "text-teal-700")}>
                        {full ? "Full" : `${d.free} free`}
                      </span>
                      {d.note && <span className="absolute top-2 right-2 size-1.5 rounded-full bg-crimson" title={d.note} />}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="time" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease }} className="pt-10">
            <button type="button" onClick={() => setStep(0)} className="mb-6 inline-flex items-center gap-2 label-mono text-ink-mute hover:text-ink">
              <ArrowLeft className="size-3.5" /> Change day
            </button>
            <h2 className="text-3xl">{selectedDate?.label ?? "Choose a time"}</h2>
            <p className="mt-2 text-ink-mute">Each token is a 15-minute slot. The token number is your place in the day.</p>
            {selectedDate?.note && <p className="mt-4 text-sm text-crimson">{selectedDate.note}</p>}
            {loading ? (
              <Loading />
            ) : (
              <div className="mt-8 space-y-8">
                {grouped.map(([session, list]) => (
                  <div key={session}>
                    <p className="label-mono border-b border-ink/10 pb-2 text-ink-mute">
                      {session} · {list.filter((s) => s.available).length} open
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {list.map((s) => (
                        <button
                          key={s.index}
                          type="button"
                          disabled={!s.available}
                          onClick={() => {
                            setSlotIndex(s.index);
                            setError(null);
                            setStep(2);
                          }}
                          className={cn(
                            "border px-2 py-3 text-left transition",
                            slotIndex === s.index ? "border-crimson bg-crimson text-white" : "border-ink/15 hover:border-ink",
                            !s.available && "cursor-not-allowed border-dashed opacity-35",
                          )}
                        >
                          <span className="block text-[0.95rem] font-medium">{s.startLabel}</span>
                          <span className="label-mono opacity-70">{s.available ? `Token ${s.token}` : s.unavailableBecause === "taken" ? "Booked" : "Passed"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.form key="details" onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease }} className="pt-10">
            <button type="button" onClick={() => setStep(1)} className="mb-6 inline-flex items-center gap-2 label-mono text-ink-mute hover:text-ink">
              <ArrowLeft className="size-3.5" /> Change time
            </button>
            <h2 className="text-3xl">
              Token {selectedSlot?.token} · {selectedSlot?.startLabel}
            </h2>
            <p className="mt-2 text-ink-mute">{selectedDate?.label}. Your confirmation will arrive on WhatsApp at this number.</p>

            <div className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <Field label="Patient’s full name" className="sm:col-span-2">
                <input required minLength={2} maxLength={80} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              </Field>
              <Field label="Mobile number (WhatsApp)">
                <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="98xxx xxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Age">
                  <input type="number" min={0} max={120} inputMode="numeric" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={input} />
                </Field>
                <Field label="Gender">
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={input}>
                    <option value="">—</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
              <Field label="What would you like to see the dentist about? (optional)" className="sm:col-span-2">
                <textarea rows={3} maxLength={400} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. aligner consultation, tooth pain, check-up" className={cn(input, "resize-none")} />
              </Field>
              <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>

            <button type="submit" disabled={submitting} className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-full bg-crimson py-4 font-medium text-white transition hover:bg-crimson-dark disabled:opacity-60 sm:w-auto sm:px-10">
              {submitting ? <Loader2 className="size-5 animate-spin" /> : null}
              {submitting ? "Booking…" : "Confirm token"}
            </button>
            <p className="mt-4 text-xs text-ink-mute">Your details are used only to manage this appointment.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const input = "mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-lg outline-none transition focus:border-crimson";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label-mono text-ink-mute">{label}</span>
      {children}
    </label>
  );
}

function Loading() {
  return (
    <div className="mt-10 flex items-center gap-3 text-ink-mute">
      <Loader2 className="size-5 animate-spin" /> Checking live availability…
    </div>
  );
}

function Success({ booked, onAgain }: { booked: { appt: Booked; ahead: number; note: string | null }; onAgain: () => void }) {
  const { appt, ahead, note } = booked;
  const d = new Date(`${appt.date}T00:00:00Z`);
  const dateLabel = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const message = `Align Aesthetic Dental Hub — Token #${appt.tokenNumber}\nDate: ${dateLabel}\nTime: ${to12h(appt.slotStart)}\nPatient: ${appt.patientName}\nCode: ${appt.reference}`;

  return (
    <div className="grid gap-14 pt-6 lg:grid-cols-12 lg:items-center">
      <motion.div
        className="lg:col-span-5"
        initial={{ clipPath: "inset(0 0 100% 0)", y: -30 }}
        animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
        transition={{ duration: 1.1, ease }}
      >
        <TokenSlip token={appt.tokenNumber} date={dateLabel} time={to12h(appt.slotStart)} code={appt.reference} name={appt.patientName} />
      </motion.div>
      <motion.div className="lg:col-span-6 lg:col-start-7" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6, ease }}>
        <p className="label-mono text-teal-700">Token confirmed</p>
        <h2 className="mt-4 text-[clamp(2.2rem,4.5vw,3.6rem)] leading-none">See you at {to12h(appt.slotStart)}.</h2>
        <p className="mt-5 text-ink-soft">
          The confirmation is on its way to your WhatsApp, and Dr. Nikita has been told you’re coming.{" "}
          {ahead > 0 ? `${ahead} patient${ahead > 1 ? "s are" : " is"} booked before you that day.` : "You’re the first booking of the day so far."}{" "}
          Please arrive 10 minutes early.
        </p>
        {note && <p className="mt-4 text-sm text-crimson">{note}</p>}
        <p className="mt-6 border-t border-ink/10 pt-5 text-sm text-ink-mute">
          Keep your booking code <span className="font-mono text-ink">{appt.reference}</span> — you’ll need it with your mobile number to check or cancel under{" "}
          <Link href="/my-token" className="underline">My token</Link>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-porcelain">
            Save to WhatsApp <ArrowUpRight className="size-4" />
          </a>
          <a href={whatsappHref(`Hi, I've booked token #${appt.tokenNumber} (${appt.reference}).`)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium">
            Message the clinic
          </a>
          <button onClick={onAgain} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium">
            Book for someone else
          </button>
        </div>
        <p className="mt-6 text-xs text-ink-mute">Questions? Call {clinic.phoneDisplay}.</p>
      </motion.div>
    </div>
  );
}
