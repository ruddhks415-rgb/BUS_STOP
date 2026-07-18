export default function ReportPage({
  searchParams,
}: {
  searchParams: { stop?: string };
}) {
  const stopId = searchParams.stop || "알 수 없음";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">정류장 불편 제보</h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-lg text-gray-700 mb-4">
          제보할 정류소 ID: <span className="font-bold text-blue-600">{stopId}</span>
        </p>
        <div className="h-40 bg-gray-100 flex items-center justify-center rounded border border-gray-300">
          <p className="text-gray-500">제보 폼 (준비 중)</p>
        </div>
      </div>
      <a href="/" className="mt-8 text-blue-600 hover:underline">
        ← 홈으로 돌아가기
      </a>
    </div>
  );
}
