"use client";

import CampusMap from "@/components/CampusMap";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, ShieldAlert } from "lucide-react";

export default function CampusPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-jnu-blue text-white p-4 shadow-md flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="text-white p-1 hover:bg-jnu-blue/80 rounded-full transition mr-1">
            <ArrowLeft size={24} />
          </button>
          <Building2 size={24} />
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">전남대 캠퍼스 제보</h1>
        </div>
        <a href="/admin" className="flex items-center gap-1 text-sm bg-black/20 px-3 py-1.5 rounded-full hover:bg-black/30 transition">
          <ShieldAlert size={16} />
          <span>관리자</span>
        </a>
      </header>
      
      {/* Map Area */}
      <main className="flex-1 relative">
        <CampusMap />
      </main>
    </div>
  );
}
