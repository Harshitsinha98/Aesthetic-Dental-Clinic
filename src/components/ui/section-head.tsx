import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

/**
 * Editorial section header: a figure-style index on the left rule, the
 * title set large in the display face, optional lede on the right.
 */
export function SectionHead({
  index,
  label,
  title,
  lede,
  tone = "light",
  className,
}: {
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Reveal className={cn("grid gap-6 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-7">
        <p className={cn("label-mono flex items-center gap-3", dark ? "text-teal-300" : "text-ink-mute")}>
          <span className={dark ? "text-porcelain" : "text-ink"}>{index}</span>
          <span className={cn("h-px w-10", dark ? "bg-teal-300/50" : "bg-ink/25")} />
          {label}
        </p>
        <h2 className={cn("mt-5 text-[clamp(2.2rem,4.6vw,4rem)] leading-[1]", dark && "text-porcelain")}>{title}</h2>
      </div>
      {lede && (
        <p className={cn("text-[1.02rem] leading-relaxed lg:col-span-4 lg:col-start-9", dark ? "text-teal-100/80" : "text-ink-soft")}>
          {lede}
        </p>
      )}
    </Reveal>
  );
}

export function PageIntro({ label, title, lede }: { label: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <section className="border-b border-ink/10">
      <div className="container-page pt-16 pb-14 lg:pt-24 lg:pb-20">
        <Reveal>
          <p className="label-mono text-ink-mute">{label}</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(2.6rem,6.2vw,5.4rem)] leading-[0.98]">{title}</h1>
          {lede && <p className="mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">{lede}</p>}
        </Reveal>
      </div>
      <div className="ruler text-ink" aria-hidden />
    </section>
  );
}
