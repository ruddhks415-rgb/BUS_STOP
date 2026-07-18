export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">관리자 대시보드</h1>
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">제보 데이터 집계 (준비 중)</h2>
        <p className="text-gray-500 text-center">
          이곳에서 정류장별, 불편 유형별 제보 현황을 확인할 수 있도록 구현할 예정입니다.
        </p>
      </div>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        ← 홈으로 돌아가기
      </a>
    </div>
  );
}
