"use client";

import { useState, useEffect } from "react";
import { REPORTS, STOPS } from "@/lib/mockData";
import { BUILDINGS, CAMPUS_REPORTS } from "@/lib/campusMockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Lock, LogOut, FileText, ArrowLeft, BusFront, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"bus" | "campus">("bus");

  useEffect(() => {
    setIsClient(true);
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      sessionStorage.setItem("adminAuth", "true");
      setIsLoggedIn(true);
    } else {
      alert("비밀번호가 틀렸습니다. (힌트: 1234)");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsLoggedIn(false);
  };

  if (!isClient) return null;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">관리자 로그인</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                placeholder="비밀번호 입력 (1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md">
              로그인
            </button>
          </form>
          <button onClick={() => router.push("/")} className="mt-4 w-full text-center text-gray-500 text-sm hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 데이터 집계
  const reportsByLocation = activeTab === "bus"
    ? STOPS.map((stop) => ({
        name: stop.name,
        count: REPORTS.filter((r) => r.stopId === stop.id).length,
      })).filter(s => s.count > 0)
    : BUILDINGS.map((building) => ({
        name: building.name,
        count: CAMPUS_REPORTS.filter((r) => r.buildingId === building.id).length,
      })).filter(s => s.count > 0);

  const reportsByTypeMap: Record<string, number> = {};
  if (activeTab === "bus") {
    REPORTS.forEach(r => {
      reportsByTypeMap[r.issueType] = (reportsByTypeMap[r.issueType] || 0) + 1;
    });
  } else {
    CAMPUS_REPORTS.forEach(r => {
      reportsByTypeMap[r.mainCategory] = (reportsByTypeMap[r.mainCategory] || 0) + 1;
    });
  }
  
  const reportsByType = Object.entries(reportsByTypeMap).map(([name, value]) => ({
    name, value
  }));

  const displayReports = activeTab === "bus" ? REPORTS : CAMPUS_REPORTS;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/admin/report")} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-semibold shadow-sm">
            <FileText size={16} />
            <span>리포트 생성</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition font-medium">
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("bus")}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-lg transition border-b-4 \${
              activeTab === "bus" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <BusFront size={20} /> 버스 정류장 민원
          </button>
          <button
            onClick={() => setActiveTab("campus")}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-lg transition border-b-4 \${
              activeTab === "campus" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Building2 size={20} /> 캠퍼스 건물 민원
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{activeTab === "bus" ? "정류장별" : "건물별"} 제보 건수</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsByLocation}>
                  <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill={activeTab === "bus" ? "#2563eb" : "#4f46e5"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">불편 유형별 비율</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportsByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {reportsByType.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {reportsByType.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value}건)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Row */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">최근 제보 목록</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">날짜</th>
                  <th className="px-4 py-3">{activeTab === "bus" ? "정류장" : "건물명"}</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3 min-w-[200px]">상세 내용</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {displayReports.map((report: any) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{report.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{activeTab === "bus" ? report.stopName : report.buildingName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold">{activeTab === "bus" ? report.issueType : report.mainCategory}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{report.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold \${
                        report.status === "접수완료" ? "bg-red-100 text-red-700" :
                        report.status === "처리중" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
