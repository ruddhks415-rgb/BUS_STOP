import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const { editedContent } = await request.json();

    const now = new Date().toISOString();

    // @ts-ignore
    const result = await sql.query(`
      UPDATE ai_reports 
      SET edited_content = $1, is_edited = $2, updated_at = $3
      WHERE id = $4
      RETURNING *
    `, [
      JSON.stringify(editedContent),
      true,
      now,
      id
    ]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const r = result[0];
    return NextResponse.json({
      id: r.id,
      type: r.type,
      targetReportIds: r.target_report_ids,
      aiGeneratedContent: r.ai_generated_content,
      editedContent: r.edited_content,
      isEdited: r.is_edited,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (error) {
    console.error("PATCH /api/ai/reports/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
