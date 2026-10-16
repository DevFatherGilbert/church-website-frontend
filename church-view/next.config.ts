import type { NextConfig } from "next";

const customCloudinaryHost = process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_HOST?.trim() || "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary shared CDN
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Cloudinary private CDN pattern (*-res.cloudinary.com)
      { protocol: "https", hostname: "**.cloudinary.com" },
      // Unsplash (used in demo/fallback images)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Optional custom Cloudinary delivery hostname
      ...(customCloudinaryHost
        ? [{ protocol: "https" as const, hostname: customCloudinaryHost }]
        : []),
    ],
  },
};

export default nextConfig;

