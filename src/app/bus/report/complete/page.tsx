"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompletePage() {
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center max-w-sm w-full text-center border border-gray-100">
        <CheckCircle2 size={72} className="text-green-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">제보가 접수되었습니다</h1>
        <p className="text-gray-600 mb-6 leading-relaxed text-sm">
          소중한 의견 감사드립니다.<br/>더 나은 전남대학교 정류장을<br/>만드는 데 큰 도움이 됩니다.
        </p>

        {reportCode && (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-500 font-bold mb-2">제보 조회용 코드 (내 제보 조회에서 사용)</p>
            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
              <span className="font-mono font-bold text-lg text-gray-800">{reportCode}</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition"
              >
                <Copy size={16} /> 복사
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => router.push("/bus")}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition shadow-md"
        >
          지도로 돌아가기
        </button>
      </div>
    </div>
  );
}
