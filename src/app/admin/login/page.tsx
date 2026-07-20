"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh(); // To trigger middleware re-evaluation
      } else {
        setError("비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-6 mx-auto">
          <Lock className="w-6 h-6 text-gray-700" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">관리자 로그인</h1>
        <p className="text-center text-gray-500 mb-8">관리자 비밀번호를 입력해 주세요.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-jnu-blue focus:border-jnu-blue outline-none transition"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition mt-2"
          >
            로그인
          </button>
        </form>
        
        <button 
          onClick={() => router.push("/")}
          className="mt-6 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 transition w-full text-sm"
        >
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
