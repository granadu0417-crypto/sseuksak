export const runtime = 'edge';

import Header from '@/components/home/Header';
import CategoryGrid from '@/components/home/CategoryGrid';
import BannerCarousel from '@/components/home/BannerCarousel';
import PopularKeywords from '@/components/home/PopularKeywords';
import AreaSelector from '@/components/home/AreaSelector';
import ServiceCardList from '@/components/home/ServiceCardList';
import { getCategories, getPopularServices } from '@/lib/api/services';

export default async function Home() {
  // 서버 컴포넌트에서 데이터 가져오기
  const [categories, popularServices] = await Promise.all([
    getCategories(),
    getPopularServices(10),
  ]);
  return (
    <div className="safe-bottom">
      {/* 상단 헤더 */}
      <Header />

      {/* 배너 캐러셀 */}
      <section className="mt-4">
        <BannerCarousel />
      </section>

      {/* 카테고리 그리드 */}
      <section className="mt-6 px-4">
        <h2 className="text-lg font-bold mb-3">어떤 서비스를 찾으세요?</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* 인기 검색어 */}
      <section className="mt-6 px-4">
        <h2 className="text-lg font-bold mb-3">인기 검색어</h2>
        <PopularKeywords />
      </section>

      {/* 지역 선택 */}
      <section className="mt-6 px-4">
        <h2 className="text-lg font-bold mb-3">어디에서 찾으세요?</h2>
        <AreaSelector />
      </section>

      {/* 추천 서비스 (인기순) */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">추천 서비스</h2>
          <button className="text-sm text-gray-500">더보기</button>
        </div>
        <ServiceCardList services={popularServices} />
      </section>

      {/* 신규 등록 서비스 */}
      <section className="mt-6">
        <div className="px-4 flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">새로 등록된 서비스</h2>
          <button className="text-sm text-gray-500">더보기</button>
        </div>
        <ServiceCardList isNew />
      </section>
    </div>
  );
}
