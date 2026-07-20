import { NextResponse } from "next/server";
import { getStatsData } from "@/lib/stats";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60초 캐싱 (옵션)

export async function GET() {
  try {
    const statsData = await getStatsData();
    return NextResponse.json(statsData);
  } catch (error) {
    console.error("GET /api/reports/stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
