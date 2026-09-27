import type { Metadata } from "next";
import { GoogleReviews } from "@/components/reviews/google-reviews";
import { PageIntro } from "@/components/ui/section-head";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Patient reviews on Google",
  description: "Google reviews for Align Aesthetic Dental Hub, Bhopal — read them, or leave your own.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <>
      <PageIntro
        label="Reviews"
        title={<>In patients’ own words, <em className="text-teal-700 italic">straight from Google.</em></>}
        lede="These reviews are pulled live from our Google Business Profile. We don’t write, edit or pick them — and if you’ve visited, we’d be grateful for yours."
      />
      <section className="container-page py-14 lg:py-20">
        <GoogleReviews />
      </section>
    </>
  );
}
