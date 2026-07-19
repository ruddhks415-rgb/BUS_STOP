"use client";

import { useState } from "react";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { REPORTS } from "@/lib/mockData";

export default function AdminReportPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [isFiltered, setIsFiltered] = useState(false);

  const handleFilter = () => {
    // Mock filter logic
    setIsFiltered(true);
  };

  const handleDownload = () => {
    alert("PDF 다운로드 기능은 준비 중입니다.");
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
              <h2 className="text-lg font-bold text-gray-800">조회 결과 미리보기</h2>
              <button 
                onClick={handleDownload}
                className="bg-blue-600 w-full sm:w-auto text-white text-sm font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={18} />
                PDF 다운로드
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-700 mb-2 text-lg">선택하신 기간 동안 총 <span className="font-extrabold text-blue-600 text-2xl mx-1">{REPORTS.length}건</span>의 제보가 접수되었습니다.</p>
              <p className="text-sm text-gray-500 mt-2">실제 다운로드 시 정류장별/유형별 상세 내역과 이미지가 포함된 A4 형태의 문서가 생성됩니다.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
