import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회사에서 나는 무슨 동물? - 직장 동물 테스트',
  description: '12개 질문으로 알아보는 나의 직장 동물 유형! 독수리, 강아지, 고양이, 부엉이, 여우 중 나는 어떤 타입일까요? 직장에서의 나를 동물로 알아보세요.',
  keywords: ['직장 동물 테스트', '직장인 성격테스트', '업무 스타일 테스트', '회사 동물 테스트', '직장 MBTI', '직장인 심리테스트'],
  openGraph: {
    title: '회사에서 나는 무슨 동물? - 직장 동물 테스트',
    description: '12개 질문으로 알아보는 나의 직장 동물 유형! 독수리, 강아지, 고양이, 부엉이, 여우 중 나는?',
    type: 'website',
    locale: 'ko_KR',
    siteName: '쓱싹',
  },
  twitter: {
    card: 'summary_large_image',
    title: '회사에서 나는 무슨 동물? - 직장 동물 테스트',
    description: '12개 질문으로 알아보는 나의 직장 동물 유형! 독수리, 강아지, 고양이, 부엉이, 여우 중 나는?',
  },
};

export default function OfficeAnimalTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
