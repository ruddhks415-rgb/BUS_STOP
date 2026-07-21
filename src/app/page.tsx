import Link from "next/link";
import { BusFront, Building2, Search, MapPin } from "lucide-react";
import BrandingHeader from "@/components/BrandingHeader";
import { getStatsData } from "@/lib/stats";

export const dynamic = 'force-dynamic';

function getIssueIcon(issueType: string) {
  if (issueType.includes("파손") || issueType.includes("노후")) return "🔧";
  if (issueType.includes("조명") || issueType.includes("전기")) return "💡";
  if (issueType.includes("청결") || issueType.includes("위생") || issueType.includes("쓰레기")) return "🧹";
  if (issueType.includes("안전")) return "⚠️";
  if (issueType.includes("버스") || issueType.includes("운행")) return "🚌";
  if (issueType.includes("혼잡") || issueType.includes("공간")) return "👥";
  if (issueType.includes("편의시설")) return "🚻";
  if (issueType.includes("소음")) return "🔊";
  return "📌";
}

export default async function Home() {
  const stats = await getStatsData();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      
      {/* 1. 로고 및 브랜딩 (클라이언트 컴포넌트) */}
      <BrandingHeader />

      <div className="w-full max-w-5xl flex flex-col gap-10">
        
        {/* 2. 전체 통계 섹션 */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 누적 접수 통계 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-32 hover:shadow-md transition-shadow">
              <span className="text-gray-500 text-sm font-bold mb-2">누적 접수 민원</span>
              {stats.total > 0 ? (
                <div className="text-gray-900 font-extrabold text-4xl">
                  {stats.total} <span className="text-lg font-medium text-gray-500">건</span>
                </div>
              ) : (
                <div className="text-gray-400 text-sm mt-1">아직 접수된 민원이 없어요.<br/>첫 제보자가 되어보세요!</div>
              )}
            </div>
            
            {/* 해결 완료 통계 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-32 hover:shadow-md transition-shadow">
              <span className="text-gray-500 text-sm font-bold mb-2">해결 완료</span>
              {stats.total > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="text-jnu-green font-extrabold text-4xl flex items-baseline gap-1">
                    {stats.resolved} <span className="text-lg font-medium text-gray-500">건</span>
                  </div>
                  <div className="text-sm font-bold text-gray-400 mt-1">
                    (해결률 {stats.resolvedRate}%)
                  </div>
                </div>
              ) : (
                <div className="text-gray-300 text-3xl font-extrabold mt-1">-</div>
              )}
            </div>
          </div>
        </section>

        {/* 3. 인기 민원 TOP 3 섹션 */}
        {stats.topEmpathy.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🔥 지금 가장 공감받는 민원
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topEmpathy.map((report) => (
                <Link 
                  href={report.type === "bus" ? "/bus" : report.type === "campus" ? "/campus" : "/street"} 
                  key={report.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform" title={report.issueType}>
                      {getIssueIcon(report.issueType)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${report.type === "bus" ? "bg-green-100 text-green-700" : report.type === "campus" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                      {report.type === "bus" ? "버스" : report.type === "campus" ? "캠퍼스" : "길거리"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{report.stopName}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{report.issueType}</p>
                  <div className="font-bold text-pink-500 text-sm flex items-center gap-1">
                    👍 {report.empathyCount}명 공감
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center gap-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">제보 및 조회</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* 4. 기존 메뉴 카드 (서버 컴포넌트로 변경되어 Link 태그 사용) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 버스 정류장 민원 카드 */}
          <Link
            href="/bus"
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-jnu-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-jnu-green/10 text-jnu-green rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <BusFront size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">버스 정류장 민원</h2>
              <p className="text-gray-500 mb-6 font-medium text-sm">
                전남대 주변 버스 정류장의<br />불편사항을 제보해 주세요.
              </p>
              <div className="mt-auto flex flex-row items-center justify-center text-jnu-green font-semibold whitespace-nowrap bg-green-50 px-4 py-2 rounded-full group-hover:bg-green-100 transition">
                바로가기
              </div>
            </div>
          </Link>

          {/* 캠퍼스 건물 민원 카드 */}
          <Link
            href="/campus"
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-jnu-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-jnu-blue/10 text-jnu-blue rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Building2 size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">캠퍼스 건물 민원</h2>
              <p className="text-gray-500 mb-6 font-medium text-sm">
                교내 건물 시설물의 고장이나<br />보수가 필요한 곳을 알려주세요.
              </p>
              <div className="mt-auto flex flex-row items-center justify-center text-jnu-blue font-semibold whitespace-nowrap bg-blue-50 px-4 py-2 rounded-full group-hover:bg-blue-100 transition">
                바로가기
              </div>
            </div>
          </Link>

          {/* 길거리 민원 카드 */}
          <Link
            href="/street"
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <MapPin size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">길거리 민원</h2>
              <p className="text-gray-500 mb-6 font-medium text-sm">
                캠퍼스 밖이나 도로/보도의<br />위험한 시설물 등을 제보해 주세요.
              </p>
              <div className="mt-auto flex flex-row items-center justify-center text-red-600 font-semibold whitespace-nowrap bg-red-50 px-4 py-2 rounded-full group-hover:bg-red-100 transition">
                바로가기
              </div>
            </div>
          </Link>

          {/* 내 제보 조회 카드 */}
          <Link
            href="/my-report"
            className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Search size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">내 제보 내역</h2>
              <p className="text-gray-500 mb-6 font-medium text-sm">
                이 기기에서 제보한 내역이나<br />제보 코드로 처리 현황을 봅니다.
              </p>
              <div className="mt-auto flex flex-row items-center justify-center text-yellow-600 font-semibold whitespace-nowrap bg-yellow-50 px-4 py-2 rounded-full group-hover:bg-yellow-100 transition">
                조회하기
              </div>
            </div>
          </Link>
        </section>

      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        &copy; 2026 늘품 프로젝트. All rights reserved.
      </footer>
    </div>
  );
}
