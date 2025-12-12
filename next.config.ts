import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 비활성화 (Cloudflare에서 지원 안함)
  images: {
    unoptimized: true,
  },
  // Turbopack 빈 설정 (Next.js 16 기본값)
  turbopack: {},
};

export default nextConfig;
