import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  compress: true,
  poweredByHeader: false,

  async headers() {
    // CSP dinâmica com nonce é aplicada em proxy.ts (por request).
    // Aqui ficam apenas headers estáticos de hardening.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
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
  fallbacks: {
    // App Router: precache de app/~offline/page.tsx como fallback de documento
    document: "/~offline",
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        // _next/static — StaleWhileRevalidate para navegação instantânea
        urlPattern: /\/_next\/static\/.*/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "next-static" },
      },
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
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // ✅ Tiles/styles/fonts/glyphs do Mapbox — crítico para mobile offline
        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "mapbox-tiles",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // ✅ API interna — tenta rede (3s), fallback cache se offline
        // (exclui /api/auth/* sessão e /api/upload-url URLs pré-assinadas)
        urlPattern: /^https?:\/\/.*\/api\/(?!auth\/|upload-url).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hora
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Telemetria Mapbox — nunca bloqueia navegação offline
        urlPattern: /^https:\/\/events\.mapbox\.com\/.*/i,
        handler: "NetworkOnly",
      },
    ],
  },
})(nextConfig);
