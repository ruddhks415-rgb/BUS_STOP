import { NextResponse } from "next/server";
import { getKvReports } from "@/lib/kvStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const reports = await getKvReports();
  const report = reports.find((r) => r.reportCode === code.toUpperCase());

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
