import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const migrationPath = path.join(process.cwd(), "db", "migrations", "001_create_reports_table.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    // Execute the raw SQL migration
    // @ts-ignore
    await sql(migrationSql);

    return NextResponse.json({ message: "Database tables created successfully!" });
  } catch (error) {
    console.error("Seed DB Error:", error);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}
