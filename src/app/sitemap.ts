import type { MetadataRoute } from "next";
import { clinic } from "@/lib/clinic";
import { treatments } from "@/lib/treatments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clinic.siteUrl;
  const pages = ["", "/treatments", "/technology", "/about", "/gallery", "/reviews", "/contact", "/book"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...treatments.map((t) => ({ url: `${base}/treatments/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
