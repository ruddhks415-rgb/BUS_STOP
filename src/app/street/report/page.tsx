"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { addReport, checkDuplicateReport, addEmpathy, Report, saveMyReportCode } from "@/lib/reportStore";
import { ArrowLeft, Camera, Upload, ChevronDown, ChevronUp, X, Image as ImageIcon, AlertCircle } from "lucide-react";

const STREET_ISSUE_CATEGORIES = [
  {
    id: "도로/보도 파손",
    title: "도로/보도 파손",
    subcategories: ["보도블럭 깨짐", "포트홀", "싱크홀"]
  },
  {
    id: "가로등/조명 고장",
    title: "가로등/조명 고장",
    subcategories: ["가로등 꺼짐", "깜빡임"]
  },
  {
    id: "쓰레기/무단투기",
    title: "쓰레기/무단투기",
    subcategories: ["쓰레기 방치", "불법 투기", "담배꽁초"]
  },
  {
    id: "방치된 시설물",
    title: "방치된 시설물",
    subcategories: ["방치 자전거", "고장난 벤치/펜스"]
  },
  {
    id: "조경/가로수 문제",
    title: "조경/가로수 문제",
    subcategories: ["나무 쓰러짐", "가지치기 필요", "잡초 방치"]
  },
  {
    id: "불법 주정차",
    title: "불법 주정차",
    subcategories: ["인도 점거", "소방로 막힘"]
  },
  {
    id: "안전 위험",
    title: "안전 위험",
    subcategories: ["어두운 골목", "CCTV 사각지대", "낙하물 위험"]
  },
  {
    id: "유기동물/기타",
    title: "유기동물/기타",
    subcategories: ["유기묘·유기견", "기타 민원"]
  }
];

function StreetReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const addressParam = searchParams.get("address") || "알 수 없는 위치";
  
  const lat = latParam ? parseFloat(latParam) : 0;
  const lng = lngParam ? parseFloat(lngParam) : 0;

  const [mainCategory, setMainCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateReport, setDuplicateReport] = useState<Report | null>(null);

  if (!latParam || !lngParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <p className="text-gray-500 mb-4">위치 정보가 없습니다. 지도에서 위치를 선택해주세요.</p>
        <button onClick={() => router.push("/street")} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">
          길거리 지도로 돌아가기
        </button>
      </div>
    );
  }

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
    
    // Check duplicate using a constructed stopId based on lat/lng or address
    // We'll use address as a pseudo-stopId for grouping
    const duplicate = await checkDuplicateReport(addressParam, issueType);
    if (duplicate) {
      setDuplicateReport(duplicate);
      return;
    }

    await submitNewReport(issueType);
  };

  const submitNewReport = async (issueType: string) => {
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

      // Generate a unique stopId for street reports since there's no fixed ID
      const newStopId = `street_${Date.now()}`;

      const newReport = await addReport({
        stopId: newStopId, // Random/Time-based ID for street
        stopName: addressParam,
        issueType,
        description,
        type: "street",
        photoUrl,
        lat: lat,
        lng: lng
      });
      sessionStorage.setItem("lastReportCode", newReport.reportCode);
      saveMyReportCode(newReport.reportCode);
      router.push("/street/report/complete");
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
    router.push("/street/report/complete");
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
        <button onClick={() => router.push("/street")} className="text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">길거리 민원 제보</h1>
      </header>

      <main className="p-4 flex-1 w-full max-w-md mx-auto mt-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-red-600 font-semibold mb-1">선택한 제보 위치</p>
          <p className="text-xl font-bold text-gray-900 break-words">
            {addressParam}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">어떤 문제가 있나요? <span className="text-red-500">*</span></label>
            <div className="flex flex-col gap-3">
              {STREET_ISSUE_CATEGORIES.map((category) => (
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
                      mainCategory === category.id ? "bg-red-50 text-red-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.title}</span>
                    {mainCategory === category.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {mainCategory === category.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2">
                      {category.subcategories.map((sub) => (
                         <label key={sub} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${subCategory === sub ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"}`}>
                           <input
                             type="radio"
                             name="subCategory"
                             value={sub}
                             checked={subCategory === sub}
                             onChange={(e) => setSubCategory(e.target.value)}
                             className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                           />
                           <span className="text-sm font-medium text-gray-700">{sub}</span>
                         </label>
                      ))}
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${subCategory === "기타 (직접 입력)" ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"}`}>
                         <input
                           type="radio"
                           name="subCategory"
                           value="기타 (직접 입력)"
                           checked={subCategory === "기타 (직접 입력)"}
                           onChange={(e) => setSubCategory(e.target.value)}
                           className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                         />
                         <span className="text-sm font-medium text-gray-700">기타 (직접 입력)</span>
                      </label>
                      {subCategory === "기타 (직접 입력)" && (
                        <input
                          type="text"
                          value={customIssue}
                          onChange={(e) => setCustomIssue(e.target.value)}
                          placeholder="불편사항을 직접 입력해 주세요"
                          className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-red-100 rounded-lg shrink-0">
                    <ImageIcon className="w-6 h-6 text-red-600" />
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
              className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition text-gray-800 bg-white"
              placeholder="문제가 발생한 정확한 위치나 상세 상황을 적어주세요."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg w-full ${isSubmitting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"}`}
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
              <button onClick={handleEmpathyDuplicate} className="w-full py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 font-bold transition shadow-md">
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

export default function StreetReportPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <StreetReportForm />
    </Suspense>
  );
}
