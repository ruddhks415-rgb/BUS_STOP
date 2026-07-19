"use client";

import CampusMap from "@/components/CampusMap";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CampusPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.push("/")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">캠퍼스 건물 지도</h1>
      </header>
      
      <main className="flex-1 relative">
        <CampusMap />
      </main>
    </div>
  );
}
