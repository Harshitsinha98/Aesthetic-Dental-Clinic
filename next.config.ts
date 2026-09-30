import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native addon for local/VPS SQLite; serverless uses @libsql/client instead.
  serverExternalPackages: ["better-sqlite3"],

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1280, 1600],
    // Google review author photos.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },

  async redirects() {
    return [
      { source: "/treatments/crowns-bridges", destination: "/treatments/crowns-veneers", permanent: true },
      { source: "/treatments/general-dentistry", destination: "/treatments/check-up", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] },
    ];
  },
};

export default nextConfig;
