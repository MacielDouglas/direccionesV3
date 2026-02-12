import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://10.0.2.2:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.tiles.mapbox.com",
      },
      {
        protocol: "https",
        hostname: "api.mapbox.com",
      },
    ],
  },
};
export default nextConfig;
