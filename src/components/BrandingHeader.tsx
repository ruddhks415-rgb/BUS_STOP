"use client";

import Image from "next/image";
import { useState } from "react";

export default function BrandingHeader() {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div className="text-center max-w-lg mb-8 min-h-[120px] flex flex-col items-center justify-center mx-auto">
      <button 
        onClick={() => setShowDesc(!showDesc)}
        className="group focus:outline-none"
      >
        <div className="hover:scale-105 transition-transform duration-300 relative w-72 h-36 sm:w-[28rem] sm:h-56 mb-4 flex items-center justify-center mix-blend-multiply">
          <Image
            src="/neullpum-logo.png"
            alt="늘품 로고"
            fill
            className="object-contain"
            priority
          />
        </div>
      </button>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-500 text-sm leading-relaxed mt-2">
          '앞으로 좋게 발전할 품질이나 품성'을 뜻하는 순우리말.<br />
          더 나은 전남대, 그 변화의 시작이 될 우리의 가능성
        </p>
      </div>
    </div>
  );
}
