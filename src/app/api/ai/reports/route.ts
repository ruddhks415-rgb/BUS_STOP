import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportIds = searchParams.get("reportIds"); // can be single id or comma-separated to find associated AI report
    
    let query = `SELECT * FROM ai_reports ORDER BY created_at DESC`;
    // @ts-ignore
    const aiReports = await sql.query(query);

    // Convert keys to camelCase for the frontend
    const mapped = aiReports.map(r => ({
      id: r.id,
      type: r.type,
      targetReportIds: r.target_report_ids,
      aiGeneratedContent: r.ai_generated_content,
      editedContent: r.edited_content,
      isEdited: r.is_edited,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    // If reportIds is passed, filter locally (since target_report_ids is a JSON array)
    if (reportIds) {
      const idsArray = reportIds.split(',');
      const filtered = mapped.filter(ar => 
        idsArray.every(id => ar.targetReportIds.includes(id)) && 
        ar.targetReportIds.length === idsArray.length
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/ai/reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const id = "ai" + (Date.now().toString() + Math.floor(Math.random() * 1000));
    
    // @ts-ignore
    await sql.query(`
      INSERT INTO ai_reports (
        id, type, target_report_ids, ai_generated_content, edited_content, is_edited
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      id, 
      data.type, 
      JSON.stringify(data.targetReportIds), 
      JSON.stringify(data.aiGeneratedContent),
      JSON.stringify(data.aiGeneratedContent), // Initially edited_content is the same as ai_generated_content
      false
    ]);

    return NextResponse.json({ id, ...data, isEdited: false });
  } catch (error) {
    console.error("POST /api/ai/reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
