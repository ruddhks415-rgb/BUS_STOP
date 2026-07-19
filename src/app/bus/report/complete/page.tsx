"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompletePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center max-w-sm w-full text-center border border-gray-100">
        <CheckCircle2 size={72} className="text-green-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">제보가 접수되었습니다</h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-sm">
          소중한 의견 감사드립니다.<br/>더 나은 전남대학교 정류장을<br/>만드는 데 큰 도움이 됩니다.
        </p>
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
