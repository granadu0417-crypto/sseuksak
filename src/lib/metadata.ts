import type { Metadata } from 'next';

const SITE_NAME = '쓱싹';
const SITE_URL = 'https://sseuksak.com';
const DEFAULT_DESCRIPTION = '다양한 주제의 유용한 정보를 제공하는 블로그';

export interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
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
  image,
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
  section,
  tags,
}: MetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullUrl = `${SITE_URL}${url}`;

  // Handle image URL - use provided image or default
  const DEFAULT_OG_IMAGE = '/images/og-default.png';
  const imageUrl = image || DEFAULT_OG_IMAGE;
  const fullImage = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
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
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
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
  image,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
}) {
  // Handle image URL properly
  const DEFAULT_OG_IMAGE = '/images/og-default.png';
  const imageUrl = image || DEFAULT_OG_IMAGE;
  const fullImage = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: fullImage,
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

// 게시글 HTML에서 FAQ 추출 (Q&A 패턴 감지)
export function extractFAQFromContent(htmlContent: string): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Q1. Q2. Q3. 패턴 또는 ### Q1. 패턴 매칭
  const qPattern = /(?:<h3[^>]*>|<p[^>]*><strong>)(?:Q\d+[\.:]\s*)(.+?)(?:<\/h3>|<\/strong><\/p>)/gi;
  const aPattern = /(?:<p[^>]*>A[\.:]\s*)(.+?)(?:<\/p>)/gi;

  const questions: string[] = [];
  const answers: string[] = [];

  let match;
  while ((match = qPattern.exec(htmlContent)) !== null) {
    // HTML 태그 제거
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    questions.push(question);
  }

  while ((match = aPattern.exec(htmlContent)) !== null) {
    // HTML 태그 제거하고 텍스트만 추출
    let answer = match[1].replace(/<[^>]+>/g, '').trim();
    // 콜론 이후 내용도 포함
    if (answer.length < 10) {
      // 짧으면 다음 p 태그들도 포함 (리스트 형태의 답변)
      const nextContent = htmlContent.slice(match.index + match[0].length);
      const nextPMatch = nextContent.match(/^([\s\S]*?)(?=<h|<p[^>]*>(?:A\d*[\.:]))/i);
      if (nextPMatch) {
        answer += ' ' + nextPMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
    answers.push(answer);
  }

  // 질문과 답변 매칭
  for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
    if (questions[i] && answers[i]) {
      faqs.push({
        question: questions[i],
        answer: answers[i].slice(0, 500), // 답변 길이 제한
      });
    }
  }

  return faqs;
}
