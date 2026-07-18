export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">지도 확인하기</h1>
      <div className="w-full max-w-4xl h-[600px] bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
        <p className="text-gray-500 text-lg">카카오맵 지도 영역 Placeholder</p>
      </div>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        ← 홈으로 돌아가기
      </a>
    </div>
  );
}
