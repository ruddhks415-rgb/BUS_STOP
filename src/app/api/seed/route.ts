import { NextResponse } from "next/server";
import { setKvReports } from "@/lib/kvStore";
import { REPORTS as INITIAL_REPORTS } from "@/lib/mockData";

export async function GET() {
  try {
    await setKvReports(INITIAL_REPORTS);
    return NextResponse.json({ success: true, message: "Seeded mock data to Vercel KV successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
