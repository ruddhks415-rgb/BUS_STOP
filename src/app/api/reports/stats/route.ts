import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalResult = await sql`SELECT COUNT(*) FROM reports`;
    const resolvedResult = await sql`SELECT COUNT(*) FROM reports WHERE status = '해결됨'`;
    
    const statusResult = await sql`SELECT status, COUNT(*) FROM reports GROUP BY status`;
    const categoryResult = await sql`SELECT issue_type, COUNT(*) FROM reports GROUP BY issue_type`;

    const totalCount = parseInt(totalResult[0].count);
    const resolvedCount = parseInt(resolvedResult[0].count);
    
    const statusCounts: Record<string, number> = {};
    statusResult.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    const categoryCounts: Record<string, number> = {};
    categoryResult.forEach(row => {
      categoryCounts[row.issue_type] = parseInt(row.count);
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
