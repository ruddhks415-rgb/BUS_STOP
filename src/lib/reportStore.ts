import { Report, REPORTS as INITIAL_REPORTS } from "./mockData";
export type { Report };

const STORAGE_KEY = "bus_stop_reports";

// Initialize store with mock data if empty
export const initializeStore = () => {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  }
};

export const getReports = async (): Promise<Report[]> => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return INITIAL_REPORTS;
};

export const addReport = async (
  reportData: Omit<Report, "id" | "reportCode" | "status" | "statusHistory" | "empathyCount" | "isUrgent" | "date">
): Promise<Report> => {
  const reports = await getReports();
  
  const id = "r" + (Date.now().toString() + Math.floor(Math.random() * 1000));
  
  const typeReports = reports.filter(r => r.type === reportData.type);
  const nextSeq = typeReports.length + 1;
  const prefix = reportData.type === "bus" ? "B" : "C";
  const reportCode = `${prefix}${String(nextSeq).padStart(4, '0')}`;
  
  const now = new Date();
  
  const newReport: Report = {
    ...reportData,
    id,
    reportCode,
    date: now.toISOString().split('T')[0],
    status: "접수됨",
    statusHistory: [{ status: "접수됨", at: now.toISOString() }],
    empathyCount: 0,
    isUrgent: false,
  };
  
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  
  return newReport;
};

export const updateReportStatus = async (
  id: string, 
  newStatus: Report["status"], 
  memo?: string
): Promise<Report | null> => {
  const reports = await getReports();
  const index = reports.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  reports[index].status = newStatus;
  reports[index].statusHistory.push({
    status: newStatus,
    at: new Date().toISOString(),
    memo
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return reports[index];
};

export const addEmpathy = async (id: string): Promise<boolean> => {
  const reports = await getReports();
  const index = reports.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  reports[index].empathyCount += 1;
  if (reports[index].empathyCount >= 5) {
    reports[index].isUrgent = true;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return true;
};

export const getReportByCode = async (code: string): Promise<Report | null> => {
  const reports = await getReports();
  return reports.find(r => r.reportCode === code.toUpperCase()) || null;
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
