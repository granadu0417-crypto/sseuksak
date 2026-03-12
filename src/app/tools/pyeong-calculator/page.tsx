'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

const PYEONG_TO_SQM = 3.3058;

const QUICK_PYEONG = [
  { label: '10평', value: 10 },
  { label: '18평', value: 18 },
  { label: '24평', value: 24 },
  { label: '32평', value: 32 },
  { label: '42평', value: 42 },
  { label: '59평', value: 59 },
];

const APARTMENT_SIZES = [
  { type: '원룸/오피스텔', pyeong: 8, sqm: 26.45 },
  { type: '소형 아파트', pyeong: 18, sqm: 59.50 },
  { type: '국민주택', pyeong: 25, sqm: 82.64 },
  { type: '중형 아파트', pyeong: 32, sqm: 105.79 },
  { type: '중대형 아파트', pyeong: 42, sqm: 138.84 },
  { type: '대형 아파트', pyeong: 50, sqm: 165.29 },
  { type: '펜트하우스', pyeong: 70, sqm: 231.41 },
];

export default function PyeongCalculatorPage() {
  const [mode, setMode] = useState<'toSqm' | 'toPyeong'>('toSqm');
  const [pyeong, setPyeong] = useState<string>('24');
  const [sqm, setSqm] = useState<string>('');

  const result = useMemo(() => {
    if (mode === 'toSqm') {
      const p = parseFloat(pyeong);
      if (!p || p <= 0) return null;
      return {
        pyeong: p,
        sqm: p * PYEONG_TO_SQM,
        sqft: p * PYEONG_TO_SQM * 10.7639,
      };
    } else {
      const s = parseFloat(sqm);
      if (!s || s <= 0) return null;
      return {
        pyeong: s / PYEONG_TO_SQM,
        sqm: s,
        sqft: s * 10.7639,
      };
    }
  }, [mode, pyeong, sqm]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="평수 계산기" description="평수를 제곱미터(㎡)로, 제곱미터를 평수로 간편하게 변환합니다" url="/tools/pyeong-calculator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "25평은 몇 제곱미터(㎡)인가요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "25평은 약 82.64㎡입니다. 1평은 약 3.3058㎡이므로 25 x 3.3058 = 82.645㎡입니다. 아파트에서 '국민주택 규모'라고 하면 전용면적 85㎡ 이하를 뜻하며, 이는 약 25.7평에 해당합니다."
                }
              },
              {
                "@type": "Question",
                "name": "전용면적 84㎡는 몇 평인가요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "전용면적 84㎡는 약 25.4평입니다. 하지만 아파트 분양 시 '34평형'이라고 부르는 이유는 공급면적(전용 + 공용) 기준이기 때문입니다. 전용 84㎡ 아파트의 공급면적은 보통 112~115㎡(약 34평)입니다."
                }
              },
              {
                "@type": "Question",
                "name": "평수와 제곱미터 변환 공식은 무엇인가요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "평을 제곱미터로 변환하려면 평수에 3.3058을 곱합니다(㎡ = 평 x 3.3058). 반대로 제곱미터를 평으로 변환하려면 3.3058로 나눕니다(평 = ㎡ ÷ 3.3058). 1평은 가로 약 1.818m x 세로 약 1.818m의 넓이입니다."
                }
              }
            ]
          })
        }}
      />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">평수 계산기</h1>
        <p className="text-gray-600">
          평(坪)과 제곱미터(㎡)를 간편하게 변환해요
        </p>
      </div>

      {/* 모드 선택 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('toSqm')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'toSqm'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          평 → ㎡
        </button>
        <button
          onClick={() => setMode('toPyeong')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === 'toPyeong'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ㎡ → 평
        </button>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {mode === 'toSqm' ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평수 입력
            </label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                value={pyeong}
                onChange={(e) => setPyeong(e.target.value)}
                placeholder="평수를 입력하세요"
                className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={0}
                step="any"
              />
              <span className="text-gray-600 font-medium whitespace-nowrap">평</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PYEONG.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPyeong(String(item.value))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pyeong === String(item.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제곱미터 입력
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={sqm}
                onChange={(e) => setSqm(e.target.value)}
                placeholder="㎡를 입력하세요"
                className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={0}
                step="any"
              />
              <span className="text-gray-600 font-medium whitespace-nowrap">㎡</span>
            </div>
          </>
        )}
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-1">변환 결과</p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {result.pyeong.toFixed(result.pyeong % 1 === 0 ? 0 : 1)}평
                </p>
              </div>
              <span className="text-2xl text-gray-400">=</span>
              <div>
                <p className="text-3xl font-bold text-indigo-600">
                  {result.sqm.toFixed(2)}㎡
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">평</p>
              <p className="font-bold text-gray-900">{result.pyeong.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">㎡ (제곱미터)</p>
              <p className="font-bold text-gray-900">{result.sqm.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">ft² (제곱피트)</p>
              <p className="font-bold text-gray-900">{result.sqft.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 아파트 면적 기준표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">아파트 면적 기준표</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">유형</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">평수</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">㎡</th>
              </tr>
            </thead>
            <tbody>
              {APARTMENT_SIZES.map((item) => {
                const isHighlighted = result && Math.abs(result.pyeong - item.pyeong) < 3;
                return (
                  <tr
                    key={item.type}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isHighlighted ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setMode('toSqm');
                      setPyeong(String(item.pyeong));
                    }}
                  >
                    <td className={`py-2 px-2 ${isHighlighted ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                      {item.type}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-600">{item.pyeong}평</td>
                    <td className="py-2 px-2 text-center text-gray-600">{item.sqm}㎡</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수식 설명 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">변환 공식</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">평 → ㎡</p>
            <p className="font-mono">㎡ = 평 x 3.3058</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-1">㎡ → 평</p>
            <p className="font-mono">평 = ㎡ ÷ 3.3058</p>
          </div>
          <p className="text-xs text-gray-500">
            * 1평 = 가로 6자(약 1.818m) x 세로 6자(약 1.818m) = 약 3.3058㎡
          </p>
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 아파트 분양 면적은 전용면적 + 공용면적(복도, 계단 등)입니다.</li>
          <li>* 전용면적 84㎡는 약 25평(공급면적 기준 34평형)입니다.</li>
          <li>* 2007년부터 부동산 공식 면적 단위는 ㎡이지만, 관행적으로 평수를 함께 사용합니다.</li>
          <li>* 정확한 면적은 등기부등본 또는 건축물대장을 확인하세요.</li>
        </ul>
      </div>

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">사용 예시</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">아파트 전용면적 84㎡ 확인</p>
            <p className="text-sm text-blue-800">84㎡ ÷ 3.3058 = <strong>약 25.4평</strong> (전용면적 기준). 분양 공고에서 &apos;34평형&apos;이라 부르는 이유는 공급면적(전용+공용) 기준 약 112㎡ = 34평이기 때문입니다.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">원룸 8평짜리 실제 크기</p>
            <p className="text-sm text-green-800">8평 x 3.3058 = <strong>약 26.4㎡</strong>. 가로 약 5.1m x 세로 약 5.1m 정도의 공간으로, 침대와 책상, 소형 주방을 배치할 수 있는 크기입니다.</p>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
        <div className="space-y-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900 text-sm">25평은 몇 제곱미터(㎡)인가요?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="mt-2 p-3 text-sm text-gray-700 leading-relaxed">
              25평은 약 82.64㎡입니다. 1평 = 약 3.3058㎡이므로 25 x 3.3058 = 82.645㎡입니다. &apos;국민주택 규모&apos;는 전용면적 85㎡ 이하를 뜻하며, 약 25.7평에 해당합니다.
            </div>
          </details>
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900 text-sm">전용면적 84㎡는 몇 평인가요?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="mt-2 p-3 text-sm text-gray-700 leading-relaxed">
              전용면적 84㎡는 약 25.4평입니다. 아파트 분양 시 &apos;34평형&apos;이라 부르는 이유는 공급면적(전용+공용) 기준이기 때문입니다. 전용 84㎡ 아파트의 공급면적은 보통 112~115㎡(약 34평)입니다.
            </div>
          </details>
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900 text-sm">평수와 제곱미터 변환 공식은?</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="mt-2 p-3 text-sm text-gray-700 leading-relaxed">
              평 → ㎡: 평수 x 3.3058. ㎡ → 평: 제곱미터 ÷ 3.3058. 1평은 가로 약 1.818m x 세로 약 1.818m(6자 x 6자)의 넓이입니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/rent-conversion-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">전월세 전환율 계산기</span>
            <p className="text-sm text-gray-500 mt-1">전세↔월세 전환율과 적정 월세 계산</p>
          </Link>
          <Link href="/tools/loan-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">대출이자 계산기</span>
            <p className="text-sm text-gray-500 mt-1">대출 조건별 월 상환금과 총 이자 비교</p>
          </Link>
          <Link href="/tools/gift-tax-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">증여세 계산기</span>
            <p className="text-sm text-gray-500 mt-1">증여금액과 관계별 증여세 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
