"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getReports, Report } from "@/lib/reportStore";
import ReportCharts from "@/components/ReportCharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function AdminReportPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [reports, setReports] = useState<Report[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    // Load all reports initially to filter them later
    getReports().then(data => setReports(data));
  }, []);

  const handleFilter = () => {
    setIsFiltered(true);
  };

  const handleDownload = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(input, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#F9FAFB" // gray-50
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("busstop_admin_report.pdf");
    } catch (error) {
      console.error("PDF 생성 중 오류 발생:", error);
      alert("PDF 리포트를 생성하는 데 실패했습니다.");
    } finally {
      setIsDownloading(true);
      setTimeout(() => setIsDownloading(false), 500); // Visual feedback delay
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">리포트 생성</h1>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-6 mt-4">
        
        {/* Filter Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">기간 설정</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">시작일</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1">종료일</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={handleFilter}
              className="w-full sm:w-auto bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Search size={18} />
              조회하기
            </button>
          </div>
        </div>

        {/* Result Preview Card */}
        {isFiltered && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-gray-800">통계 대시보드 미리보기</h2>
              <button 
                onClick={handleDownload}
                disabled={isDownloading || reports.length === 0}
                className="bg-blue-600 w-full sm:w-auto text-white text-sm font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isDownloading ? "PDF 생성 중..." : "PDF 다운로드"}
              </button>
            </div>
            
            {/* 캡처 대상 영역 */}
            <div id="pdf-content" className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-gray-800 mb-2">전남대 민원 통계 리포트</h1>
                <p className="text-gray-500 font-medium">조회 기간: {startDate} ~ {endDate}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center mb-8 shadow-sm">
                <p className="text-gray-700 text-lg">해당 기간 동안 누적된 총 민원 건수는 <span className="font-extrabold text-blue-600 text-3xl mx-1">{reports.length}건</span>입니다.</p>
              </div>

              <ReportCharts reports={reports} />
              
              <div className="mt-12 text-center text-sm text-gray-400">
                <p>본 문서는 늘품 프로젝트 시스템에서 자동 생성되었습니다.</p>
                <p>생성 일시: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
