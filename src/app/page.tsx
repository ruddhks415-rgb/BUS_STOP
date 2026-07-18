export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-50 text-gray-900">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 tracking-tight">
          전남대학교 버스정류장 <br />
          불편제보 안내 서비스
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          이 서비스는 전남대학교 학생들의 편의를 위해 주변 버스정류장의 불편사항을 제보하고,
          실시간 도착 정보를 확인할 수 있도록 돕습니다.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-6">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 shadow-md"
            href="/map"
          >
            지도 확인하기
          </a>
          <a
            className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-800 hover:bg-gray-100 text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 shadow-sm"
            href="/admin"
          >
            관리자 대시보드
          </a>
        </div>
      </main>
      <footer className="mt-16 text-sm text-gray-500">
        준비 중인 서비스입니다.
      </footer>
    </div>
  );
}
