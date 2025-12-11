export default function NearbyPage() {
  return (
    <div className="pt-4 px-4">
      <h1 className="text-2xl font-bold mb-4">내 주변</h1>
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        <div className="text-center">
          <span className="text-6xl block mb-4">📍</span>
          <p>내 주변 서비스를 찾아보세요</p>
          <p className="text-sm mt-2">위치 권한이 필요합니다</p>
        </div>
      </div>
    </div>
  );
}
