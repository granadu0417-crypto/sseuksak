'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const LIFE_EXPECTANCY = 90;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = LIFE_EXPECTANCY * WEEKS_PER_YEAR; // 4,680주

// 인생의 챕터들 (일반적인 마일스톤)
const LIFE_CHAPTERS = [
  { age: 0, name: '유아기', description: '세상을 처음 만나는 시기' },
  { age: 6, name: '초등학교', description: '학교와 친구를 처음 경험' },
  { age: 13, name: '중·고등학교', description: '정체성 형성, 입시 준비' },
  { age: 19, name: '대학/사회초년', description: '전공 선택, 첫 직장' },
  { age: 25, name: '커리어 빌딩', description: '경력 쌓기, 관계 형성' },
  { age: 35, name: '성숙기', description: '가정, 전문성 확립' },
  { age: 50, name: '절정기', description: '경험의 정점, 멘토링' },
  { age: 65, name: '은퇴기', description: '새로운 삶의 시작' },
  { age: 80, name: '황혼기', description: '지혜의 시기' },
];

// 주의 두 가지 좋은 사용법 (Wait But Why)
const GOOD_WEEK_USES = [
  {
    type: '즐기기',
    description: '현재를 충분히 즐기는 주',
    examples: ['여행', '친구와의 시간', '취미 활동', '맛있는 음식', '자연 속에서'],
  },
  {
    type: '만들기',
    description: '미래를 위해 무언가를 쌓는 주',
    examples: ['공부', '운동', '저축', '기술 습득', '관계 구축'],
  },
];

interface LifeStats {
  totalWeeks: number;
  livedWeeks: number;
  remainingWeeks: number;
  percentageLived: number;
  currentAge: number;
}

function calculateLifeStats(birthDate: string): LifeStats | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();

  const diffMs = today.getTime() - birth.getTime();
  const livedWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const currentAge = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));

  return {
    totalWeeks: TOTAL_WEEKS,
    livedWeeks: Math.min(livedWeeks, TOTAL_WEEKS),
    remainingWeeks: Math.max(TOTAL_WEEKS - livedWeeks, 0),
    percentageLived: Math.min((livedWeeks / TOTAL_WEEKS) * 100, 100),
    currentAge,
  };
}

function WeekGrid({ livedWeeks }: { livedWeeks: number }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`,
          width: 'max-content',
          minWidth: '100%',
        }}
      >
        {Array.from({ length: TOTAL_WEEKS }).map((_, index) => {
          const isLived = index < livedWeeks;
          const yearBoundary = index % WEEKS_PER_YEAR === 0;
          const decadeBoundary = index % (WEEKS_PER_YEAR * 10) === 0;

          return (
            <div
              key={index}
              className={`
                w-[6px] h-[6px] sm:w-2 sm:h-2 rounded-[1px]
                ${isLived ? 'bg-blue-500' : 'bg-gray-200'}
                ${decadeBoundary && index > 0 ? 'ring-1 ring-gray-400' : ''}
              `}
              title={`${Math.floor(index / WEEKS_PER_YEAR)}세 ${index % WEEKS_PER_YEAR + 1}주차`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function LifeInWeeksPage() {
  const [birthDate, setBirthDate] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  const stats = useMemo(() => calculateLifeStats(birthDate), [birthDate]);

  const handleGenerate = () => {
    if (stats) {
      setShowGrid(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:underline">
          ← 도구 목록으로
        </Link>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Life in Weeks</h1>
        <p className="text-gray-600">
          당신의 인생을 주 단위로 시각화해요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            생년월일을 입력하세요
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setShowGrid(false);
            }}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!birthDate}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          내 인생 시각화하기
        </button>
      </div>

      {stats && showGrid && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">당신의 인생 통계</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">현재 나이</p>
                <p className="text-2xl font-bold text-blue-600">{stats.currentAge}세</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">지나간 주</p>
                <p className="text-2xl font-bold text-blue-600">{stats.livedWeeks.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">남은 주</p>
                <p className="text-2xl font-bold text-green-600">{stats.remainingWeeks.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">진행률</p>
                <p className="text-2xl font-bold text-gray-900">{stats.percentageLived.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>0세</span>
                <span>{LIFE_EXPECTANCY}세</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.percentageLived}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">당신의 인생 ({TOTAL_WEEKS.toLocaleString()}주)</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="text-gray-600">지나간 주</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm" />
                  <span className="text-gray-600">남은 주</span>
                </div>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-500">
              가로 = 1년 (52주), 세로 = {LIFE_EXPECTANCY}년
            </div>

            <WeekGrid livedWeeks={stats.livedWeeks} />

            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>0세</span>
              <span>10세</span>
              <span>20세</span>
              <span>30세</span>
              <span>40세</span>
              <span>50세</span>
              <span>60세</span>
              <span>70세</span>
              <span>80세</span>
            </div>
          </div>

          {/* 인생 챕터 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">인생의 챕터들</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {LIFE_CHAPTERS.map((chapter, index) => {
                  const isPast = stats.currentAge >= chapter.age;
                  const isCurrent = stats.currentAge >= chapter.age &&
                    (index === LIFE_CHAPTERS.length - 1 || stats.currentAge < LIFE_CHAPTERS[index + 1].age);
                  return (
                    <div key={chapter.age} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isCurrent ? 'bg-blue-500 ring-4 ring-blue-200' :
                        isPast ? 'bg-blue-400' : 'bg-gray-200'
                      }`}>
                        <span className="text-xs text-white font-medium">{chapter.age}</span>
                      </div>
                      <div className={`flex-1 pb-2 ${isCurrent ? 'font-medium' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className={isPast ? 'text-gray-900' : 'text-gray-400'}>{chapter.name}</span>
                          <span className="text-xs text-gray-400">{chapter.age}세~</span>
                          {isCurrent && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">현재</span>}
                        </div>
                        <p className="text-sm text-gray-500">{chapter.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">생각해볼 것들</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 지난 {stats.livedWeeks.toLocaleString()}주 동안 가장 의미 있었던 순간은?</li>
              <li>• 남은 {stats.remainingWeeks.toLocaleString()}주를 어떻게 보내고 싶으신가요?</li>
              <li>• 이번 주를 특별하게 만들 한 가지는 무엇인가요?</li>
              <li>• 1년 후, 어떤 사람이 되어 있고 싶으신가요?</li>
            </ul>
          </div>
        </>
      )}

      {/* 다이아몬드 비유 */}
      <div className="mt-8 bg-indigo-50 rounded-xl border border-indigo-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">다이아몬드 비유</h3>
        <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-gray-700 mb-4">
          &quot;작은 다이아몬드가 담긴 테이블스푼을 상상해보세요. 그리고 누군가가 그 다이아몬드들을 손바닥에 쏟아부은 뒤, 그것이 당신 인생의 전부라고 말합니다. 갑자기, 그 작은 다이아몬드들이 매우 소중해 보이지 않나요?&quot;
        </blockquote>
        <p className="text-sm text-gray-600">
          — Tim Urban, &quot;Wait But Why&quot; (2014)
        </p>
      </div>

      {/* 주의 두 가지 좋은 사용법 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">주(週)의 두 가지 좋은 사용법</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {GOOD_WEEK_USES.map((use) => (
            <div key={use.type} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{use.type}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{use.description}</p>
              <div className="flex flex-wrap gap-1">
                {use.examples.map((ex) => (
                  <span key={ex} className="px-2 py-0.5 bg-white text-xs text-gray-500 rounded border">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Neither Week 경고 */}
      <div className="mt-6 bg-red-50 rounded-xl border border-red-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">&quot;Neither Week&quot;을 조심하세요</h3>
        <p className="text-sm text-gray-700 mb-3">
          Tim Urban이 경고하는 가장 나쁜 유형의 주입니다:
        </p>
        <div className="bg-white rounded-lg p-4 border border-red-100">
          <p className="text-gray-700 italic mb-2">
            &quot;즐기지도 않고, 미래를 위해 쌓지도 않는 주. 그냥 시간이 지나가버리는 주.&quot;
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 소셜 미디어 무한 스크롤</li>
            <li>• 의미 없는 TV 시청</li>
            <li>• 하기 싫은 일을 하며 불평만 하기</li>
            <li>• 결정을 미루며 시간 낭비</li>
          </ul>
        </div>
      </div>

      {/* 기본 설명 */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Life in Weeks란?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Tim Urban의 블로그 &quot;Wait But Why&quot;에서 2014년에 소개된 개념이에요</li>
          <li>• 인생을 주 단위로 보면 시간의 유한함을 강렬하게 느낄 수 있어요</li>
          <li>• 90세 기준 인생은 단 <strong>{TOTAL_WEEKS.toLocaleString()}주</strong>예요</li>
          <li>• 매 주를 &quot;즐기기&quot; 또는 &quot;만들기&quot;에 투자하세요</li>
          <li>• 당신의 Life Calendar는 벽에 걸어두고 매주 색칠할 수 있어요</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            참고: waitbutwhy.com - &quot;Your Life in Weeks&quot; by Tim Urban (2014)
          </p>
        </div>
      </div>
    </div>
  );
}
