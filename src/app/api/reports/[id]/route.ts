import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reports = await sql`SELECT * FROM reports WHERE id = ${id}`;

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
    console.error("GET /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    const reports = await sql`SELECT * FROM reports WHERE id = ${id}`;
    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const targetReport = reports[0];

    if (updateData.action === "empathy") {
      await sql`UPDATE reports SET empathy_count = empathy_count + 1 WHERE id = ${id}`;
      return NextResponse.json({ success: true });
    }

    if (updateData.status) {
      const now = new Date().toISOString();
      let statusHistory = targetReport.status_history || [];
      
      statusHistory.push({
        status: updateData.status,
        at: now,
        memo: updateData.memo,
      });

      await sql`
        UPDATE reports 
        SET status = ${updateData.status}, status_history = ${JSON.stringify(statusHistory)}::jsonb 
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid patch request" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const reports = await sql`SELECT * FROM reports WHERE id = ${id}`;
    if (reports.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await sql`DELETE FROM reports WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reports/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
