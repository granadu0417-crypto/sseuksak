'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

const ZODIAC_ANIMALS = [
  '원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양',
];

const ZODIAC_WESTERN = [
  { sign: '물병자리', start: [1, 20], end: [2, 18] },
  { sign: '물고기자리', start: [2, 19], end: [3, 20] },
  { sign: '양자리', start: [3, 21], end: [4, 19] },
  { sign: '황소자리', start: [4, 20], end: [5, 20] },
  { sign: '쌍둥이자리', start: [5, 21], end: [6, 21] },
  { sign: '게자리', start: [6, 22], end: [7, 22] },
  { sign: '사자자리', start: [7, 23], end: [8, 22] },
  { sign: '처녀자리', start: [8, 23], end: [9, 22] },
  { sign: '천칭자리', start: [9, 23], end: [10, 23] },
  { sign: '전갈자리', start: [10, 24], end: [11, 22] },
  { sign: '사수자리', start: [11, 23], end: [12, 21] },
  { sign: '염소자리', start: [12, 22], end: [1, 19] },
];

function getWesternZodiac(month: number, day: number): string {
  for (const z of ZODIAC_WESTERN) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm <= em) {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em)) {
        return z.sign;
      }
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || month > sm || month < em) {
        return z.sign;
      }
    }
  }
  return '염소자리';
}

interface AgeResult {
  manAge: number;
  koreanAge: number;
  yearAge: number;
  zodiacAnimal: string;
  westernZodiac: string;
  daysLived: number;
  nextBirthday: number;
  birthdayPassed: boolean;
}

function calculateAge(birthYear: number, birthMonth: number, birthDay: number): AgeResult | null {
  const today = new Date();
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();

  if (birthYear < 1900 || birthYear > ty) return null;
  if (birthMonth < 1 || birthMonth > 12) return null;
  if (birthDay < 1 || birthDay > 31) return null;

  // 만 나이: 생일이 지났으면 올해-태어난해, 안 지났으면 -1
  const birthdayPassed = tm > birthMonth || (tm === birthMonth && td >= birthDay);
  const manAge = ty - birthYear - (birthdayPassed ? 0 : 1);

  // 한국 나이(세는 나이): 올해 - 태어난 해 + 1
  const koreanAge = ty - birthYear + 1;

  // 연 나이: 올해 - 태어난 해
  const yearAge = ty - birthYear;

  // 띠
  const zodiacAnimal = ZODIAC_ANIMALS[birthYear % 12];

  // 별자리
  const westernZodiac = getWesternZodiac(birthMonth, birthDay);

  // 살아온 일수
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const daysLived = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  // 다음 생일까지
  let nextBirthdayDate = new Date(ty, birthMonth - 1, birthDay);
  if (nextBirthdayDate <= today) {
    nextBirthdayDate = new Date(ty + 1, birthMonth - 1, birthDay);
  }
  const nextBirthday = Math.ceil((nextBirthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    manAge,
    koreanAge,
    yearAge,
    zodiacAnimal,
    westernZodiac,
    daysLived,
    nextBirthday,
    birthdayPassed,
  };
}

export default function AgeCalculatorPage() {
  const [birthYear, setBirthYear] = useState('1995');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');

  const result = useMemo(() => {
    return calculateAge(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay));
  }, [birthYear, birthMonth, birthDay]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="나이 계산기" description="생년월일로 만 나이, 한국 나이, 연 나이를 한눈에 확인합니다" url="/tools/age-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          &larr; 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">나이 계산기</h1>
        <p className="text-gray-600">
          생년월일을 입력하면 만 나이, 한국 나이를 알려드려요
        </p>
      </div>

      {/* 입력 섹션 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">생년월일 입력</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일</label>
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 결과 섹션 */}
      {result && result.manAge >= 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">만 나이 (법적 나이)</p>
            <p className="text-5xl font-bold text-blue-600">{result.manAge}세</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">한국 나이 (세는 나이)</p>
              <p className="text-2xl font-bold text-gray-900">{result.koreanAge}세</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">연 나이</p>
              <p className="text-2xl font-bold text-gray-900">{result.yearAge}세</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">띠</p>
              <p className="text-lg font-bold text-gray-900">{result.zodiacAnimal}띠</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">별자리</p>
              <p className="text-lg font-bold text-gray-900">{result.westernZodiac}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">살아온 일수</p>
              <p className="text-lg font-bold text-gray-900">{result.daysLived.toLocaleString()}일</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">다음 생일까지</p>
              <p className="text-lg font-bold text-gray-900">
                {result.nextBirthday === 0 ? '오늘!' : `${result.nextBirthday}일`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 나이 계산법 비교 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">나이 계산법 비교</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-gray-600 font-medium">구분</th>
                <th className="text-left py-2 px-2 text-gray-600 font-medium">계산법</th>
                <th className="text-left py-2 px-2 text-gray-600 font-medium">사용처</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-2 px-2 font-medium text-blue-600">만 나이</td>
                <td className="py-2 px-2 text-gray-700">생일 기준, 생일이 지나야 +1</td>
                <td className="py-2 px-2 text-gray-600">법적 기준 (2023.6~)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium text-gray-900">한국 나이</td>
                <td className="py-2 px-2 text-gray-700">태어나면 1살, 매년 1.1에 +1</td>
                <td className="py-2 px-2 text-gray-600">일상 대화 (폐지됨)</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium text-gray-900">연 나이</td>
                <td className="py-2 px-2 text-gray-700">올해 연도 - 출생 연도</td>
                <td className="py-2 px-2 text-gray-600">병역법, 청소년보호법</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 만 나이 기준 주요 법적 나이 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">만 나이 기준 주요 법적 나이</h3>
        <div className="space-y-2 text-sm">
          {[
            { age: '만 14세', desc: '형사 책임 능력, 근로 가능' },
            { age: '만 18세', desc: '선거권, 운전면허 취득' },
            { age: '만 19세', desc: '성인, 음주/흡연 가능' },
            { age: '만 20세', desc: '국민연금 의무 가입' },
            { age: '만 25세', desc: '대형면허 취득 가능' },
            { age: '만 60세', desc: '정년 (법정 기준)' },
            { age: '만 62세', desc: '국민연금 수령 시작 (1969년 이후 출생)' },
            { age: '만 65세', desc: '기초연금 수급, 노인 복지 혜택' },
          ].map((item) => (
            <div key={item.age} className="flex items-start gap-3 py-1.5 border-b border-gray-100 last:border-0">
              <span className="font-medium text-blue-600 whitespace-nowrap min-w-[64px]">{item.age}</span>
              <span className="text-gray-700">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">참고 사항</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>* 2023년 6월 28일부터 법적 나이 기준이 만 나이로 통일되었습니다.</li>
          <li>* 병역법, 청소년보호법 등 일부 법령은 여전히 연 나이를 사용합니다.</li>
          <li>* 한국 나이(세는 나이)는 공식적으로 폐지되었지만 일상 대화에서 사용됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
