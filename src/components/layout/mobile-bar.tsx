"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircleQuestion, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/clinic";

/** Thumb-reach actions on phones. Hidden on the booking flow and admin. */
export function MobileBar() {
  const pathname = usePathname();
  // On the home page the hero already has Book / Call buttons, so the bar
  // slides in only once they have scrolled out of view.
  const [show, setShow] = useState(pathname !== "/");
  useEffect(() => {
    if (pathname !== "/") return setShow(true);
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (pathname.startsWith("/admin") || pathname.startsWith("/book")) return null;

  return (
    <div aria-hidden={!show}
      className={`fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex transition-[transform,opacity] duration-500 ease-out-soft ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0"} gap-2 rounded-full bg-ink/95 p-1.5 shadow-[0_18px_40px_-12px_rgb(15_26_27/0.5)] backdrop-blur lg:hidden`}>
      <a href={telHref()} aria-label="Call the clinic" className="grid size-12 place-items-center rounded-full text-porcelain">
        <Phone className="size-5" />
      </a>
      <a
        href={whatsappHref("Hello, I would like to know more about a dental appointment.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp the clinic"
        className="grid size-12 place-items-center rounded-full text-porcelain"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("align:assistant"))}
        aria-label="Ask the Align Assistant"
        className="grid size-12 place-items-center rounded-full text-porcelain"
      >
        <MessageCircleQuestion className="size-5" />
      </button>
      <Link
        href="/book"
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-crimson text-[0.95rem] font-medium text-white"
      >
        Book a token
      </Link>
    </div>
  );
}
