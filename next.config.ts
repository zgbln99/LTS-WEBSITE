import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Bewerbungs- und Upload-Formulare senden Dateien über Server Actions.
  // Standardlimit ist 1 MB - hier angehoben (mehrere Dokumente à bis 10 MB).
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb"
    }
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Bilder im Seiten-Editor können beliebige Quellen haben (Uploads sind
    // gleicher Origin). Externe Hosts werden zur Optimierung freigegeben.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
