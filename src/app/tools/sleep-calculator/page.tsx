'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolJsonLd from '@/components/ToolJsonLd';

const SLEEP_CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;

// 수면 단계 정보 (sleepopolis.com 기반)
const SLEEP_STAGES = [
  {
    name: 'N1 (입면기)',
    duration: '1~7분',
    description: '깨어있는 상태에서 잠으로 전환되는 단계. 쉽게 깨어날 수 있고, 근육이 경련하는 "hypnic jerks"가 발생할 수 있어요.',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    name: 'N2 (얕은 수면)',
    duration: '전체의 ~50%',
    description: '체온이 떨어지고 심박수가 느려져요. 기억 통합이 시작되며, 깊은 수면으로 가는 관문이에요.',
    color: 'bg-indigo-100 border-indigo-300',
  },
  {
    name: 'N3 (깊은 수면)',
    duration: '전체의 ~20%',
    description: '가장 회복적인 단계! 성장 호르몬이 분비되고, 조직 복구와 면역력 강화가 이루어져요. 이 단계에서 깨면 매우 피곤해요.',
    color: 'bg-purple-100 border-purple-300',
  },
  {
    name: 'REM (렘수면)',
    duration: '전체의 ~25%',
    description: '꿈을 꾸는 단계! 뇌가 활발하게 활동하며, 기억력과 감정 조절에 중요해요. 눈이 빠르게 움직여요.',
    color: 'bg-pink-100 border-pink-300',
  },
];

// CDC 기준 연령별 권장 수면 시간
const AGE_RECOMMENDATIONS = [
  { age: '신생아 (0-3개월)', hours: '14-17시간' },
  { age: '영아 (4-12개월)', hours: '12-16시간' },
  { age: '유아 (1-2세)', hours: '11-14시간' },
  { age: '미취학 (3-5세)', hours: '10-13시간' },
  { age: '학령기 (6-12세)', hours: '9-12시간' },
  { age: '청소년 (13-18세)', hours: '8-10시간' },
  { age: '성인 (18-60세)', hours: '7시간 이상' },
  { age: '노년 (61세 이상)', hours: '7-9시간' },
];

// 수면 부족 영향
const SLEEP_DEPRIVATION_EFFECTS = [
  { hours: '24시간', effect: '혈중 알코올 0.1%와 비슷한 인지능력 저하' },
  { hours: '17시간', effect: '반응속도와 판단력 저하 시작' },
  { hours: '36시간+', effect: '기억력, 면역력, 심혈관 건강에 영향' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function calculateWakeUpTimes(bedTime: string): string[] {
  const [hours, minutes] = bedTime.split(':').map(Number);
  const bed = new Date();
  bed.setHours(hours, minutes, 0, 0);

  // 잠드는 데 걸리는 시간 추가
  bed.setMinutes(bed.getMinutes() + FALL_ASLEEP_MINUTES);

  const times: string[] = [];
  for (let cycles = 4; cycles <= 6; cycles++) {
    const wakeUp = new Date(bed);
    wakeUp.setMinutes(wakeUp.getMinutes() + cycles * SLEEP_CYCLE_MINUTES);
    times.push(formatTime(wakeUp));
  }
  return times;
}

function calculateBedTimes(wakeUpTime: string): string[] {
  const [hours, minutes] = wakeUpTime.split(':').map(Number);
  const wake = new Date();
  wake.setHours(hours, minutes, 0, 0);

  const times: string[] = [];
  for (let cycles = 6; cycles >= 4; cycles--) {
    const bed = new Date(wake);
    bed.setMinutes(bed.getMinutes() - cycles * SLEEP_CYCLE_MINUTES - FALL_ASLEEP_MINUTES);
    times.push(formatTime(bed));
  }
  return times;
}

export default function SleepCalculatorPage() {
  const [mode, setMode] = useState<'wakeup' | 'bedtime'>('wakeup');
  const [time, setTime] = useState('07:00');
  const [results, setResults] = useState<string[] | null>(null);

  const handleCalculate = () => {
    if (mode === 'wakeup') {
      setResults(calculateBedTimes(time));
    } else {
      setResults(calculateWakeUpTimes(time));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToolJsonLd name="수면 사이클 계산기" description="수면 사이클에 맞는 최적 기상 시간을 계산합니다" url="/tools/sleep-calculator" />
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">수면 사이클 계산기</h1>
        <p className="text-gray-600">
          90분 수면 사이클에 맞춰 일어나면 개운하게 기상할 수 있어요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('wakeup'); setResults(null); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'wakeup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            일어나야 할 시간
          </button>
          <button
            onClick={() => { setMode('bedtime'); setResults(null); }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'bedtime'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            자야 할 시간
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'wakeup' ? '기상 시간을 선택하세요' : '취침 시간을 선택하세요'}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          계산하기
        </button>
      </div>

      {results && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {mode === 'wakeup' ? '추천 취침 시간' : '추천 기상 시간'}
          </h2>
          <div className="space-y-3">
            {results.map((resultTime, index) => {
              const cycles = mode === 'wakeup' ? 6 - index : index + 4;
              const hours = (cycles * 90) / 60;
              const isOptimal = cycles === 5 || cycles === 6;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isOptimal ? 'bg-green-100 border-2 border-green-400' : 'bg-white'
                  }`}
                >
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{resultTime}</span>
                    <span className="ml-3 text-sm text-gray-600">
                      ({hours}시간, {cycles}사이클)
                    </span>
                  </div>
                  {isOptimal && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                      추천
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            * 잠드는 데 약 15분이 걸린다고 가정했어요
          </p>
        </div>
      )}

      {/* 수면 단계 설명 */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">수면의 4단계</h3>
        <p className="text-sm text-gray-600 mb-4">
          하나의 수면 사이클(90분)은 4개의 단계로 구성돼요. 각 단계마다 몸과 뇌에서 다른 일이 일어나요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SLEEP_STAGES.map((stage) => (
            <div
              key={stage.name}
              className={`p-4 rounded-lg border ${stage.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{stage.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{stage.duration}</span>
              </div>
              <p className="text-sm text-gray-600">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 연령별 권장 수면 시간 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">연령별 권장 수면 시간 (CDC 기준)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AGE_RECOMMENDATIONS.map((rec) => (
            <div key={rec.age} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{rec.age}</p>
              <p className="font-bold text-blue-600">{rec.hours}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 수면 부족의 영향 */}
      <div className="mt-6 bg-red-50 rounded-xl border border-red-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">수면 부족이 미치는 영향</h3>
        <div className="space-y-3">
          {SLEEP_DEPRIVATION_EFFECTS.map((item) => (
            <div key={item.hours} className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-200 text-red-800 text-sm font-medium rounded-full whitespace-nowrap">
                {item.hours}
              </span>
              <span className="text-sm text-gray-700">{item.effect}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 수면 위생 팁 */}
      <div className="mt-6 bg-green-50 rounded-xl border border-green-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">더 나은 수면을 위한 팁</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">환경</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 침실 온도는 15-19°C가 이상적</li>
              <li>• 암막 커튼으로 빛 차단</li>
              <li>• 조용한 환경 유지 (백색소음 OK)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">피해야 할 것</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 취침 6시간 전 카페인</li>
              <li>• 취침 3시간 전 과식</li>
              <li>• 취침 전 블루라이트 (핸드폰)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">습관</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 매일 같은 시간 취침/기상</li>
              <li>• 30분 이상 낮잠은 피하기</li>
              <li>• 침대는 수면용으로만 사용</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">취침 전</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 30분 전 조명 어둡게</li>
              <li>• 따뜻한 물로 샤워/족욕</li>
              <li>• 가벼운 스트레칭이나 독서</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 수면 사이클 설명 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">수면 사이클이란?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 수면은 약 <strong>90~110분</strong> 단위의 사이클로 구성돼요</li>
          <li>• 사이클이 끝나는 시점(얕은 수면)에 일어나면 개운해요</li>
          <li>• 깊은 수면(N3) 중간에 일어나면 피곤하고 머리가 무거워요</li>
          <li>• 성인 기준 <strong>5~6사이클(7.5~9시간)</strong>이 적정 수면이에요</li>
          <li>• 밤이 깊어질수록 REM 수면 비율이 높아지고, 꿈을 더 많이 꿔요</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            참고: sleepopolis.com, CDC Sleep Guidelines
          </p>
        </div>
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
                name: '수면 사이클은 몇 분인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '하나의 수면 사이클은 약 90분(1시간 30분)입니다. N1(입면기), N2(얕은 수면), N3(깊은 수면), REM(렘수면) 4단계로 구성되며, 하룻밤에 4~6사이클을 반복합니다. 사이클이 끝나는 시점(얕은 수면)에 일어나면 개운하게 기상할 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '성인 적정 수면 시간은 몇 시간인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'CDC(미국 질병통제예방센터) 기준으로 18~60세 성인은 7시간 이상, 61세 이상은 7~9시간의 수면이 권장됩니다. 수면 사이클 기준으로는 5사이클(7시간 30분) 또는 6사이클(9시간)이 최적입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '수면 사이클 중간에 일어나면 왜 피곤한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '깊은 수면(N3) 단계에서 억지로 깨면 "수면 관성(sleep inertia)"이 발생해 30분~1시간 동안 두뇌가 완전히 깨어나지 못합니다. 얕은 수면(N1~N2) 단계, 즉 사이클이 끝나는 시점에 일어나면 자연스럽게 각성되어 개운합니다.',
                },
              },
            ],
          }),
        }}
      />

      {/* 사용 예시 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">수면 계산기 사용 예시</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">아침 7시에 일어나야 하는 직장인</p>
            <p className="text-sm text-gray-600">
              기상 시간 07:00 입력 시, 추천 취침 시간은 오후 9:45(6사이클, 9시간),
              오후 11:15(5사이클, 7.5시간), 오전 12:45(4사이클, 6시간)입니다.
              5~6사이클이 권장되므로 오후 9:45~11:15 사이에 잠드는 것이 좋습니다.
            </p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="font-medium text-gray-900 mb-1">밤 11시에 잠자리에 드는 학생</p>
            <p className="text-sm text-gray-600">
              취침 시간 23:00 입력 시, 추천 기상 시간은 오전 4:45(4사이클),
              오전 6:15(5사이클), 오전 7:45(6사이클)입니다.
              학교 등교를 고려하면 오전 6:15(5사이클, 7.5시간)에 일어나는 것이 최적입니다.
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
              수면 사이클은 몇 분인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              하나의 수면 사이클은 약 90분(1시간 30분)입니다.
              N1(입면기), N2(얕은 수면), N3(깊은 수면), REM(렘수면) 4단계로 구성되며,
              하룻밤에 4~6사이클을 반복합니다.
              사이클이 끝나는 시점(얕은 수면)에 일어나면 개운하게 기상할 수 있고,
              깊은 수면 중간에 깨면 피곤함을 느끼게 됩니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              성인 적정 수면 시간은 몇 시간인가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              CDC(미국 질병통제예방센터) 기준으로 18~60세 성인은 7시간 이상, 61세 이상은 7~9시간의 수면이 권장됩니다.
              수면 사이클 기준으로는 5사이클(7시간 30분) 또는 6사이클(9시간)이 최적입니다.
              4사이클(6시간)도 가능하지만, 장기적으로 수면 부족이 누적될 수 있어 권장되지 않습니다.
            </div>
          </details>
          <details className="group border border-gray-200 rounded-lg">
            <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900">
              수면 사이클 중간에 일어나면 왜 피곤한가요?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600">
              깊은 수면(N3) 단계에서 억지로 깨면 &quot;수면 관성(sleep inertia)&quot;이 발생합니다.
              이 상태에서는 30분~1시간 동안 두뇌가 완전히 깨어나지 못해 피로감, 집중력 저하를 느낍니다.
              얕은 수면(N1~N2) 단계, 즉 사이클이 끝나는 시점에 일어나면
              자연스럽게 각성되어 개운하게 하루를 시작할 수 있습니다.
            </div>
          </details>
        </div>
      </div>

      {/* 관련 도구 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">관련 도구</h3>
        <div className="space-y-2">
          <Link href="/tools/bmi-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">BMI 계산기</span>
            <p className="text-sm text-gray-500 mt-1">체질량지수로 비만도 확인</p>
          </Link>
          <Link href="/tools/age-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">나이 계산기</span>
            <p className="text-sm text-gray-500 mt-1">만 나이, 한국 나이 확인</p>
          </Link>
          <Link href="/tools/annual-leave-calculator" className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <span className="text-blue-600 font-medium">연차 계산기</span>
            <p className="text-sm text-gray-500 mt-1">입사일 기준 연차 발생일수 계산</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
