'use client';

import { useState } from 'react';

const areas = [
  { id: 'gangnam', name: '강남', count: 1234 },
  { id: 'hongdae', name: '홍대', count: 987 },
  { id: 'seongsu', name: '성수', count: 756 },
  { id: 'jamsil', name: '잠실', count: 654 },
  { id: 'yeouido', name: '여의도', count: 543 },
  { id: 'itaewon', name: '이태원', count: 432 },
];

export default function AreaSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="scroll-x -mx-4 px-4">
      {areas.map((area) => (
        <button
          key={area.id}
          onClick={() => setSelected(area.id)}
          className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl min-w-[80px] tap-feedback transition-colors ${
            selected === area.id
              ? 'bg-[#FF6B35] text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <span className="font-semibold">{area.name}</span>
          <span className={`text-xs mt-0.5 ${
            selected === area.id ? 'text-orange-100' : 'text-gray-500'
          }`}>
            {area.count.toLocaleString()}개
          </span>
        </button>
      ))}
    </div>
  );
}
