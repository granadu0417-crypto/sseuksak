'use client';

import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    title: '신규 가입 이벤트',
    subtitle: '첫 서비스 10% 할인',
    bgColor: 'bg-gradient-to-r from-orange-400 to-pink-500',
    textColor: 'text-white',
  },
  {
    id: 2,
    title: '전문가 모집',
    subtitle: '쓱싹에서 고객을 만나세요',
    bgColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
    textColor: 'text-white',
  },
  {
    id: 3,
    title: '무료 연결',
    subtitle: '수수료 걱정 없이 연결하세요',
    bgColor: 'bg-gradient-to-r from-green-400 to-teal-500',
    textColor: 'text-white',
  },
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      {/* 배너 컨테이너 */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`w-full flex-shrink-0 ${banner.bgColor} mx-4 first:ml-4 last:mr-4`}
              style={{ width: 'calc(100% - 32px)' }}
            >
              <div className="px-6 py-8 rounded-2xl">
                <p className={`text-sm opacity-90 ${banner.textColor}`}>
                  {banner.subtitle}
                </p>
                <h3 className={`text-xl font-bold mt-1 ${banner.textColor}`}>
                  {banner.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-[#FF6B35] w-4'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
