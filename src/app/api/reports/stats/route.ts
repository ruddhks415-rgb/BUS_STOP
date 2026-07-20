import { NextResponse } from "next/server";
import { getKvReports } from "@/lib/kvStore";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reports = await getKvReports();
    
    let totalCount = reports.length;
    let resolvedCount = 0;
    
    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    reports.forEach(r => {
      if (r.status === "해결됨") resolvedCount++;
      
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      categoryCounts[r.issueType] = (categoryCounts[r.issueType] || 0) + 1;
    });

    return NextResponse.json({
      totalCount,
      resolvedCount,
      statusCounts,
      categoryCounts
    });
  } catch (error) {
    console.error("GET /api/reports/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
