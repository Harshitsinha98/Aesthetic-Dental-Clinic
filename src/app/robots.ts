import type { MetadataRoute } from "next";
import { clinic } from "@/lib/clinic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/my-token"] }],
    sitemap: `${clinic.siteUrl}/sitemap.xml`,
  };
}
