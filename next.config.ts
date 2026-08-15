import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev https://api.mapbox.com https://events.mapbox.com https://upload.wikimedia.org https://lh3.googleusercontent.com",
              "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev https://*.r2.cloudflarestorage.com",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline'",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui", "@radix-ui/react-slot"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "events.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // ← SW só em produção
  workboxOptions: {
    runtimeCaching: [
      {
        // ✅ Imagens do R2 — cache local 30 dias, sem re-download
        urlPattern: /^https:\/\/pub-20ea17ad5d694dbc94202efa1ea340ff\.r2\.dev\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "r2-images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
          },
        },
      },
      {
        // ✅ Tiles do Mapbox — cache local, crítico para mobile offline
        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "mapbox-tiles",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
          },
        },
      },
      {
        // ✅ API interna — sempre tenta rede, fallback cache se offline
        // (exclui /api/auth/* sessão e /api/upload-url URLs pré-assinadas)
        urlPattern: /^https?:\/\/.*\/api\/(?!auth\/|upload-url).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hora
          },
        },
      },
    ],
  },
})(nextConfig);
