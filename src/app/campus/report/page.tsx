"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { BUILDINGS, BUILDING_ISSUE_CATEGORIES } from "@/lib/campusMockData";
import { addReport, checkDuplicateReport, addEmpathy, Report, saveMyReportCode } from "@/lib/reportStore";
import { ArrowLeft, Camera, Upload, ChevronDown, ChevronUp, X, Image as ImageIcon, AlertCircle } from "lucide-react";

function CampusReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const buildingId = searchParams.get("building_id") || "";
  const building = BUILDINGS.find((b) => b.id === buildingId);

  const [mainCategory, setMainCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!building) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <p className="text-gray-500 mb-4">잘못된 접근입니다. 건물을 먼저 선택해주세요.</p>
        <button onClick={() => router.push("/campus")} className="px-4 py-2 bg-jnu-blue text-white rounded-lg font-medium hover:bg-jnu-blue/80">
          캠퍼스 지도로 돌아가기
        </button>
      </div>
    );
  }

  const [duplicateReport, setDuplicateReport] = useState<Report | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCategory || !subCategory) {
      alert("불편 유형을 선택해 주세요.");
      return;
    }
    const issueType = subCategory === "기타 (직접 입력)" ? customIssue : subCategory;
    if (subCategory === "기타 (직접 입력)" && !customIssue.trim()) {
      alert("불편 유형을 직접 입력해 주세요.");
      return;
    }
    
    if (!building) return;

    // Check duplicate
    const duplicate = await checkDuplicateReport(buildingId, issueType);
    if (duplicate) {
      setDuplicateReport(duplicate);
      return;
    }

    await submitNewReport(issueType);
  };

  const submitNewReport = async (issueType: string) => {
    if (!building) return;
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
          alert("이미지 업로드에 실패했습니다. 이미지가 제외된 채로 제보됩니다.");
        }
      }

      const newReport = await addReport({
        stopId: buildingId,
        stopName: building.name,
        issueType,
        description,
        type: "campus",
        photoUrl,
        lat: building.lat,
        lng: building.lng
      });
      sessionStorage.setItem("lastReportCode", newReport.reportCode);
      saveMyReportCode(newReport.reportCode);
      router.push("/campus/report/complete");
    } catch (err) {
      alert("제보 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmpathyDuplicate = async () => {
    if (!duplicateReport) return;
    await addEmpathy(duplicateReport.id);
    sessionStorage.setItem("lastReportCode", duplicateReport.reportCode);
    saveMyReportCode(duplicateReport.reportCode);
    router.push("/campus/report/complete");
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.push("/campus")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">캠퍼스 건물 민원 제보</h1>
      </header>

      <main className="p-4 flex-1 w-full max-w-md mx-auto mt-4">
        <div className="bg-jnu-blue/10 border border-jnu-blue/20 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-jnu-blue font-semibold mb-1">제보 대상 건물</p>
          <p className="text-2xl font-bold text-gray-900">
            {building.name} <span className="text-base text-gray-500 font-normal">({buildingId})</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">어떤 불편함이 있으신가요? <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-3">
              {BUILDING_ISSUE_CATEGORIES.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategory(mainCategory === category.id ? "" : category.id);
                      if (mainCategory !== category.id) {
                        setSubCategory("");
                      }
                    }}
                    className={`w-full text-left px-5 py-4 font-bold text-gray-800 transition-colors flex justify-between items-center ${
                      mainCategory === category.id ? "bg-jnu-blue/10 text-jnu-blue/80" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.title}</span>
                    {mainCategory === category.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {mainCategory === category.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
                      {category.subcategories.map((sub) => (
                         <label key={sub} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${subCategory === sub ? "border-jnu-blue bg-jnu-blue/10" : "border-gray-200 bg-white hover:border-jnu-blue/50"}`}>
                           <input
                             type="radio"
                             name="subCategory"
                             value={sub}
                             checked={subCategory === sub}
                             onChange={(e) => setSubCategory(e.target.value)}
                             className="w-4 h-4 text-jnu-blue border-gray-300 focus:ring-jnu-blue"
                           />
                           <span className="text-sm font-medium text-gray-700">{sub}</span>
                         </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${subCategory === "기타 (직접 입력)" ? "border-jnu-blue bg-jnu-blue/10" : "border-gray-200 bg-white hover:border-jnu-blue/50"}`}>
                         <input
                           type="radio"
                           name="subCategory"
                           value="기타 (직접 입력)"
                           checked={subCategory === "기타 (직접 입력)"}
                           onChange={(e) => setSubCategory(e.target.value)}
                           className="w-4 h-4 text-jnu-blue border-gray-300 focus:ring-jnu-blue"
                         />
                         <span className="text-sm font-medium text-gray-700">기타 (직접 입력)</span>
                      </label>
                      {subCategory === "기타 (직접 입력)" && (
                        <input
                          type="text"
                          value={customIssue}
                          onChange={(e) => setCustomIssue(e.target.value)}
                          placeholder="불편사항을 직접 입력해 주세요"
                          className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-jnu-blue focus:border-jnu-blue outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">현장 사진 첨부 (선택)</label>
            {!photo ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition hover:border-gray-400 text-gray-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">클릭하여 사진 업로드</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-jnu-blue/10 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <ImageIcon className="w-6 h-6 text-jnu-blue" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{photo.name}</span>
                </div>
                <button type="button" onClick={removePhoto} className="p-2 text-gray-400 hover:text-red-500 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">상세 설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-jnu-blue focus:border-jnu-blue focus:outline-none transition text-gray-800 bg-white"
              placeholder="발생한 문제의 구체적인 위치(예: 3층 남자화장실 등)와 상황을 적어주세요."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg w-full ${isSubmitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-jnu-blue text-white hover:bg-jnu-blue/80"}`}
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
              <button onClick={handleEmpathyDuplicate} className="w-full py-3 rounded-xl text-white bg-jnu-blue hover:bg-jnu-blue/80 font-bold transition shadow-md">
                네, 기존 민원에 공감할게요 ❤️
              </button>
              <button onClick={() => { setDuplicateReport(null); submitNewReport(subCategory === "기타 (직접 입력)" ? customIssue : subCategory); }} className="w-full py-3 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 font-bold transition">
                아니오, 따로 제보할게요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampusReportPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CampusReportForm />
    </Suspense>
  );
}
