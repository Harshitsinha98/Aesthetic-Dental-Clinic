"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { OpenStatus } from "@/components/layout/open-status";
import { clinic, navLinks, telHref } from "@/lib/clinic";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="bg-teal-950 text-teal-100">
        <div className="container-page flex h-8 items-center justify-between gap-4 whitespace-nowrap label-mono">
          <OpenStatus />
          <span className="hidden sm:inline">
            Sun–Sat · 10–2 &amp; 5–9 · Wed 10–9
          </span>
          <a href={telHref()} className="hidden transition hover:text-white sm:inline">
            {clinic.phoneDisplay}
          </a>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled || open ? "bg-porcelain/90 shadow-[0_1px_0_rgb(15_26_27/0.08)] backdrop-blur-md" : "bg-porcelain",
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" aria-label="Align Aesthetic Dental Hub — home" className="relative z-10">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative py-2 text-[0.9rem] text-ink-soft transition hover:text-ink",
                    active && "text-ink",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-500 ease-out-soft",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/my-token"
              className="hidden px-3 py-2 text-[0.9rem] text-ink-soft transition hover:text-ink md:block"
            >
              My token
            </Link>
            <Link
              href="/book"
              className="group hidden items-center gap-2 rounded-full bg-ink py-2.5 pr-3 pl-5 text-[0.9rem] font-medium text-porcelain transition hover:bg-teal-900 sm:inline-flex"
            >
              Book a token
              <span className="grid size-6 place-items-center rounded-full bg-crimson transition-transform duration-500 ease-out-soft group-hover:rotate-45">
                <ArrowUpRight className="size-3.5" strokeWidth={2.2} />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-10 grid size-11 place-items-center rounded-full border border-ink/15 lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            id="mobile-menu"
            className="fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-porcelain pt-28 pb-[calc(2.5rem+env(safe-area-inset-bottom))] lg:hidden"
          >
            <nav aria-label="Mobile" className="container-page flex flex-col">
              {[...navLinks, { href: "/my-token", label: "My token" }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-ink/10 py-4 active:bg-paper"
                  >
                    <span className="label-mono w-6 text-ink-mute">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[2rem] leading-tight">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="mt-8 flex items-center justify-between rounded-full bg-crimson px-6 py-4 text-lg font-medium text-white"
              >
                Book a token <ArrowUpRight className="size-5" />
              </Link>
              <a href={telHref()} className="mt-3 flex items-center justify-center rounded-full border border-ink/15 px-6 py-4 font-medium">
                Call {clinic.phoneDisplay}
              </a>
              <p className="mt-6 text-center label-mono text-ink-mute"><OpenStatus /></p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
