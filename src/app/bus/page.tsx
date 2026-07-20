"use client";

import KakaoMap from "@/components/KakaoMap";
import { BusFront, ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-jnu-green text-white p-4 shadow-md flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="text-white p-1 hover:bg-jnu-green/80 rounded-full transition mr-1">
            <ArrowLeft size={24} />
          </button>
          <BusFront size={24} />
          <h1 className="text-lg sm:text-xl font-bold tracking-wide">전남대 버스정류장 제보</h1>
        </div>
      </header>

      {/* Map Area */}
      <main className="flex-1 relative">
        <KakaoMap />
      </main>
    </div>
  );
}
