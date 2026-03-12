import type { NextConfig } from "next";

// ✅ Adicionar ao next.config.ts
const nextConfig: NextConfig = {
  // Turbopack para dev mais rápido
  turbopack: {},

  // Compressão de output
  compress: true,

  // Evita expor informações do servidor
  poweredByHeader: false,

  experimental: {
    // Otimiza imports de libs grandes (lucide-react, radix, etc.)
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "@radix-ui/react-slot",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev", // ✅ adicionar
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "events.mapbox.com",
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
