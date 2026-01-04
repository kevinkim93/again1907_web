export default function SkeletonTable() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="animate-pulse">
        {/* 헤더 */}
        <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>

        {/* 테이블 헤더 */}
        <div className="flex gap-4 mb-3">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
        </div>

        {/* 테이블 행들 */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 mb-2">
            <div className="h-12 bg-gray-100 rounded flex-1"></div>
            <div className="h-12 bg-gray-100 rounded flex-1"></div>
            <div className="h-12 bg-gray-100 rounded flex-1"></div>
            <div className="h-12 bg-gray-100 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
