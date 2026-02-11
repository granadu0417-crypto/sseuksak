import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // 잘못된 URL 리다이렉트 (네이버 크롤러 수집 오류 수정)
  async redirects() {
    return [
      // 페이지네이션 1페이지 → /posts 정규화 (소프트 404 해결)
      {
        source: '/posts/page/1',
        destination: '/posts',
        permanent: true,
      },
      // 테스트 URL: -test 접미사 제거
      {
        source: '/tests/sns-fatigue-test',
        destination: '/tests/sns-fatigue',
        permanent: true,
      },
      {
        source: '/tests/caffeine-dependency-test',
        destination: '/tests/caffeine-dependency',
        permanent: true,
      },
      {
        source: '/tests/sleep-type-test',
        destination: '/tests/sleep-type',
        permanent: true,
      },
    ];
  },
  // 프로덕션 빌드 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // 실험적 최적화
  experimental: {
    // CSS 최적화
    optimizeCss: true,
  },
};

export default nextConfig;
