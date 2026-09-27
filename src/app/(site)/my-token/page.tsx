import type { Metadata } from "next";
import { MyToken } from "@/components/booking/my-token";

export const metadata: Metadata = {
  title: "My token — check or cancel",
  robots: { index: false, follow: false },
};

export default function MyTokenPage() {
  return (
    <section className="container-page max-w-3xl pt-14 pb-28 lg:pt-20">
      <p className="label-mono text-ink-mute">My token</p>
      <h1 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] leading-none">Your tokens.</h1>
      <p className="mt-5 text-ink-soft">Tokens booked on this phone are saved here automatically. You can also find one with its booking code.</p>
      <div className="mt-10">
        <MyToken />
      </div>
    </section>
  );
}
