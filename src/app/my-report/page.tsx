"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getReportByCode, getMyReportCodes, Report } from "@/lib/reportStore";
import { useEffect } from "react";

export default function MyReportPage() {
  const router = useRouter();
  const [reportCode, setReportCode] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [myReports, setMyReports] = useState<Report[]>([]);

  useEffect(() => {
    const codes = getMyReportCodes();
    if (codes.length > 0) {
      // Fetch all reports matching the codes
      Promise.all(codes.map(c => getReportByCode(c))).then(results => {
        setMyReports(results.filter((r): r is Report => r !== null));
      });
    }
  }, []);

  const handleSearchCode = async (code: string) => {
    if (!code.trim()) return;
    setReportCode(code.toUpperCase());
    setLoading(true);
    setSearched(true);
    setTimeout(async () => {
      const found = await getReportByCode(code.trim());
      setReport(found);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchCode(reportCode);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수됨": return "text-red-600 bg-red-50 border-red-200";
      case "검토중": return "text-orange-600 bg-orange-50 border-orange-200";
      case "제출됨": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "해결됨": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.push("/")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">내 제보 조회</h1>
      </header>

      <main className="p-4 flex-1 w-full max-w-md mx-auto mt-6">
        <form onSubmit={handleSearch} className="mb-8 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">제보 코드 (예: JNU-ABCDEF)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reportCode}
              onChange={(e) => setReportCode(e.target.value.toUpperCase())}
              placeholder="코드를 입력하세요"
              className="flex-1 border-2 border-gray-200 rounded-xl p-4 text-gray-800 font-mono font-bold focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-xl font-bold transition shadow-md disabled:opacity-50 flex items-center justify-center"
            >
              <Search size={24} />
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">조회 중입니다...</p>
          </div>
        ) : searched && !report ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">결과를 찾을 수 없습니다</h3>
            <p className="text-gray-500 text-sm">코드를 잘못 입력하셨거나 존재하지 않는 제보입니다.<br/>다시 확인해 주세요.</p>
          </div>
        ) : report ? (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-1">제보 코드</div>
                  <div className="text-lg font-mono font-bold text-gray-900">{report.reportCode}</div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm ${getStatusColor(report.status)}`}>
                  {report.status}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs font-bold text-gray-400">장소</div>
                  <div className="font-medium text-gray-800">{report.stopName}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400">불편 유형</div>
                  <div className="font-medium text-gray-800">{report.issueType}</div>
                </div>
                {report.description && (
                  <div>
                    <div className="text-xs font-bold text-gray-400">상세 내용</div>
                    <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-lg">{report.description}</div>
                  </div>
                )}
                {report.photoUrl && (
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2">첨부 사진</div>
                    <img src={report.photoUrl} alt="첨부된 현장 사진" className="w-full h-auto rounded-xl border border-gray-200" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-gray-400">공감 수</div>
                  <div className="font-bold text-pink-500 flex items-center gap-1">
                    ❤️ {report.empathyCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> 처리 현황
              </h3>
              
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {report.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] w-4 h-4 bg-white border-4 border-yellow-500 rounded-full"></div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm mb-1">{history.status}</span>
                      <span className="text-xs text-gray-400 mb-2">
                        {new Date(history.at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {history.memo && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {history.memo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          myReports.length > 0 && (
            <div className="mt-8">
              <h3 className="text-base font-bold text-gray-800 mb-4 px-1">이 기기에서 제보한 내역</h3>
              <div className="flex flex-col gap-3">
                {myReports.map(mr => (
                  <button 
                    key={mr.id} 
                    onClick={() => handleSearchCode(mr.reportCode)}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-yellow-400 hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-sm font-bold text-gray-500 group-hover:text-yellow-600 transition">{mr.reportCode}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(mr.status)}`}>{mr.status}</span>
                    </div>
                    <div className="font-bold text-gray-800 text-sm mb-1">{mr.stopName}</div>
                    <div className="text-sm text-gray-600 truncate">{mr.issueType}</div>
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
