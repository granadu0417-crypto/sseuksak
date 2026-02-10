'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  healthRisk: string;
  idealWeightMin: number;
  idealWeightMax: number;
  weightToIdeal: number;
}

function calculateBMI(height: number, weight: number): BMIResult {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // BMI 카테고리 (대한비만학회 기준)
  let category: string;
  let categoryColor: string;
  let healthRisk: string;

  if (bmi < 18.5) {
    category = '저체중';
    categoryColor = 'text-blue-600';
    healthRisk = '영양실조, 면역력 저하 위험';
  } else if (bmi < 23) {
    category = '정상';
    categoryColor = 'text-green-600';
    healthRisk = '양호';
  } else if (bmi < 25) {
    category = '과체중';
    categoryColor = 'text-yellow-600';
    healthRisk = '비만 주의';
  } else if (bmi < 30) {
    category = '비만 (1단계)';
    categoryColor = 'text-orange-600';
    healthRisk = '고혈압, 당뇨 위험 증가';
  } else if (bmi < 35) {
    category = '비만 (2단계)';
    categoryColor = 'text-red-500';
    healthRisk = '심혈관질환 위험 높음';
  } else {
    category = '고도비만';
    categoryColor = 'text-red-700';
    healthRisk = '심각한 건강 위험';
  }

  // 정상 체중 범위 계산 (BMI 18.5 ~ 23 기준)
  const idealWeightMin = 18.5 * heightM * heightM;
  const idealWeightMax = 23 * heightM * heightM;

  // 정상 체중까지 필요한 감량/증량
  let weightToIdeal = 0;
  if (bmi < 18.5) {
    weightToIdeal = idealWeightMin - weight;
  } else if (bmi > 23) {
    weightToIdeal = weight - idealWeightMax;
  }

  return {
    bmi,
    category,
    categoryColor,
    healthRisk,
    idealWeightMin,
    idealWeightMax,
    weightToIdeal,
  };
}

function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}

// BMI 단계 시각화용 데이터
const BMI_RANGES = [
  { min: 0, max: 18.5, label: '저체중', color: 'bg-blue-400' },
  { min: 18.5, max: 23, label: '정상', color: 'bg-green-500' },
  { min: 23, max: 25, label: '과체중', color: 'bg-yellow-400' },
  { min: 25, max: 30, label: '비만1', color: 'bg-orange-500' },
  { min: 30, max: 35, label: '비만2', color: 'bg-red-500' },
  { min: 35, max: 50, label: '고도비만', color: 'bg-red-700' },
];

export default function BMICalculatorPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0) return null;
    return calculateBMI(height, weight);
  }, [height, weight]);

  // BMI 바에서 현재 위치 계산 (0~50 범위를 퍼센트로)
  const bmiPosition = result ? Math.min(Math.max((result.bmi / 50) * 100, 0), 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="BMI 계산기" description="키와 체중으로 체질량지수(BMI)와 비만도를 측정합니다" url="/tools/bmi-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BMI 계산기</h1>
        <p className="text-gray-600">
          키와 체중을 입력하면 체질량지수(BMI)를 계산해드려요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">신체 정보 입력</h3>

        {/* 키 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            키 (cm)
          </label>
          <input
            type="range"
            min={100}
            max={220}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">100cm</span>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-24 px-3 py-2 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={100}
              max={220}
            />
            <span className="text-sm text-gray-500">220cm</span>
          </div>
        </div>

        {/* 체중 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            체중 (kg)
          </label>
          <input
            type="range"
            min={30}
            max={200}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">30kg</span>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-24 px-3 py-2 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min={30}
              max={200}
            />
            <span className="text-sm text-gray-500">200kg</span>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200 p-6 mb-6">
          {/* BMI 수치 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">나의 BMI</p>
            <p className={`text-5xl font-bold ${result.categoryColor}`}>
              {formatNumber(result.bmi)}
            </p>
            <p className={`text-xl font-semibold mt-2 ${result.categoryColor}`}>
              {result.category}
            </p>
          </div>

          {/* BMI 게이지 바 */}
          <div className="mb-6">
            <div className="relative">
              {/* 바 배경 */}
              <div className="flex h-6 rounded-lg overflow-hidden">
                {BMI_RANGES.map((range, idx) => (
                  <div
                    key={idx}
                    className={`${range.color} flex-1`}
                    title={range.label}
                  />
                ))}
              </div>
              {/* 현재 위치 마커 */}
              <div
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${bmiPosition}%` }}
              >
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            </div>
            {/* 레이블 */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>저체중</span>
              <span>정상</span>
              <span>과체중</span>
              <span>비만</span>
              <span>고도비만</span>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">정상 체중 범위</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(result.idealWeightMin, 0)} - {formatNumber(result.idealWeightMax, 0)}kg
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">건강 위험도</p>
              <p className={`text-sm font-medium ${result.categoryColor}`}>
                {result.healthRisk}
              </p>
            </div>
          </div>

          {/* 목표 안내 */}
          {result.weightToIdeal > 0 && (
            <div className={`rounded-lg p-4 text-center ${
              result.bmi < 18.5 ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <p className={`font-medium ${result.bmi < 18.5 ? 'text-blue-700' : 'text-orange-700'}`}>
                {result.bmi < 18.5
                  ? `정상 체중까지 약 ${formatNumber(result.weightToIdeal, 1)}kg 증량이 필요해요`
                  : `정상 체중까지 약 ${formatNumber(result.weightToIdeal, 1)}kg 감량이 필요해요`
                }
              </p>
            </div>
          )}
          {result.bmi >= 18.5 && result.bmi < 23 && (
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="font-medium text-green-700">
                정상 체중입니다! 현재 상태를 유지하세요
              </p>
            </div>
          )}
        </div>
      )}

      {/* BMI 기준표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">BMI 기준표 (대한비만학회)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">분류</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">BMI 범위</th>
                <th className="text-left py-2 px-2 text-gray-600 font-medium">건강 위험</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-blue-600 font-medium">저체중</td>
                <td className="py-2 px-2 text-center">18.5 미만</td>
                <td className="py-2 px-2 text-gray-600">영양실조 위험</td>
              </tr>
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-2 px-2 text-green-600 font-medium">정상</td>
                <td className="py-2 px-2 text-center">18.5 - 22.9</td>
                <td className="py-2 px-2 text-gray-600">양호</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-yellow-600 font-medium">과체중</td>
                <td className="py-2 px-2 text-center">23 - 24.9</td>
                <td className="py-2 px-2 text-gray-600">위험 증가</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-orange-600 font-medium">비만 (1단계)</td>
                <td className="py-2 px-2 text-center">25 - 29.9</td>
                <td className="py-2 px-2 text-gray-600">중등도 위험</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 text-red-500 font-medium">비만 (2단계)</td>
                <td className="py-2 px-2 text-center">30 - 34.9</td>
                <td className="py-2 px-2 text-gray-600">고위험</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-red-700 font-medium">고도비만</td>
                <td className="py-2 px-2 text-center">35 이상</td>
                <td className="py-2 px-2 text-gray-600">매우 고위험</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * 아시아인 기준 (WHO 서태평양 지역 기준)
        </p>
      </div>

      {/* 키별 정상 체중 표 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">키별 정상 체중 범위</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">키</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">정상 체중</th>
                <th className="text-center py-2 px-2 text-gray-600 font-medium">표준 체중</th>
              </tr>
            </thead>
            <tbody>
              {[155, 160, 165, 170, 175, 180, 185].map((h) => {
                const hm = h / 100;
                const minW = 18.5 * hm * hm;
                const maxW = 23 * hm * hm;
                const stdW = 22 * hm * hm;
                const isSelected = Math.abs(height - h) < 3;
                return (
                  <tr
                    key={h}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => setHeight(h)}
                  >
                    <td className={`py-2 px-2 ${isSelected ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                      {h}cm
                    </td>
                    <td className="py-2 px-2 text-center text-gray-600">
                      {formatNumber(minW, 0)} - {formatNumber(maxW, 0)}kg
                    </td>
                    <td className={`py-2 px-2 text-center font-medium ${isSelected ? 'text-blue-600' : 'text-green-600'}`}>
                      {formatNumber(stdW, 0)}kg
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* BMI는 체중(kg) ÷ 키(m)² 로 계산됩니다.</li>
          <li>* BMI는 근육량, 체지방률을 고려하지 않습니다.</li>
          <li>* 운동선수나 근육량이 많은 분은 BMI가 높게 나올 수 있습니다.</li>
          <li>* 정확한 건강 상태는 전문의와 상담하세요.</li>
        </ul>
      </div>

      {/* 관련 정보 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">건강한 체중 관리 팁</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong className="text-gray-900">균형 잡힌 식단</strong>
              <p>탄수화물, 단백질, 지방을 적절히 섭취하세요.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong className="text-gray-900">규칙적인 운동</strong>
              <p>주 3-5회, 30분 이상의 유산소 운동을 권장합니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong className="text-gray-900">충분한 수면</strong>
              <p>하루 7-8시간의 수면이 체중 관리에 도움됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
