import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  images: {
    // รองรับ CDN domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.subth.com",
      },
    ],
    // ใช้ AVIF ก่อน (compression ดีกว่า WebP 20-30%)
    // fallback เป็น WebP สำหรับ browser เก่า
    formats: ["image/avif", "image/webp"],
    // Cache optimized images นานขึ้น (1 week)
    minimumCacheTTL: 604800,
    // Device sizes สำหรับ responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes สำหรับ layout="fill" หรือ sizes prop
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default withBundleAnalyzer(nextConfig);
