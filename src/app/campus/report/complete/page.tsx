"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CampusReportCompletePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">민원 접수가 완료되었습니다</h2>
        <p className="text-gray-600 mb-8 text-sm">
          보내주신 민원 내용은 담당 부서로 전달되어<br/>신속하게 처리될 예정입니다.<br/>안전한 캠퍼스 조성에 감사드립니다.
        </p>
        <button 
          onClick={() => router.push("/campus")}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-md text-lg"
        >
          캠퍼스 지도로 돌아가기
        </button>
      </div>
    </div>
  );
}
