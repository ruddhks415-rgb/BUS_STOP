"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export default function StreetReportCompletePage() {
  const router = useRouter();
  const [reportCode, setReportCode] = useState<string>("");

  useEffect(() => {
    const code = sessionStorage.getItem("lastReportCode");
    if (code) {
      setReportCode(code);
    }
  }, []);

  const handleCopy = () => {
    if (reportCode) {
      navigator.clipboard.writeText(reportCode);
      alert("제보 코드가 복사되었습니다!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">민원 접수가 완료되었습니다</h2>
        <p className="text-gray-600 mb-6 text-sm">
          보내주신 민원 내용은 담당 부서로 전달되어<br/>신속하게 처리될 예정입니다.<br/>깨끗한 길거리를 만들어 주셔서 감사합니다.
        </p>

        {reportCode && (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-500 font-bold mb-2">제보 조회용 코드 (내 제보 조회에서 사용)</p>
            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
              <span className="font-mono font-bold text-lg text-gray-800">{reportCode}</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded-md transition"
              >
                <Copy size={16} /> 복사
              </button>
            </div>
          </div>
        )}
        <button 
          onClick={() => router.push("/street")}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition shadow-md text-lg"
        >
          길거리 지도로 돌아가기
        </button>
      </div>
    </div>
  );
}
