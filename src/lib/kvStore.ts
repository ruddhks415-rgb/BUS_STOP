import { kv } from "@vercel/kv";
import { Report } from "./reportStore";

const REPORTS_KEY = "busstop_reports";

export async function getKvReports(): Promise<Report[]> {
  try {
    const data = await kv.get<Report[]>(REPORTS_KEY);
    return data || [];
  } catch (error) {
    console.error("KV get error:", error);
    return [];
  }
}

export async function setKvReports(reports: Report[]): Promise<void> {
  try {
    await kv.set(REPORTS_KEY, reports);
  } catch (error) {
    console.error("KV set error:", error);
  }
}
