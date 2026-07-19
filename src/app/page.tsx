"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BusFront, Building2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* 로고 및 브랜딩 */}
      <div className="text-center max-w-lg mb-12 min-h-[120px] flex flex-col items-center justify-center">
        <button 
          onClick={() => setShowDesc(!showDesc)}
          className="group focus:outline-none"
        >
          <h1 
            className="font-extrabold text-black tracking-tight mb-4 hover:scale-105 transition-transform duration-300"
            style={{ fontSize: "3.5rem" }}
          >
            늘품
          </h1>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden \${showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <p className="text-gray-500 text-sm leading-relaxed mt-2">
            '앞으로 좋게 발전할 품질이나 품성'을 뜻하는 순우리말.<br />
            전남대가 가진 잠재력을 이끌어내어 더 나은 방향으로 성장시키겠습니다.
          </p>
        </div>
      </div>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* 버스 정류장 민원 카드 */}
        <button
          onClick={() => router.push("/bus")}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <BusFront size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">버스 정류장 민원</h2>
            <p className="text-gray-500 mb-6 font-medium">
              전남대 주변 버스 정류장의<br />불편사항을 제보해 주세요.
            </p>
            <div className="flex flex-row items-center justify-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all whitespace-nowrap">
              <span>바로가기</span> <ArrowRight size={20} className="relative -top-0.5" />
            </div>
          </div>
        </button>

        {/* 캠퍼스 건물 민원 카드 */}
        <button
          onClick={() => router.push("/campus")}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
              <Building2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">캠퍼스 건물 민원</h2>
            <p className="text-gray-500 mb-6 font-medium">
              교내 건물 시설물의 고장이나<br />보수가 필요한 곳을 알려주세요.
            </p>
            <div className="flex flex-row items-center justify-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all whitespace-nowrap">
              <span>바로가기</span> <ArrowRight size={20} className="relative -top-0.5" />
            </div>
          </div>
        </button>
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        &copy; 2026 늘품 프로젝트. All rights reserved.
      </footer>
    </div>
  );
}
