import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '적금 이자 계산기 - 예금/적금 이자 및 세후 수령액',
  description: '적금, 예금 이자를 계산합니다. 단리/복리, 일반과세/비과세/세금우대 조건별 세후 실수령액을 확인하세요. 2026년 최신 이자소득세 반영.',
  keywords: ['적금이자계산기', '예금이자계산기', '이자계산', '복리계산', '세후이자', '적금만기', '예금이자'],
  openGraph: {
    title: '적금/예금 이자 계산기 | 쓱싹',
    description: '적금, 예금 이자와 세후 실수령액을 간편하게 계산',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
