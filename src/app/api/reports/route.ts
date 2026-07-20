import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let query = `SELECT * FROM reports`;
    const conditions = [];
    const params = [];

    if (type && type !== "all") {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (status && status !== "all") {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }
    query += ` ORDER BY created_at DESC`;

    // @ts-ignore
    const reports = await sql.query(query, params);

    // Convert keys to camelCase for the frontend
    const mapped = reports.map(r => ({
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
      date: r.created_at, // Mapping created_at to date for backward compatibility
      lat: r.lat,
      lng: r.lng
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const reportData = await request.json();

    const id = "r" + (Date.now().toString() + Math.floor(Math.random() * 1000));
    
    // Generate code
    const typeCountResult = await sql`SELECT COUNT(*) FROM reports WHERE type = ${reportData.type}`;
    const nextSeq = parseInt(typeCountResult[0].count) + 1;
    const prefix = reportData.type === "bus" ? "B" : "C";
    const reportCode = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    const now = new Date().toISOString();
    const statusHistory = JSON.stringify([{ status: "접수됨", at: now }]);

    // @ts-ignore
    await sql.query(`
      INSERT INTO reports (
        id, report_code, type, stop_id, stop_name, issue_type, description, photo_url,
        status, status_history, empathy_count, is_urgent, lat, lng
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `, [
      id, reportCode, reportData.type, reportData.stopId, reportData.stopName, reportData.issueType,
      reportData.description || null, reportData.photoUrl || null, "접수됨", statusHistory,
      0, false, reportData.lat, reportData.lng
    ]);

    const newReport = {
      ...reportData,
      id,
      reportCode,
      date: now,
      status: "접수됨",
      statusHistory: [{ status: "접수됨", at: now }],
      empathyCount: 0,
      isUrgent: false,
    };

    return NextResponse.json(newReport);
  } catch (error) {
    require('fs').writeFileSync('debug_error.log', String(error) + '\\n' + (error.stack || ''));
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
