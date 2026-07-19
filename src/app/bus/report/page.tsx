"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ISSUE_CATEGORIES, STOPS } from "@/lib/mockData";
import { useState, Suspense } from "react";
import { ArrowLeft, Camera, Upload, ChevronDown, ChevronUp } from "lucide-react";

function ReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stopId = searchParams.get("stop_id") || "";
  const stop = STOPS.find((s) => s.id === stopId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string>("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubItem) {
      alert("불편 유형을 선택해 주세요.");
      return;
    }
    const issueType = selectedSubItem === "직접 입력" ? customIssue : selectedSubItem;
    if (selectedSubItem === "직접 입력" && !customIssue.trim()) {
      alert("불편 유형을 직접 입력해 주세요.");
      return;
    }
    // Mock save
    sessionStorage.setItem("lastReport", JSON.stringify({ stopId, issueType, description }));
    router.push("/bus/report/complete");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.push("/bus")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">불편사항 제보하기</h1>
      </header>

      <main className="p-4 flex-1 w-full max-w-md mx-auto mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-blue-600 font-semibold mb-1">제보 대상 정류장</p>
          <p className="text-2xl font-bold text-gray-900">
            {stop ? stop.name : "알 수 없는 정류장"} <span className="text-base text-gray-500 font-normal">({stopId || "ID 없음"})</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* 불편 유형 */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">어떤 불편함이 있으신가요? <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-3">
              {ISSUE_CATEGORIES.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(selectedCategory === category.id ? null : category.id);
                      if (selectedCategory !== category.id) {
                        setSelectedSubItem(""); // reset sub item when opening new category
                      }
                    }}
                    className={`w-full text-left px-5 py-4 font-bold text-gray-800 transition-colors flex justify-between items-center ${
                      selectedCategory === category.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.label}</span>
                    {selectedCategory === category.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {selectedCategory === category.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
                      {category.subItems.map((subItem) => (
                         <label key={subItem} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedSubItem === subItem ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-white hover:border-blue-300"}`}>
                           <input
                             type="radio"
                             name="subItem"
                             value={subItem}
                             checked={selectedSubItem === subItem}
                             onChange={(e) => setSelectedSubItem(e.target.value)}
                             className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                           />
                           <span className="text-sm font-medium text-gray-700">{subItem}</span>
                         </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedSubItem === "직접 입력" ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-white hover:border-blue-300"}`}>
                         <input
                           type="radio"
                           name="subItem"
                           value="직접 입력"
                           checked={selectedSubItem === "직접 입력"}
                           onChange={(e) => setSelectedSubItem(e.target.value)}
                           className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                         />
                         <span className="text-sm font-medium text-gray-700">직접 입력</span>
                      </label>
                      {selectedSubItem === "직접 입력" && (
                        <input
                          type="text"
                          value={customIssue}
                          onChange={(e) => setCustomIssue(e.target.value)}
                          placeholder="불편사항을 직접 입력해 주세요"
                          className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 사진 첨부 (UI) */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">사진 첨부 (선택)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-white text-gray-400 cursor-pointer hover:bg-gray-50 transition hover:border-gray-400">
              <Camera size={36} className="mb-3 text-gray-400" />
              <p className="text-sm font-medium">클릭하여 사진 업로드</p>
              <p className="text-xs text-gray-400 mt-1">(더미 기능입니다)</p>
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">상세 설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-gray-800"
              placeholder="예: 정류장 지붕 한쪽이 깨져서 비가 샙니다."
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg w-full"
          >
            <Upload size={22} />
            제보 제출하기
          </button>
        </form>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ReportForm />
    </Suspense>
  );
}
