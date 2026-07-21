"use client";

import StreetMap from "@/components/StreetMap";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

export default function StreetPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-red-500 text-white p-4 shadow-md flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="text-white p-1 hover:bg-red-600 rounded-full transition mr-1">
            <ArrowLeft size={24} />
          </button>
          <MapPin size={24} />
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">길거리 제보</h1>
        </div>
      </header>
      
      {/* Map Area */}
      <main className="flex-1 relative">
        {/* Guide overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 pointer-events-none">
          <p className="text-sm font-bold text-gray-700">👆 지도를 클릭하여 위치를 선택하세요</p>
        </div>
        <StreetMap />
      </main>
    </div>
  );
}
