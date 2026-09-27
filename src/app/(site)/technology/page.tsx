import type { Metadata } from "next";
import { TechnologyBrowser } from "@/components/technology/technology-browser";
import { PageIntro } from "@/components/ui/section-head";

export const metadata: Metadata = {
  title: "Technology & instruments",
  description: "The equipment inside Align Aesthetic Dental Hub — intraoral camera, portable dental X-ray, soft-tissue laser, endodontic motor, apex locator and more — and what each means for you.",
  alternates: { canonical: "/technology" },
};

export default function TechnologyPage() {
  return (
    <>
      <PageIntro
        label="The instrument tray"
        title={<>What is in the room, <em className="text-teal-700 italic">and why it is there.</em></>}
        lede="Every device on this page was photographed inside the clinic. For each one: what it is, what it does, and what it changes for you in the chair."
      />
      <TechnologyBrowser />
    </>
  );
}
