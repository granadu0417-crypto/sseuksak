import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 로컬 개발 시 Cloudflare 바인딩 (D1, KV 등) 접근 활성화
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Cloudflare Workers 호환 설정
  output: "standalone",
};

export default nextConfig;
