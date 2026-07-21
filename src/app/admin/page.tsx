"use client";

import { useState, useEffect } from "react";
import { getReports, updateReportStatus, Report } from "@/lib/reportStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LogOut, FileText, ArrowLeft, Flame, Filter, ArrowUpDown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AIReportEditor, { AIReport, AIReportContent } from "@/components/AIReportEditor";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_OPTIONS: Report["status"][] = ["접수됨", "검토중", "제출됨", "해결됨", "반려"];

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Sorting
  const [typeFilter, setTypeFilter] = useState<"all" | "bus" | "campus">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Report["status"]>("all");
  const [sortBy, setSortBy] = useState<"latest" | "empathy">("latest");
  
  // Status Modal
  const [statusModal, setStatusModal] = useState<{ id: string; status: Report["status"]; memo: string } | null>(null);

  // AI Reports State
  const [aiReports, setAiReports] = useState<AIReport[]>([]);
  const [activeAIReport, setActiveAIReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const data = await getReports();
    setReports(data);
    
    // Fetch AI reports
    try {
      const res = await fetch("/api/ai/reports");
      if (res.ok) {
        const aiData = await res.json();
        setAiReports(aiData);
      }
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const handleGenerateAIReport = async (targetReports: Report[], type: "single" | "comprehensive") => {
    setIsGenerating(true);
    try {
      // 1. Generate content via Gemini
      const genRes = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports: targetReports, type })
      });
      if (!genRes.ok) {
        throw new Error("AI 리포트 생성에 실패했습니다. (API Key 설정을 확인하세요)");
      }
      const { result } = await genRes.json();

      // 2. Save to DB
      const saveRes = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          targetReportIds: targetReports.map(r => r.id),
          aiGeneratedContent: result
        })
      });
      if (!saveRes.ok) throw new Error("AI 리포트 저장에 실패했습니다.");
      
      const newAiReport = await saveRes.json();
      setAiReports([newAiReport, ...aiReports]);
      setActiveAIReport(newAiReport);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAIReport = async (id: string, newContent: AIReportContent) => {
    try {
      const res = await fetch(`/api/ai/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedContent: newContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setAiReports(aiReports.map(r => r.id === id ? updated : r));
        setActiveAIReport(updated);
      }
    } catch (e) {
      alert("리포트 저장에 실패했습니다.");
    }
  };

  const openAIReport = (reportId: string) => {
    const existing = aiReports.find(ar => ar.type === "single" && ar.targetReportIds.includes(reportId));
    if (existing) {
      setActiveAIReport(existing);
    } else {
      const target = reports.find(r => r.id === reportId);
      if (target) handleGenerateAIReport([target], "single");
    }
  };

  const handleLogout = async () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  const confirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModal) return;
    
    await updateReportStatus(statusModal.id, statusModal.status, statusModal.memo);
    setStatusModal(null);
    loadReports(); // Reload data
  };

  if (loading) return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>;

  const filteredReports = reports.filter(r => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "empathy") return b.empathyCount - a.empathyCount;
    // latest
    return new Date(b.statusHistory[b.statusHistory.length - 1].at).getTime() - new Date(a.statusHistory[a.statusHistory.length - 1].at).getTime();
  });

  const locationCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  
  filteredReports.forEach(r => {
    locationCounts[r.stopName] = (locationCounts[r.stopName] || 0) + 1;
    typeCounts[r.issueType] = (typeCounts[r.issueType] || 0) + 1;
  });

  const reportsByLocation = Object.entries(locationCounts).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count).slice(0, 10);
  const reportsByType = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">통합 관리자 대시보드</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/admin/export")} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-semibold shadow-sm">
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
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="border-gray-300 rounded-lg text-sm p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">전체 민원</option>
              <option value="bus">버스 정류장 민원</option>
              <option value="campus">캠퍼스 건물 민원</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border-gray-300 rounded-lg text-sm p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">모든 상태</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown size={18} className="text-gray-500" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border-gray-300 rounded-lg text-sm p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="latest">최신 업데이트순</option>
              <option value="empathy">공감 많은순</option>
            </select>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">장소별 민원 건수 (Top 10)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsByLocation}>
                  <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">불편 유형별 비율</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportsByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {reportsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">신고 목록 ({filteredReports.length}건)</h2>
            {filteredReports.length >= 2 && (
              <button 
                onClick={() => handleGenerateAIReport(filteredReports, "comprehensive")}
                disabled={isGenerating}
                className="flex items-center gap-1 text-sm bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-100 transition font-semibold shadow-sm"
              >
                <Sparkles size={16} />
                <span>{isGenerating ? "생성 중..." : "✨ 종합 리포트 생성"}</span>
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">코드</th>
                  <th className="px-4 py-3">분류</th>
                  <th className="px-4 py-3">대상</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3 min-w-[200px]">상세 내용</th>
                  <th className="px-4 py-3 text-center">사진</th>
                  <th className="px-4 py-3">공감</th>
                  <th className="px-4 py-3 text-center">AI 리포트</th>
                  <th className="px-4 py-3">상태 변경</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-gray-500 font-semibold">{report.reportCode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${report.type === "bus" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {report.type === "bus" ? "버스" : "캠퍼스"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{report.stopName}</td>
                    <td className="px-4 py-3 text-gray-700">{report.issueType}</td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{report.description}</td>
                    <td className="px-4 py-3 text-center">
                      {report.photoUrl ? (
                        <a href={report.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold text-xs">
                          사진 보기
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        {report.empathyCount > 0 && <span>{report.empathyCount}</span>}
                        {report.empathyCount >= 5 && <Flame size={16} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => openAIReport(report.id)}
                        disabled={isGenerating}
                        className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded-lg text-xs transition border border-purple-200"
                      >
                        {aiReports.find(ar => ar.type === "single" && ar.targetReportIds.includes(report.id)) ? "리포트 보기" : "✨ 생성"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={report.status} 
                        onChange={(e) => setStatusModal({ id: report.id, status: e.target.value as Report["status"], memo: "" })}
                        className={`text-xs font-bold rounded-lg border-2 outline-none cursor-pointer p-1.5 w-full max-w-[100px] ${
                          report.status === "접수됨" ? "border-red-200 text-red-700 bg-red-50" :
                          report.status === "검토중" ? "border-orange-200 text-orange-700 bg-orange-50" :
                          report.status === "제출됨" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                          report.status === "해결됨" ? "border-green-200 text-green-700 bg-green-50" :
                          "border-gray-200 text-gray-700 bg-gray-50"
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">조건에 맞는 민원이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={confirmStatusChange} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">상태 변경: {statusModal.status}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">상태 변경 사유 (메모)</label>
              <textarea
                value={statusModal.memo}
                onChange={(e) => setStatusModal({...statusModal, memo: e.target.value})}
                placeholder="선택사항입니다."
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setStatusModal(null)} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition">
                취소
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium transition">
                변경 확인
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Report Editor Modal */}
      {activeAIReport && (
        <AIReportEditor
          report={activeAIReport}
          onSave={handleSaveAIReport}
          onClose={() => setActiveAIReport(null)}
        />
      )}
    </div>
  );
}
