'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

interface Subscription {
  id: string;
  name: string;
  price: number;
  category: string;
  checked: boolean;
}

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  // 영상
  { id: 'netflix', name: '넷플릭스', price: 17000, category: '영상', checked: false },
  { id: 'youtube', name: '유튜브 프리미엄', price: 14900, category: '영상', checked: false },
  { id: 'disney', name: '디즈니+', price: 9900, category: '영상', checked: false },
  { id: 'tving', name: '티빙', price: 13900, category: '영상', checked: false },
  { id: 'wavve', name: '웨이브', price: 13900, category: '영상', checked: false },
  { id: 'coupangplay', name: '쿠팡플레이', price: 7890, category: '영상', checked: false },
  { id: 'watcha', name: '왓챠', price: 12900, category: '영상', checked: false },
  // 음악
  { id: 'melon', name: '멜론', price: 10900, category: '음악', checked: false },
  { id: 'spotify', name: '스포티파이', price: 10900, category: '음악', checked: false },
  { id: 'applemusic', name: '애플뮤직', price: 10900, category: '음악', checked: false },
  { id: 'genie', name: '지니뮤직', price: 10900, category: '음악', checked: false },
  { id: 'flo', name: 'FLO', price: 10900, category: '음악', checked: false },
  // 쇼핑/배달
  { id: 'rocketwow', name: '쿠팡 로켓와우', price: 7890, category: '쇼핑', checked: false },
  { id: 'naverplus', name: '네이버플러스', price: 4900, category: '쇼핑', checked: false },
  { id: 'baemin', name: '배민클럽', price: 9900, category: '쇼핑', checked: false },
  // 도서/학습
  { id: 'millie', name: '밀리의서재', price: 9900, category: '도서', checked: false },
  { id: 'ridiselect', name: '리디셀렉트', price: 11900, category: '도서', checked: false },
  { id: 'yes24', name: '예스24 크레마클럽', price: 5500, category: '도서', checked: false },
  // 클라우드/생산성
  { id: 'icloud', name: 'iCloud+', price: 1100, category: '클라우드', checked: false },
  { id: 'googledrive', name: 'Google One', price: 2400, category: '클라우드', checked: false },
  { id: 'notion', name: 'Notion Plus', price: 10000, category: '생산성', checked: false },
  { id: 'chatgpt', name: 'ChatGPT Plus', price: 28000, category: '생산성', checked: false },
];

function formatMoney(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export default function SubscriptionAuditPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, checked: !sub.checked } : sub
      )
    );
  };

  const addCustomSubscription = () => {
    if (customName && customPrice) {
      const newSub: Subscription = {
        id: `custom-${Date.now()}`,
        name: customName,
        price: Number(customPrice),
        category: '기타',
        checked: true,
      };
      setSubscriptions((prev) => [...prev, newSub]);
      setCustomName('');
      setCustomPrice('');
    }
  };

  const checkedSubs = subscriptions.filter((sub) => sub.checked);
  const monthlyTotal = checkedSubs.reduce((sum, sub) => sum + sub.price, 0);
  const yearlyTotal = monthlyTotal * 12;
  const fiveYearTotal = yearlyTotal * 5;

  const categories = [...new Set(subscriptions.map((sub) => sub.category))];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="구독 서비스 총액 계산기" description="구독 서비스 총 비용을 계산하고 절약 방법을 찾습니다" url="/tools/subscription-audit" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <span className="text-6xl mb-4 block">📱</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">구독 서비스 총액 계산기</h1>
        <p className="text-gray-600">
          내가 쓰는 구독 서비스들의 총 비용을 확인해요
        </p>
      </div>

      {/* 결과 요약 - 상단 고정 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 mb-6 sticky top-4 z-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">월</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatMoney(monthlyTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">연</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatMoney(yearlyTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">5년</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{formatMoney(fiveYearTotal)}</p>
          </div>
        </div>
        {checkedSubs.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            {checkedSubs.length}개 구독 서비스 선택됨
          </p>
        )}
      </div>

      {/* 구독 서비스 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">사용 중인 서비스를 선택하세요</h3>

        {categories.map((category) => (
          <div key={category} className="mb-6 last:mb-0">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              {category === '영상' && '🎬'}
              {category === '음악' && '🎵'}
              {category === '쇼핑' && '🛒'}
              {category === '도서' && '📚'}
              {category === '클라우드' && '☁️'}
              {category === '생산성' && '⚡'}
              {category === '기타' && '📦'}
              <span className="ml-1">{category}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subscriptions
                .filter((sub) => sub.category === category)
                .map((sub) => (
                  <label
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      sub.checked
                        ? 'bg-purple-100 border-2 border-purple-400'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sub.checked}
                        onChange={() => toggleSubscription(sub.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="ml-3 text-gray-900">{sub.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatMoney(sub.price)}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}

        {/* 직접 추가 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-3">➕ 직접 추가</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="서비스명"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <input
              type="number"
              placeholder="월 가격"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={addCustomSubscription}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      {/* 선택된 항목 상세 */}
      {checkedSubs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">📋 선택된 구독 목록</h3>
          <div className="space-y-2">
            {checkedSubs.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-700">{sub.name}</span>
                <span className="font-medium">{formatMoney(sub.price)}/월</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 비교 인사이트 */}
      {yearlyTotal > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 이 금액으로 할 수 있는 것들</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 연간 {formatMoney(yearlyTotal)} = 해외여행 {Math.floor(yearlyTotal / 1500000)}회</li>
            <li>• 5년간 {formatMoney(fiveYearTotal)} = 중고차 1대</li>
            <li>• 이 돈을 연 7% 투자하면 10년 후 약 {formatMoney(Math.floor(yearlyTotal * 10 * 1.07 ** 5))}</li>
          </ul>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">🔍 구독 정리 팁</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 최근 한 달간 사용하지 않은 서비스는 과감히 해지하세요</li>
          <li>• 가족/친구와 공유 가능한 요금제를 확인해보세요</li>
          <li>• 연간 결제 시 할인되는 서비스가 많아요</li>
          <li>• 비슷한 기능의 서비스는 하나만 남기세요</li>
        </ul>
      </div>

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '한국인 평균 구독 서비스 지출은 얼마인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '2024년 기준 한국인 1인당 평균 구독 서비스 수는 3~4개, 월 평균 지출은 약 4~5만원입니다. OTT(넷플릭스, 유튜브 프리미엄), 음악 스트리밍, 쇼핑 멤버십 순으로 많이 이용하며, 인지하지 못한 채 유지되는 서비스까지 포함하면 실제 지출은 더 높을 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '구독 서비스 비용을 절약하는 방법은?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '첫째, 최근 한 달간 사용하지 않은 서비스는 해지합니다. 둘째, 가족/친구와 공유 요금제를 활용하면 1인당 비용을 절반 이하로 줄일 수 있습니다. 셋째, 연간 결제 시 월 결제 대비 20~30% 할인되는 서비스가 많습니다. 넷째, 비슷한 기능의 서비스(예: 넷플릭스와 티빙)는 하나만 유지하세요.',
                },
              },
              {
                '@type': 'Question',
                name: '구독 서비스 해지 시 위약금이 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '대부분의 월정액 구독 서비스(넷플릭스, 유튜브 프리미엄, 멜론 등)는 위약금 없이 언제든 해지 가능합니다. 해지 후에도 결제 기간 종료일까지 서비스를 이용할 수 있습니다. 다만 연간 결제를 한 경우 일부 서비스는 환불 정책이 다를 수 있으니 약관을 확인하세요.',
                },
              },
            ],
          }),
        }}
      />

      {/* 상세 가이드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">구독 서비스 관리 완벽 가이드</h2>
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">구독 경제의 함정</h3>
            <p>한국소비자원 조사에 따르면 성인 1인당 평균 3.4개의 구독 서비스를 이용하며, 월 평균 지출은 약 4~6만 원입니다. 문제는 가입한 사실을 잊고 사용하지 않는 &apos;잠자는 구독&apos;이 전체의 약 30%에 달한다는 점입니다. 매달 자동결제되는 소액이 모이면 연간 수십만 원의 불필요한 지출이 됩니다.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">구독 서비스 유형과 평균 요금</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>OTT(영상 스트리밍)</strong>: 넷플릭스(5,500~17,000원), 디즈니+(9,900원), 웨이브(7,900~13,900원), 티빙(5,500~13,900원), 쿠팡플레이(7,890원 - 로켓와우 포함)</li>
              <li><strong>음악 스트리밍</strong>: 멜론(10,900원), 스포티파이(10,900원), 유튜브 뮤직(10,990원), 애플뮤직(10,900원)</li>
              <li><strong>클라우드/생산성</strong>: iCloud+(1,100~13,400원), 구글 원(2,400~39,000원), 노션(월 $10), MS 365(8,900원)</li>
              <li><strong>배송/커머스</strong>: 쿠팡 로켓와우(7,890원), SSG닷컴(3,900원), 네이버 플러스 멤버십(4,900원)</li>
              <li><strong>기타</strong>: 통신 부가서비스, 앱스토어 인앱구독, 뉴스레터, 온라인 강의 등</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">숨은 구독 찾는 방법</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>카드 명세서 확인</strong>: 최근 3개월간 카드/계좌 이체 내역에서 정기결제 항목을 모두 표시합니다.</li>
              <li><strong>앱스토어 구독 관리</strong>: iPhone(설정 - Apple ID - 구독), Android(Play Store - 결제 및 정기결제)에서 활성 구독을 확인합니다.</li>
              <li><strong>이메일 검색</strong>: 메일에서 &apos;구독&apos;, &apos;결제&apos;, &apos;갱신&apos;, &apos;subscription&apos; 등으로 검색하면 잊고 있던 서비스를 찾을 수 있습니다.</li>
              <li><strong>금융앱 정기결제 조회</strong>: 토스, 카카오뱅크 등에서 정기결제 내역을 한눈에 확인할 수 있습니다.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">구독비 절약 전략</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>가족/공유 요금제 활용</strong>: 넷플릭스, 유튜브 프리미엄, 스포티파이 등은 가족 요금제가 1인당 비용이 훨씬 저렴합니다.</li>
              <li><strong>연간 결제 할인</strong>: 연간 결제 시 월 결제 대비 15~30% 할인되는 서비스가 많습니다. 장기 사용이 확실한 경우 유리합니다.</li>
              <li><strong>통신사 결합 할인</strong>: SK텔레콤(Wavve/FLO), KT(시즌/지니), LG U+(유플러스 멤버십)에서 통신비에 OTT가 포함된 요금제를 제공합니다.</li>
              <li><strong>무료 체험 후 해지</strong>: 새 서비스 가입 시 무료 체험 기간에 알림을 설정해두고, 필요 없으면 기한 전 해지하세요.</li>
              <li><strong>월별 순환 이용</strong>: 꼭 동시에 모든 OTT를 구독할 필요는 없습니다. 한 달씩 순환하며 이용하면 비용을 크게 줄일 수 있습니다.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">구독 해지 시 주의사항</h3>
            <p>대부분의 월정액 구독은 위약금 없이 해지 가능하며, 해지 후에도 결제 기간 종료일까지 이용할 수 있습니다. 단, 연간 결제의 경우 환불 조건이 다를 수 있으니 약관을 확인하세요. 앱스토어에서 구독한 서비스는 앱을 삭제해도 자동결제가 계속되므로, 반드시 구독 관리에서 해지해야 합니다.</p>
          </div>
        </div>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">구독 서비스 총액 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">일반적인 직장인 구독 패턴</p>
            <p className="text-sm text-gray-600">
              넷플릭스(17,000원) + 유튜브 프리미엄(14,900원) + 멜론(10,900원) + 쿠팡 로켓와우(7,890원)
              = 월 50,690원, 연 608,280원. 5년이면 약 304만원입니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">절약형 - 가족 공유 활용</p>
            <p className="text-sm text-gray-600">
              넷플릭스 프리미엄(가족 4명 분할 시 약 4,250원) + 유튜브 패밀리(6명 분할 시 약 3,650원)
              = 월 약 7,900원. 개별 결제 대비 연간 약 30만원을 절약할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">자주 묻는 질문</h3>
        <div className="space-y-3">
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              한국인 평균 구독 서비스 지출은 얼마인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              2024년 기준 한국인 1인당 평균 구독 서비스 수는 3~4개, 월 평균 지출은 약 4~5만원입니다.
              OTT, 음악 스트리밍, 쇼핑 멤버십 순으로 많이 이용하며,
              인지하지 못한 채 유지되는 서비스까지 포함하면 실제 지출은 더 높을 수 있습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              구독 서비스 비용을 절약하는 방법은?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              첫째, 최근 한 달간 사용하지 않은 서비스는 해지합니다.
              둘째, 가족이나 친구와 공유 요금제를 활용하면 1인당 비용을 절반 이하로 줄일 수 있습니다.
              셋째, 연간 결제 시 월 결제 대비 20~30% 할인되는 서비스가 많습니다.
              넷째, 비슷한 기능의 서비스는 하나만 유지하세요.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              구독 서비스 해지 시 위약금이 있나요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              대부분의 월정액 구독 서비스(넷플릭스, 유튜브 프리미엄, 멜론 등)는 위약금 없이 언제든 해지 가능합니다.
              해지 후에도 결제 기간 종료일까지 서비스를 이용할 수 있습니다.
              다만 연간 결제를 한 경우 일부 서비스는 환불 정책이 다를 수 있으니 약관을 확인하세요.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/fire-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">FIRE 조기은퇴 계산기</span>
            <p className="text-sm text-gray-500 mt-1">저축률과 투자수익률로 은퇴 시기 계산</p>
          </Link>
          <Link href="/tools/salary-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연봉 실수령액 계산기</span>
            <p className="text-sm text-gray-500 mt-1">4대보험, 세금 공제 후 실수령액</p>
          </Link>
          <Link href="/tools/savings-interest-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">적금 이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">적금/예금 이자와 세후 실수령액 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
