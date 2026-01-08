'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  calendarEvents,
  categoryLabels,
  categoryColors,
  getAllCategories,
  type EventCategory,
  type CalendarEvent,
} from '@/lib/calendar-data';

const months = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function formatDate(event: CalendarEvent): string {
  if (event.day) {
    if (event.endDay) {
      return `${event.month}/${event.day}~${event.endDay}`;
    }
    return `${event.month}/${event.day}`;
  }
  return `${event.month}월`;
}

export default function CalendarPage() {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      const matchMonth = event.month === selectedMonth;
      const matchCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchMonth && matchCategory;
    });
  }, [selectedMonth, selectedCategory]);

  const categories = getAllCategories();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">2026년 주요 일정</h1>
        <p className="text-gray-600">
          세금, 자격증, 지원금 등 중요한 날짜를 놓치지 마세요
        </p>
      </div>

      {/* 월 선택 탭 */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-2">
          {months.map((month, index) => {
            const monthNum = index + 1;
            const isSelected = selectedMonth === monthNum;
            const isCurrent = currentMonth === monthNum;

            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(monthNum)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
                {isCurrent && !isSelected && (
                  <span className="ml-1 text-xs">(현재)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {categories.map((category) => {
          const colors = categoryColors[category];
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          );
        })}
      </div>

      {/* 일정 목록 */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const colors = categoryColors[event.category];

            return (
              <div
                key={`${event.month}-${event.title}-${index}`}
                className={`p-4 rounded-xl border ${colors.border} ${colors.bg} ${
                  event.important ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 날짜 */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {formatDate(event)}
                    </span>
                  </div>

                  {/* 내용 */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      {event.important && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
                          중요
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}
                      >
                        {categoryLabels[event.category]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    {event.relatedPost && (
                      <Link
                        href={`/posts/${event.relatedPost}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        관련 글 보기
                        <svg
                          className="ml-1 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">해당 조건의 일정이 없습니다.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              전체 일정 보기
            </button>
          </div>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-2">참고 안내</p>
        <ul className="space-y-1">
          <li>* 일정은 변경될 수 있으니 공식 발표를 확인하세요.</li>
          <li>* 자격증 시험 일정은 한국산업인력공단 큐넷(Q-Net)에서 확인할 수 있습니다.</li>
          <li>* 세금 관련 일정은 국세청 홈택스에서 확인할 수 있습니다.</li>
        </ul>
      </div>

      {/* 카테고리별 간략 설명 */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {categories.map((category) => {
          const colors = categoryColors[category];
          const count = calendarEvents.filter((e) => e.category === category).length;

          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedMonth(1);
              }}
              className={`p-3 rounded-lg border ${colors.border} ${colors.bg} text-center hover:shadow-md transition-shadow`}
            >
              <span className={`block text-lg font-bold ${colors.text}`}>{count}</span>
              <span className="text-xs text-gray-600">{categoryLabels[category]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
