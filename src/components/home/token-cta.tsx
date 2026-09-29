import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { LogoMark } from "@/components/brand/logo";
import { BOOKING_WINDOW_DAYS, SLOT_MINUTES } from "@/lib/schedule";

/** The booking invitation, drawn as the token slip patients receive. */
export function TokenCta() {
  return (
    <section className="py-24 lg:py-36" aria-labelledby="token-title">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <p className="label-mono flex items-center gap-3 text-ink-mute">
            <span className="text-ink">07</span>
            <span className="h-px w-10 bg-ink/25" />
            Online token
          </p>
          <h2 id="token-title" className="mt-5 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">
            Your number, your time. <em className="text-teal-700 italic">No waiting room guesswork.</em>
          </h2>
          <ol className="mt-10 space-y-5">
            {[
              ["Pick a day", `Any day in the next ${BOOKING_WINDOW_DAYS}. The clinic is open all seven.`],
              ["Pick a time", `Each token is a ${SLOT_MINUTES}-minute slot. Token number = your place in the day.`],
              ["Keep your token", "Save it as an image, add it to your calendar or share it. The front desk sees it instantly."],
            ].map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-ink/10 pt-5">
                <span className="label-mono pt-1 text-crimson">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="mt-1 text-sm text-ink-mute">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/book" className="group mt-10 inline-flex items-center gap-3 rounded-full bg-crimson py-3.5 pr-3.5 pl-6 font-medium text-white transition hover:bg-crimson-dark">
            Book a token
            <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 ease-out-soft group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:col-start-8">
          <TokenSlip token={7} date="Mon · 28 Sep" time="12:00 PM" code="AAD-SAMPLE" sample />
        </Reveal>
      </div>
    </section>
  );
}

export function TokenSlip({
  token,
  date,
  time,
  code,
  name,
  sample = false,
}: {
  token: number;
  date: string;
  time: string;
  code: string;
  name?: string;
  sample?: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm sm:-rotate-2 shadow-[0_30px_50px_-20px_rgb(15_26_27/0.35)]">
      <div className="bg-white px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
        <div className="flex items-center justify-between">
          <LogoMark className="size-9" />
          <span className="label-mono text-ink-mute">{sample ? "Sample token" : "Token slip"}</span>
        </div>
        <p className="mt-8 label-mono text-ink-mute">Token no.</p>
        <p className="font-display text-[clamp(5rem,24vw,7rem)] leading-[0.85] text-teal-800">{String(token).padStart(2, "0")}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="label-mono text-ink-mute">Date</dt>
            <dd className="mt-1 font-medium">{date}</dd>
          </div>
          <div>
            <dt className="label-mono text-ink-mute">Report by</dt>
            <dd className="mt-1 font-medium">{time}</dd>
          </div>
          {name && (
            <div className="col-span-2">
              <dt className="label-mono text-ink-mute">Patient</dt>
              <dd className="mt-1 font-medium">{name}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="perforated bg-white" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-6 pt-3 pb-6 sm:px-8">
        <span className="font-mono text-sm tracking-widest">{code}</span>
        <span className="flex items-center gap-1.5 text-xs text-ink-mute">
          <span className="size-2 rounded-full bg-teal-500" /> Show at the front desk
        </span>
      </div>
    </div>
  );
}
