import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Cloudflare가 기본 User-Agent: * 규칙을 관리하므로
  // 여기서는 추가 규칙만 정의
  return {
    rules: [
      {
        userAgent: 'Yeti',  // 네이버 크롤러
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://sseuksak.com/sitemap.xml',
  };
}
