import { NextResponse } from "next/server";
import { getKvReports, setKvReports } from "@/lib/kvStore";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const reports = await getKvReports();
  const { id } = await params;
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const updates = await request.json();
    const reports = await getKvReports();
    const { id } = await params;
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (updates.action === "empathy") {
      reports[index].empathyCount += 1;
      if (reports[index].empathyCount >= 5) {
        reports[index].isUrgent = true;
      }
    } else if (updates.status) {
      reports[index].status = updates.status;
      reports[index].statusHistory.push({
        status: updates.status,
        at: new Date().toISOString(),
        memo: updates.memo,
      });
    }

    await setKvReports(reports);
    return NextResponse.json(reports[index]);
  } catch (error) {
    console.error("PATCH /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
