import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
