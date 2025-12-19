import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers 호환 설정
  output: "standalone",
};

export default nextConfig;
