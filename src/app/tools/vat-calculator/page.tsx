'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

const VAT_RATE = 0.1;

const QUICK_AMOUNTS = [
  { label: '10만', value: 100000 },
  { label: '50만', value: 500000 },
  { label: '100만', value: 1000000 },
  { label: '500만', value: 5000000 },
  { label: '1,000만', value: 10000000 },
  { label: '1억', value: 100000000 },
];

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

export default function VatCalculatorPage() {
  const [mode, setMode] = useState<'fromSupply' | 'fromTotal'>('fromSupply');
  const [amount, setAmount] = useState<string>('1000000');

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return null;

    if (mode === 'fromSupply') {
      const supply = num;
      const vat = Math.round(supply * VAT_RATE);
      const total = supply + vat;
      return { supply, vat, total };
    } else {
      const total = num;
      const supply = Math.round(total / (1 + VAT_RATE));
      const vat = total - supply;
      return { supply, vat, total };
    }
  }, [mode, amount]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="부가세 계산기" description="공급가액에서 부가가치세(VAT 10%)를 계산하거나, 합계금액에서 부가세를 역산합니다" url="/tools/vat-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">부가세 계산기</h1>
        <p className="text-gray-600">
          부가가치세(VAT) 10%를 간편하게 계산해요
        </p>
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('fromSupply')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'fromSupply'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          공급가액 → 부가세
        </button>
        <button
          onClick={() => setMode('fromTotal')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'fromTotal'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          합계금액 → 역산
        </button>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'fromSupply' ? '공급가액 (부가세 제외 금액)' : '합계금액 (부가세 포함 금액)'}
        </label>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="금액을 입력하세요"
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={0}
          />
          <span className="text-gray-600 font-medium">원</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((item) => (
            <button
              key={item.value}
              onClick={() => setAmount(String(item.value))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                amount === String(item.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="text-gray-700 font-medium">공급가액</span>
              <span className="text-xl font-bold text-gray-900">{formatMoney(result.supply)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="text-gray-700 font-medium">부가세 (10%)</span>
              <span className="text-xl font-bold text-red-600">+ {formatMoney(result.vat)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-900 font-bold text-lg">합계금액</span>
              <span className="text-2xl font-bold text-blue-600">{formatMoney(result.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 세금계산서 미리보기 */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">세금계산서 기재 금액</h3>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">공급가액:</div>
              <div className="text-right font-bold">{formatMoney(result.supply)}</div>
              <div className="text-gray-600">세 액:</div>
              <div className="text-right font-bold">{formatMoney(result.vat)}</div>
              <div className="border-t border-gray-300 pt-2 text-gray-900 font-bold">합계금액:</div>
              <div className="border-t border-gray-300 pt-2 text-right font-bold text-blue-600">{formatMoney(result.total)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 부가세 세율표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">부가가치세 핵심 정리</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong className="text-gray-900">세율</strong>
              <p>일반 과세: 10% (대부분의 재화/용역)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong className="text-gray-900">신고/납부 기한</strong>
              <p>1기: 1~6월 → 7월 25일까지 / 2기: 7~12월 → 다음해 1월 25일까지</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong className="text-gray-900">면세 항목</strong>
              <p>가공되지 않은 농산물, 의료/교육 서비스, 도서/신문 등</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <strong className="text-gray-900">간이과세자</strong>
              <p>연매출 1억 400만원 미만 사업자, 업종별 부가가치율 적용 (1.5~4%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 계산 공식 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">계산 공식</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">공급가액 → 부가세</p>
            <p className="font-mono">부가세 = 공급가액 x 10%</p>
            <p className="font-mono">합계 = 공급가액 + 부가세</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">합계금액 → 역산</p>
            <p className="font-mono">공급가액 = 합계금액 ÷ 1.1</p>
            <p className="font-mono">부가세 = 합계금액 - 공급가액</p>
          </div>
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 부가가치세 일반 세율은 10%이며, 영세율(0%) 적용 대상도 있습니다.</li>
          <li>* 간이과세자는 업종별 부가가치율이 다르게 적용됩니다.</li>
          <li>* 원 단위 미만은 반올림 처리됩니다.</li>
          <li>* 정확한 세금 계산은 세무사와 상담하세요.</li>
        </ul>
      </div>
    </div>
  );
}
