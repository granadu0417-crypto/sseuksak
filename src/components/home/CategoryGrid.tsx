import Link from 'next/link';
import { Category } from '@/types/database';

// 카테고리 색상 매핑 (Tailwind 클래스)
const colorMap: Record<string, string> = {
  '#4CAF50': 'bg-green-100',
  '#2196F3': 'bg-blue-100',
  '#FF9800': 'bg-orange-100',
  '#795548': 'bg-amber-100',
  '#9C27B0': 'bg-purple-100',
  '#E91E63': 'bg-pink-100',
  '#FF5722': 'bg-red-100',
  '#00BCD4': 'bg-cyan-100',
  '#607D8B': 'bg-slate-100',
  '#673AB7': 'bg-violet-100',
  '#F44336': 'bg-rose-100',
  '#FFEB3B': 'bg-yellow-100',
};

// 폴백 카테고리 (데이터베이스 연결 전 또는 오류 시 사용)
const fallbackCategories = [
  { id: '1', slug: 'cleaning', name: '청소', icon: '🧹', color: '#4CAF50', order_index: 1, created_at: '' },
  { id: '2', slug: 'moving', name: '이사', icon: '📦', color: '#2196F3', order_index: 2, created_at: '' },
  { id: '3', slug: 'interior', name: '인테리어', icon: '🏠', color: '#FF9800', order_index: 3, created_at: '' },
  { id: '4', slug: 'repair', name: '수리', icon: '🔧', color: '#795548', order_index: 4, created_at: '' },
  { id: '5', slug: 'lesson', name: '레슨', icon: '📚', color: '#9C27B0', order_index: 5, created_at: '' },
  { id: '6', slug: 'beauty', name: '뷰티', icon: '💄', color: '#E91E63', order_index: 6, created_at: '' },
  { id: '7', slug: 'pet', name: '반려동물', icon: '🐕', color: '#FF5722', order_index: 7, created_at: '' },
  { id: '8', slug: 'health', name: '건강', icon: '💪', color: '#00BCD4', order_index: 8, created_at: '' },
  { id: '9', slug: 'it', name: 'IT/개발', icon: '💻', color: '#607D8B', order_index: 9, created_at: '' },
  { id: '10', slug: 'more', name: '더보기', icon: '➕', color: '#607D8B', order_index: 10, created_at: '' },
];

interface CategoryGridProps {
  categories?: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // 데이터베이스에서 가져온 카테고리가 없으면 폴백 사용
  const displayCategories = categories && categories.length > 0
    ? categories.slice(0, 10)
    : fallbackCategories;

  return (
    <div className="grid grid-cols-5 gap-3">
      {displayCategories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="flex flex-col items-center tap-feedback"
        >
          <div
            className={`w-14 h-14 rounded-2xl ${colorMap[category.color] || 'bg-gray-100'} flex items-center justify-center mb-1.5`}
          >
            <span className="text-2xl">{category.icon}</span>
          </div>
          <span className="text-xs text-gray-700 font-medium">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
