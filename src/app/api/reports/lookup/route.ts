import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const reports = await sql`SELECT * FROM reports WHERE report_code = ${code}`;

    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const r = reports[0];
    const mapped = {
      id: r.id,
      reportCode: r.report_code,
      type: r.type,
      stopId: r.stop_id,
      stopName: r.stop_name,
      issueType: r.issue_type,
      description: r.description,
      photoUrl: r.photo_url,
      status: r.status,
      statusHistory: r.status_history,
      empathyCount: r.empathy_count,
      isUrgent: r.is_urgent,
      date: r.created_at,
      lat: r.lat,
      lng: r.lng
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/reports/lookup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
