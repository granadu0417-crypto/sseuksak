import { getAllPosts } from '@/lib/posts';

const SITE_URL = 'https://sseuksak.com';

// 빌드 시 정적 생성
export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPosts();

  const rssItems = posts
    .slice(0, 50) // 최신 50개 포스트만
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/posts/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${post.category}</category>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>쓱싹 - 유용한 정보 블로그</title>
    <link>${SITE_URL}</link>
    <description>금융, 건강, IT 등 다양한 주제의 유용한 정보를 쉽게 알려드립니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
