import { Reveal } from "@/components/ui/reveal";
import { TodayRow } from "@/components/home/today-row";
import { clinic, mapsEmbedSrc, mapsHref, telHref, whatsappHref } from "@/lib/clinic";
import { specialDateNotes, weeklyHours } from "@/lib/schedule";

export function Visit({ index = "07" }: { index?: string }) {
  const notes = Object.entries(specialDateNotes);
  return (
    <section className="border-t border-ink/10 py-24 lg:py-32" aria-labelledby="visit-title">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="label-mono flex items-center gap-3 text-ink-mute">
            <span className="text-ink">{index}</span>
            <span className="h-px w-10 bg-ink/25" />
            Visit
          </p>
          <h2 id="visit-title" className="mt-5 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]">JK Road, Bhopal.</h2>
          <address className="mt-8 text-lg leading-relaxed not-italic">
            {clinic.addressLines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </address>
          <p className="mt-2 text-sm text-ink-mute">{clinic.landmark}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={mapsHref()} target="_blank" rel="noopener noreferrer" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-porcelain transition hover:bg-teal-900">Directions</a>
            <a href={telHref()} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition hover:border-ink">Call {clinic.phoneDisplay}</a>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition hover:border-ink">WhatsApp</a>
          </div>

          <table className="mt-12 w-full text-[0.95rem]">
            <caption className="mb-3 text-left label-mono text-ink-mute">Hours · open every day</caption>
            <tbody>
              {weeklyHours.map((h) => (
                <TodayRow key={h.day} dow={h.dow} day={h.day} hours={h.hours} />
              ))}
            </tbody>
          </table>
          {notes.map(([date, note]) => (
            <p key={date} className="mt-4 text-sm text-crimson">{note}</p>
          ))}
        </Reveal>

        <Reveal className="lg:col-span-6 lg:col-start-7" scale>
          <div className="relative h-full min-h-[26rem] overflow-hidden border border-ink/10 bg-paper">
            <iframe
              title={`Map to ${clinic.name}`}
              src={mapsEmbedSrc()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full grayscale-[0.4]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
