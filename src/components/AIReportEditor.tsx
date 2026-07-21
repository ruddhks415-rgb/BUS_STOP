"use client";

import { useState } from "react";
import { Edit2, Save, RotateCcw, Copy, Download, Eye } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type AIReportContent = {
  title: string;
  location: string;
  date_category: string;
  summary: string;
  empathy_comment: string;
  request_action: string;
};

export type AIReport = {
  id: string;
  type: "single" | "comprehensive";
  targetReportIds: string[];
  aiGeneratedContent: AIReportContent;
  editedContent: AIReportContent;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
};

interface AIReportEditorProps {
  report: AIReport;
  onSave: (id: string, newContent: AIReportContent) => void;
  onClose: () => void;
}

export default function AIReportEditor({ report, onSave, onClose }: AIReportEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<"edited" | "original">(report.isEdited ? "edited" : "original");
  
  // Current editing state
  const [editedForm, setEditedForm] = useState<AIReportContent>(report.editedContent);

  const displayContent = isEditMode ? editedForm : (viewMode === "original" ? report.aiGeneratedContent : report.editedContent);

  const handleSave = () => {
    onSave(report.id, editedForm);
    setIsEditMode(false);
    setViewMode("edited");
  };

  const handleRevert = () => {
    setEditedForm(report.aiGeneratedContent);
  };

  const handleCopy = () => {
    const text = `
[민원 리포트]
제목: ${displayContent.title}
위치: ${displayContent.location}
접수일/카테고리: ${displayContent.date_category}

요약: 
${displayContent.summary}

심각도 및 공감: 
${displayContent.empathy_comment}

요청 사항: 
${displayContent.request_action}
    `.trim();
    navigator.clipboard.writeText(text);
    alert("클립보드에 복사되었습니다.");
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("report-pdf-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report_${report.id}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              {report.type === "comprehensive" ? "📊 종합 민원 리포트" : "📄 개별 민원 리포트"}
            </h2>
            {report.isEdited && (
              <div className="flex bg-white rounded-lg border p-1 shadow-sm text-sm font-semibold">
                <button 
                  onClick={() => { setViewMode("original"); setIsEditMode(false); }}
                  className={`px-3 py-1 rounded-md transition ${viewMode === "original" ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  AI 원본
                </button>
                <button 
                  onClick={() => { setViewMode("edited"); setIsEditMode(false); }}
                  className={`px-3 py-1 rounded-md transition ${viewMode === "edited" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  최종 수정본
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-xl px-2">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1" id="report-pdf-content">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
              {isEditMode ? (
                <input type="text" value={editedForm.title} onChange={e => setEditedForm({...editedForm, title: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold" />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg font-bold text-gray-900 border border-transparent">{displayContent.title}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">발생 위치</label>
                {isEditMode ? (
                  <input type="text" value={editedForm.location} onChange={e => setEditedForm({...editedForm, location: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-800 border border-transparent">{displayContent.location}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">접수일 / 카테고리</label>
                {isEditMode ? (
                  <input type="text" value={editedForm.date_category} onChange={e => setEditedForm({...editedForm, date_category: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-800 border border-transparent">{displayContent.date_category}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">문제 요약</label>
              {isEditMode ? (
                <textarea rows={4} value={editedForm.summary} onChange={e => setEditedForm({...editedForm, summary: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed border border-transparent">{displayContent.summary}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">심각도 및 공감 코멘트</label>
              {isEditMode ? (
                <textarea rows={2} value={editedForm.empathy_comment} onChange={e => setEditedForm({...editedForm, empathy_comment: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed border border-transparent">{displayContent.empathy_comment}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">처리 요청 사항</label>
              {isEditMode ? (
                <textarea rows={3} value={editedForm.request_action} onChange={e => setEditedForm({...editedForm, request_action: e.target.value})} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
              ) : (
                <div className="p-3 bg-blue-50/50 rounded-lg text-gray-900 font-medium whitespace-pre-wrap leading-relaxed border border-blue-100">{displayContent.request_action}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t bg-gray-50 flex justify-between items-center rounded-b-2xl">
          <div className="flex gap-2">
            {!isEditMode ? (
              <>
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition shadow-sm">
                  <Copy size={18} /> 복사
                </button>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700 transition shadow-sm">
                  <Download size={18} /> PDF 다운로드
                </button>
              </>
            ) : (
              <button onClick={handleRevert} className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition shadow-sm">
                <RotateCcw size={18} /> 초기화 (원본으로)
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!isEditMode ? (
              <button onClick={() => { setViewMode("edited"); setIsEditMode(true); }} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition shadow-sm">
                <Edit2 size={18} /> 내용 수정하기
              </button>
            ) : (
              <>
                <button onClick={() => { setIsEditMode(false); setEditedForm(report.editedContent); }} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition">
                  취소
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition shadow-sm">
                  <Save size={18} /> 저장하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
