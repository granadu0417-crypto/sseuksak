#!/usr/bin/env node

/**
 * IndexNow CLI Script for sseuksak.com
 *
 * 배포 후 자동으로 실행되어 모든 URL을 IndexNow 프로토콜을 통해
 * 네이버, Bing, Yandex 등 참여 검색엔진에 알립니다.
 *
 * 사용법:
 *   npm run indexnow          # 모든 URL 제출
 *   npm run indexnow -- --dry # 제출할 URL 목록만 출력 (실제 제출 안함)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// 설정
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  key: '5af74eb714634f58aabfd6cc6a424e17',
  siteUrl: 'https://sseuksak.com',
  host: 'sseuksak.com',
  // 네이버 SearchAdvisor IndexNow 엔드포인트
  endpoint: 'https://searchadvisor.naver.com/indexnow',
};

// sitemap.ts와 동기화된 도구/테스트 목록
const TOOLS_LIST = [
  'salary-calculator',
  'tax-refund-calculator',
  'fire-calculator',
  'sleep-calculator',
  'alcohol-calculator',
  'life-in-weeks',
  'true-hourly-wage',
  'subscription-audit',
];

const TESTS_LIST = [
  'mental-age',
  'spending-type',
  'burnout-risk',
  'investment-style',
  'love-style',
  'office-animal',
  'fortune-2026',
  'sleep-type',
  'caffeine-dependency',
  'sns-fatigue',
];

// ═══════════════════════════════════════════════════════════════════
// URL 수집 함수
// ═══════════════════════════════════════════════════════════════════

function getAllUrls() {
  const urls = [];

  // 1. 정적 페이지
  const staticPages = [
    '',           // 홈
    '/about',
    '/contact',
    '/calendar',
    '/tools',
    '/tests',
    '/posts',
  ];
  staticPages.forEach(page => urls.push(CONFIG.siteUrl + page));

  // 2. 게시글 (content/posts/*.md)
  const postsDir = path.join(process.cwd(), 'content/posts');
  if (fs.existsSync(postsDir)) {
    const posts = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => `/posts/${f.replace('.md', '')}`);
    posts.forEach(post => urls.push(CONFIG.siteUrl + post));
  }

  // 3. 카테고리 페이지
  const categories = getCategoriesFromPosts();
  categories.forEach(cat => urls.push(`${CONFIG.siteUrl}/category/${cat}`));

  // 4. 도구 페이지
  TOOLS_LIST.forEach(tool => urls.push(`${CONFIG.siteUrl}/tools/${tool}`));

  // 5. 테스트 페이지
  TESTS_LIST.forEach(test => urls.push(`${CONFIG.siteUrl}/tests/${test}`));

  return urls;
}

function getCategoriesFromPosts() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const categories = new Set();

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    files.forEach(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const match = content.match(/category:\s*["']?([^"'\n]+)["']?/);
      if (match) {
        categories.add(match[1].trim());
      }
    });
  }

  return Array.from(categories);
}

// ═══════════════════════════════════════════════════════════════════
// IndexNow API 호출
// ═══════════════════════════════════════════════════════════════════

async function submitToIndexNow(urls) {
  const payload = JSON.stringify({
    host: CONFIG.host,
    key: CONFIG.key,
    keyLocation: `${CONFIG.siteUrl}/${CONFIG.key}.txt`,
    urlList: urls,
  });

  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.endpoint);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: data,
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════
// 메인 실행
// ═══════════════════════════════════════════════════════════════════

async function main() {
  const isDryRun = process.argv.includes('--dry');

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              IndexNow - sseuksak.com                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  // URL 수집
  const urls = getAllUrls();

  console.log(`📊 총 ${urls.length}개 URL 수집 완료`);
  console.log('');

  if (isDryRun) {
    console.log('🔍 [DRY RUN] 제출할 URL 목록:');
    console.log('─'.repeat(60));
    urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
    console.log('─'.repeat(60));
    console.log('');
    console.log('💡 실제 제출하려면: npm run indexnow');
    return;
  }

  // IndexNow API 호출
  console.log('🚀 네이버 IndexNow API에 제출 중...');
  console.log(`   엔드포인트: ${CONFIG.endpoint}`);
  console.log('');

  try {
    const result = await submitToIndexNow(urls);

    console.log('─'.repeat(60));
    console.log(`   HTTP 상태: ${result.statusCode} ${result.statusMessage}`);

    // 응답 코드별 메시지
    const statusMessages = {
      200: '✅ 성공! URL이 검색엔진에 전달되었습니다.',
      202: '✅ 수신됨! Key 검증 후 처리됩니다.',
      400: '❌ 잘못된 요청 형식입니다.',
      403: '❌ API Key가 유효하지 않습니다.',
      422: '❌ URL이 Key와 일치하지 않습니다.',
      429: '⚠️ 요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
      500: '❌ 서버 오류가 발생했습니다.',
    };

    console.log(`   결과: ${statusMessages[result.statusCode] || '알 수 없는 응답'}`);
    console.log('─'.repeat(60));

    if (result.statusCode === 200 || result.statusCode === 202) {
      console.log('');
      console.log('📢 IndexNow를 통해 다음 검색엔진에 알림이 전송됩니다:');
      console.log('   • 네이버 (Naver)');
      console.log('   • Microsoft Bing');
      console.log('   • Yandex');
      console.log('   • Seznam.cz');
      console.log('   • Yep');
      console.log('');
      console.log('💡 네이버 서치어드바이저에서 요청 기록을 확인할 수 있습니다:');
      console.log('   https://searchadvisor.naver.com/console/site/index');
    }

  } catch (error) {
    console.error('❌ API 호출 중 오류 발생:', error.message);
    process.exit(1);
  }

  console.log('');
}

main().catch(console.error);
