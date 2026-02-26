import type { Metadata } from 'next';

const SITE_NAME = '쓱싹';
const SITE_URL = 'https://sseuksak.com';
const DEFAULT_DESCRIPTION = '다양한 주제의 유용한 정보를 제공하는 블로그';

export interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
  section,
  tags,
}: MetadataProps = {}): Metadata {
  // title은 layout.tsx template('%s | 쓱싹')이 자동 적용하므로 원본만 반환
  // OG/Twitter는 template 적용 안 되므로 직접 붙임
  const pageTitle = title || `${SITE_NAME} - 유용한 정보 블로그`;
  const socialTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 유용한 정보 블로그`;
  const fullUrl = `${SITE_URL}${url}`;

  return {
    title: pageTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    openGraph: {
      title: socialTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: [author],
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary',
      title: socialTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

// 저자 정보 상수 (E-E-A-T)
const AUTHOR_INFO = {
  name: '쓱싹 에디터',
  url: `${SITE_URL}/about`,
  email: 'granadu0417@gmail.com',
};

export function generateArticleJsonLd({
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: AUTHOR_INFO.name,
      url: AUTHOR_INFO.url,
      email: AUTHOR_INFO.email,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${url}`,
    },
    inLanguage: 'ko-KR',
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.svg`,
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  };
}

// JSON-LD for tools/calculators (WebApplication schema)
export function generateToolJsonLd({
  name,
  description,
  url,
  category = '계산기',
}: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${SITE_URL}${url}`,
    applicationCategory: category,
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'ko-KR',
  };
}

// JSON-LD for tests/quizzes
export function generateQuizJsonLd({
  name,
  description,
  url,
  questionCount = 12,
}: {
  name: string;
  description: string;
  url: string;
  questionCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name,
    description,
    url: `${SITE_URL}${url}`,
    educationalAlignment: {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      targetName: '심리테스트',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    numberOfQuestions: questionCount,
    inLanguage: 'ko-KR',
  };
}

// JSON-LD for calendar/events
export function generateEventCollectionJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: `${SITE_URL}${url}`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// JSON-LD for FAQ pages - Google 검색결과에 FAQ 드롭다운 표시
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQJsonLd(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// JSON-LD for HowTo guides - Google 검색결과에 단계별 가이드 표시
export interface HowToStep {
  name: string;
  text: string;
}

export function generateHowToJsonLd({
  name,
  description,
  url,
  steps,
}: {
  name: string;
  description: string;
  url: string;
  steps: HowToStep[];
}) {
  if (!steps || steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${url}`,
    },
    inLanguage: 'ko-KR',
  };
}

// 게시글 HTML에서 HowTo 단계 추출 (순서가 있는 H2/H3 + 숫자 패턴)
export function extractHowToSteps(htmlContent: string): HowToStep[] {
  const steps: HowToStep[] = [];

  // 패턴 1: "1. 제목", "2. 제목" 등의 H2/H3 제목 (numbered headings)
  const numberedHeadingPattern = /<h[23][^>]*>(?:\s*)?(\d+)[\.\)]\s*(.+?)<\/h[23]>/gi;
  let match;
  const headingMatches: { index: number; num: number; title: string }[] = [];

  while ((match = numberedHeadingPattern.exec(htmlContent)) !== null) {
    headingMatches.push({
      index: match.index,
      num: parseInt(match[1]),
      title: match[2].replace(/<[^>]+>/g, '').trim(),
    });
  }

  // 연속된 번호 매기기가 있는 경우에만 HowTo로 인정 (최소 3단계)
  if (headingMatches.length >= 3) {
    const isSequential = headingMatches.every((h, i) => i === 0 || h.num > headingMatches[i - 1].num);
    if (isSequential) {
      for (const h of headingMatches) {
        // 해당 제목 뒤의 첫 번째 <p> 태그 내용을 텍스트로 추출
        const afterHeading = htmlContent.slice(h.index);
        const pMatch = afterHeading.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        const text = pMatch
          ? pMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 300)
          : h.title;

        steps.push({ name: h.title, text });
      }
    }
  }

  // 패턴 2: "STEP 1", "Step 2" 등
  if (steps.length === 0) {
    const stepPattern = /<h[23][^>]*>(?:\s*)?(?:STEP|Step|step)\s*(\d+)[:\.\s]*(.+?)<\/h[23]>/gi;
    const stepMatches: { index: number; num: number; title: string }[] = [];

    while ((match = stepPattern.exec(htmlContent)) !== null) {
      stepMatches.push({
        index: match.index,
        num: parseInt(match[1]),
        title: match[2].replace(/<[^>]+>/g, '').trim(),
      });
    }

    if (stepMatches.length >= 3) {
      for (const s of stepMatches) {
        const afterHeading = htmlContent.slice(s.index);
        const pMatch = afterHeading.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        const text = pMatch
          ? pMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 300)
          : s.title;

        steps.push({ name: s.title, text });
      }
    }
  }

  return steps;
}

// 게시글 HTML에서 FAQ 추출 (3가지 패턴 감지)
export function extractFAQFromContent(htmlContent: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  let match;

  // 패턴 1: <p><strong>(Q. )?질문?</strong> 답변</p> (인라인 Q&A)
  const inlinePattern = /<p[^>]*><strong>(?:Q\.?\s*)?(.+?\?)<\/strong>\s*([\s\S]+?)<\/p>/gi;
  while ((match = inlinePattern.exec(htmlContent)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answer = match[2].replace(/<[^>]+>/g, '').trim();
    if (question && answer && answer.length > 5) {
      faqs.push({ question, answer: answer.slice(0, 500) });
    }
  }

  // 패턴 2: <p><strong>(Q. )?질문?</strong></p> + <p>(A. )?답변</p> (분리형)
  const separatePattern = /<p[^>]*><strong>(?:Q\.?\s*)?(.+?\?)<\/strong><\/p>\s*<p[^>]*>(?:A\.?\s*)?([\s\S]+?)<\/p>/gi;
  while ((match = separatePattern.exec(htmlContent)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answer = match[2].replace(/<[^>]+>/g, '').trim();
    if (question && answer && answer.length > 5 && !faqs.some(f => f.question === question)) {
      faqs.push({ question, answer: answer.slice(0, 500) });
    }
  }

  // 패턴 3: <h3>질문?</h3> + <p>답변</p> (H3 제목형 FAQ)
  const h3Pattern = /<h3[^>]*>([^<]*\?)<\/h3>\s*<p[^>]*>([\s\S]+?)<\/p>/gi;
  while ((match = h3Pattern.exec(htmlContent)) !== null) {
    const question = match[1].trim();
    const answer = match[2].replace(/<[^>]+>/g, '').trim();
    if (question && answer && answer.length > 5 && !faqs.some(f => f.question === question)) {
      faqs.push({ question, answer: answer.slice(0, 500) });
    }
  }

  return faqs;
}
