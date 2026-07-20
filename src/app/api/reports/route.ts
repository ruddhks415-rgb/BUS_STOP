import { NextResponse } from "next/server";
import { getKvReports, setKvReports } from "@/lib/kvStore";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let reports = await getKvReports();

  if (type && type !== "all") {
    reports = reports.filter((r) => r.type === type);
  }
  if (status && status !== "all") {
    reports = reports.filter((r) => r.status === status);
  }

  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  try {
    const reportData = await request.json();
    const reports = await getKvReports();

    const id = "r" + (Date.now().toString() + Math.floor(Math.random() * 1000));
    const typeReports = reports.filter((r) => r.type === reportData.type);
    const nextSeq = typeReports.length + 1;
    const prefix = reportData.type === "bus" ? "B" : "C";
    const reportCode = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    const now = new Date();

    const newReport = {
      ...reportData,
      id,
      reportCode,
      date: now.toISOString().split("T")[0],
      status: "접수됨",
      statusHistory: [{ status: "접수됨", at: now.toISOString() }],
      empathyCount: 0,
      isUrgent: false,
    };

    reports.unshift(newReport);
    await setKvReports(reports);

    return NextResponse.json(newReport);
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
