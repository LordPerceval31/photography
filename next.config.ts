import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["unrelinquishable-uncamouflaged-maryjane.ngrok-free.dev"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // Requis pour les requêtes PostHog avec slash final
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // images de production
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // placeholders v1 uniquement
      },
    ],
  },
};

export default nextConfig;
