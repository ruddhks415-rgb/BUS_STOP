import { Report, REPORTS as INITIAL_REPORTS } from "./mockData";
export type { Report };

const STORAGE_KEY = "bus_stop_reports";

// initializeStore is no longer used for Vercel KV

export const getReports = async (type?: string, status?: string): Promise<Report[]> => {
  let url = "/api/reports";
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
};

export const addReport = async (
  reportData: Omit<Report, "id" | "reportCode" | "status" | "statusHistory" | "empathyCount" | "isUrgent" | "date">
): Promise<Report> => {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) throw new Error("Failed to add report");
  return res.json();
};

export const updateReportStatus = async (
  id: string, 
  newStatus: Report["status"], 
  memo?: string
): Promise<Report | null> => {
  const res = await fetch(`/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus, memo }),
  });
  if (!res.ok) return null;
  return res.json();
};

export const addEmpathy = async (id: string): Promise<boolean> => {
  const res = await fetch(`/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "empathy" }),
  });
  return res.ok;
};

export const getReportByCode = async (code: string): Promise<Report | null> => {
  const res = await fetch(`/api/reports/lookup?code=${code}`);
  if (!res.ok) return null;
  return res.json();
};

export const checkDuplicateReport = async (stopId: string, issueType: string): Promise<Report | null> => {
  const reports = await getReports();
  return reports.find(
    r => r.stopId === stopId && 
         r.issueType === issueType && 
         (r.status === "접수됨" || r.status === "검토중" || r.status === "제출됨")
  ) || null;
};

// --- 사용자 기기 내 제보 기록 관리 ---
const MY_REPORTS_KEY = "bus_stop_my_reports";

export const saveMyReportCode = (code: string) => {
  if (typeof window === "undefined") return;
  const existing = getMyReportCodes();
  if (!existing.includes(code)) {
    localStorage.setItem(MY_REPORTS_KEY, JSON.stringify([code, ...existing]));
  }
};

export const getMyReportCodes = (): string[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MY_REPORTS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};
