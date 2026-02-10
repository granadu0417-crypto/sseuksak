interface ToolJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export default function ToolJsonLd({ name, description, url }: ToolJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `https://sseuksak.com${url}`,
    applicationCategory: '계산기',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    provider: {
      '@type': 'Organization',
      name: '쓱싹',
      url: 'https://sseuksak.com',
    },
    inLanguage: 'ko-KR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
