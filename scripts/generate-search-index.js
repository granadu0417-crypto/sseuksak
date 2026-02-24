/**
 * 빌드 시점에 검색 인덱스를 생성하는 스크립트
 * Cloudflare Workers에서 런타임 fs 접근이 불가하므로 정적 JSON 생성
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'content/posts');
const outputPath = path.join(process.cwd(), 'public/search-index.json');

function generateSearchIndex() {
  console.log('🔍 검색 인덱스 생성 중...');

  const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      if (data.draft === true) return null;

      // 읽기 시간 계산
      const wordCount = fileContents.split(/\s+/).length;
      const readingTime = `${Math.ceil(wordCount / 200)} min read`;

      return {
        slug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        category: data.category || '',
        tags: data.tags || [],
        readingTime,
      };
    })
    .filter((post) => post !== null);

  // 날짜순 정렬 (최신순)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`✅ 검색 인덱스 생성 완료: ${posts.length}개 게시글`);
  console.log(`📁 저장 위치: ${outputPath}`);
}

generateSearchIndex();
