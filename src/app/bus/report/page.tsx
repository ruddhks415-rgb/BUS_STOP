"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ISSUE_CATEGORIES, STOPS } from "@/lib/mockData";
import { addReport, checkDuplicateReport, addEmpathy, Report, saveMyReportCode } from "@/lib/reportStore";
import { useState, Suspense } from "react";
import { ArrowLeft, Camera, Upload, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

function ReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stopId = searchParams.get("stop_id") || "";
  const stop = STOPS.find((s) => s.id === stopId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string>("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateReport, setDuplicateReport] = useState<Report | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        alert("jpg, png, webp, heic 이미지 형식만 업로드 가능합니다.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB를 초과할 수 없습니다.");
        return;
      }
      setPhoto(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    if (!stop) return;

    // Check duplicate
    const duplicate = await checkDuplicateReport(stopId, issueType);
    if (duplicate) {
      setDuplicateReport(duplicate);
      return;
    }

    await submitNewReport(issueType);
  };

  const submitNewReport = async (issueType: string) => {
    if (!stop) return;
    setIsSubmitting(true);
    try {
      let photoUrl = undefined;
      
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(photo.name)}`, {
          method: "POST",
          body: photo,
        });
        if (res.ok) {
          const blob = await res.json();
          photoUrl = blob.url;
        } else {
          const errText = await res.text();
          alert("이미지 업로드에 실패했습니다. 에러: " + errText);
        }
      }

      const newReport = await addReport({
        stopId,
        stopName: stop.name,
        issueType,
        description,
        type: "bus",
        photoUrl,
        lat: stop.lat,
        lng: stop.lng
      });
      sessionStorage.setItem("lastReportCode", newReport.reportCode);
      saveMyReportCode(newReport.reportCode);
      router.push("/bus/report/complete");
    } catch (err: any) {
      alert("제보 등록 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmpathyDuplicate = async () => {
    if (!duplicateReport) return;
    await addEmpathy(duplicateReport.id);
    sessionStorage.setItem("lastReportCode", duplicateReport.reportCode);
    saveMyReportCode(duplicateReport.reportCode);
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
        <div className="bg-jnu-green/10 border border-jnu-green/20 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-jnu-green font-semibold mb-1">제보 대상 정류장</p>
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
                      selectedCategory === category.id ? "bg-jnu-green/10 text-jnu-green/80" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.label}</span>
                    {selectedCategory === category.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {selectedCategory === category.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
                      {category.subItems.map((subItem) => (
                         <label key={subItem} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedSubItem === subItem ? "border-jnu-green bg-jnu-green/10" : "border-gray-200 bg-white hover:border-jnu-green/50"}`}>
                           <input
                             type="radio"
                             name="subItem"
                             value={subItem}
                             checked={selectedSubItem === subItem}
                             onChange={(e) => setSelectedSubItem(e.target.value)}
                             className="w-4 h-4 text-jnu-green border-gray-300 focus:ring-jnu-green"
                           />
                           <span className="text-sm font-medium text-gray-700">{subItem}</span>
                         </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedSubItem === "직접 입력" ? "border-jnu-green bg-jnu-green/10" : "border-gray-200 bg-white hover:border-jnu-green/50"}`}>
                         <input
                           type="radio"
                           name="subItem"
                           value="직접 입력"
                           checked={selectedSubItem === "직접 입력"}
                           onChange={(e) => setSelectedSubItem(e.target.value)}
                           className="w-4 h-4 text-jnu-green border-gray-300 focus:ring-jnu-green"
                         />
                         <span className="text-sm font-medium text-gray-700">직접 입력</span>
                      </label>
                      {selectedSubItem === "직접 입력" && (
                        <input
                          type="text"
                          value={customIssue}
                          onChange={(e) => setCustomIssue(e.target.value)}
                          placeholder="불편사항을 직접 입력해 주세요"
                          className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-jnu-green focus:border-jnu-green outline-none"
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
            {!photo ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition hover:border-gray-400 text-gray-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">클릭하여 사진 업로드</p>
                </div>
                <input type="file" accept="image/jpeg, image/png, image/webp, image/heic" className="hidden" onChange={handlePhotoChange} />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-jnu-green/10 border border-green-100 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <Camera className="w-6 h-6 text-jnu-green" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{photo.name}</span>
                </div>
                <button type="button" onClick={removePhoto} className="p-2 text-gray-400 hover:text-red-500 transition">
                  <span className="text-xl leading-none">&times;</span>
                </button>
              </div>
            )}
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">상세 설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-jnu-green focus:border-jnu-green focus:outline-none transition text-gray-800"
              placeholder="예: 정류장 지붕 한쪽이 깨져서 비가 샙니다."
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg w-full ${isSubmitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-jnu-green text-white hover:bg-jnu-green/80"}`}
          >
            {isSubmitting ? (
              <span>업로드 중...</span>
            ) : (
              <>
                <Upload size={22} />
                제보 제출하기
              </>
            )}
          </button>
        </form>
      </main>

      {/* Duplicate Modal */}
      {duplicateReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-gray-900">비슷한 민원이 이미 있습니다!</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              이미 진행 중인 동일한 유형({duplicateReport.issueType})의 민원이 존재합니다.<br/>새로 작성하는 대신 기존 민원에 공감하시겠습니까?
            </p>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-6 text-sm text-gray-700">
              <span className="font-bold text-orange-700">현재 상태:</span> {duplicateReport.status}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleEmpathyDuplicate} className="w-full py-3 rounded-xl text-white bg-jnu-green hover:bg-jnu-green/80 font-bold transition shadow-md">
                네, 기존 민원에 공감할게요 ❤️
              </button>
              <button onClick={() => { setDuplicateReport(null); submitNewReport(selectedSubItem === "직접 입력" ? customIssue : selectedSubItem); }} className="w-full py-3 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 font-bold transition">
                아니오, 따로 제보할게요
              </button>
            </div>
          </div>
        </div>
      )}
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
