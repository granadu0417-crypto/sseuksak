'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    </div>
  );
}
