import { Assistant } from "@/components/chat/assistant";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBar } from "@/components/layout/mobile-bar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <Assistant />
    </>
  );
}
