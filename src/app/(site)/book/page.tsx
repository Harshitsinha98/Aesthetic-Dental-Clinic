import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book a token",
  description: "Book a 15-minute appointment token with Dr. Nikita Soni at Align Aesthetic Dental Hub, Bhopal. Your token number is confirmed instantly.",
  alternates: { canonical: "/book" },
  robots: { index: true, follow: true },
};

export default function BookPage() {
  return (
    <section className="container-page pt-14 pb-28 lg:pt-20">
      <p className="label-mono text-ink-mute">Online token · Align Aesthetic Dental Hub</p>
      <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,6vw,5rem)] leading-[0.98]">
        Book a token <em className="text-teal-700 italic">in under a minute.</em>
      </h1>
      <div className="mt-12">
        <BookingWizard />
      </div>
    </section>
  );
}
