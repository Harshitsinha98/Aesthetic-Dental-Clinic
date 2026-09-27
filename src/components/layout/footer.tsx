import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { clinic, doctor, mapsHref, navLinks, telHref, whatsappHref } from "@/lib/clinic";
import { weeklyHours } from "@/lib/schedule";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-teal-950 pb-28 text-teal-100 lg:pb-10">
      <div className="container-page pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="label-mono text-teal-300">Align Aesthetic Dental Hub</p>
            <p className="mt-5 max-w-sm font-display text-3xl leading-tight text-porcelain">
              {clinic.tagline}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-teal-200/80">
              {doctor.name} · {doctor.qualifications}
              <br />
              {doctor.registration}
            </p>
          </div>

          <div>
            <p className="label-mono text-teal-300">Visit</p>
            <address className="mt-5 text-sm leading-relaxed not-italic text-teal-100/90">
              {clinic.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a href={mapsHref()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-porcelain underline decoration-teal-500 underline-offset-4 hover:decoration-crimson">
              Get directions
            </a>
          </div>

          <div>
            <p className="label-mono text-teal-300">Hours</p>
            <dl className="mt-5 space-y-1.5 text-sm">
              {weeklyHours.map((h) => (
                <div key={h.day} className="flex justify-between gap-4">
                  <dt className="text-teal-200/80">{h.short}</dt>
                  <dd className="text-teal-50">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="label-mono text-teal-300">Pages</p>
            <ul className="mt-5 space-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-teal-100/90 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/book" className="text-teal-100/90 transition hover:text-white">Book a token</Link>
              </li>
              <li>
                <Link href="/my-token" className="text-teal-100/90 transition hover:text-white">My token</Link>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <a href={telHref()} className="text-porcelain">{clinic.phoneDisplay}</a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-porcelain">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the footer edge. */}
      <div aria-hidden className="pointer-events-none mt-16 select-none">
        <div className="container-page flex items-end gap-6">
          <LogoMark tone="light" className="mb-[2vw] hidden w-[9vw] max-w-32 opacity-90 sm:block" />
          <p className="font-sans text-[22vw] leading-[0.78] font-bold tracking-[0.06em] text-teal-900 lg:text-[16rem]">
            ALiGN
          </p>
        </div>
      </div>

      <div className="container-page mt-8 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs text-teal-200/60">
        <span>© {new Date().getFullYear()} {clinic.name}, Bhopal</span>
        <span>Information on this site is general and not a substitute for an in-person dental examination.</span>
      </div>
    </footer>
  );
}
