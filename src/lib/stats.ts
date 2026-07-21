import { sql } from "@/lib/db";

export interface TopEmpathyReport {
  id: string;
  stopName: string;
  issueType: string;
  empathyCount: number;
  type: "bus" | "campus" | "street";
}

export interface StatsData {
  total: number;
  resolved: number;
  resolvedRate: number;
  topEmpathy: TopEmpathyReport[];
}

export async function getStatsData(): Promise<StatsData> {
  try {
    const totalResult = await sql`SELECT COUNT(*) FROM reports`;
    const resolvedResult = await sql`SELECT COUNT(*) FROM reports WHERE status = '해결됨'`;
    
    // empathyCount가 0 초과인 항목들을 내림차순 정렬하여 상위 3건만 추출
    const topEmpathyResult = await sql`
      SELECT id, stop_name as "stopName", issue_type as "issueType", empathy_count as "empathyCount", type
      FROM reports 
      WHERE empathy_count > 0 
      ORDER BY empathy_count DESC 
      LIMIT 3
    `;

    const total = parseInt(totalResult[0]?.count || "0", 10);
    const resolved = parseInt(resolvedResult[0]?.count || "0", 10);
    
    // total이 0일 때 0으로 나누기 방지
    const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    const topEmpathy: TopEmpathyReport[] = topEmpathyResult.map((row: any) => ({
      id: row.id,
      stopName: row.stopName,
      issueType: row.issueType,
      empathyCount: row.empathyCount,
      type: row.type as "bus" | "campus" | "street",
    }));

    return {
      total,
      resolved,
      resolvedRate,
      topEmpathy,
    };
  } catch (error) {
    console.error("Failed to fetch stats data:", error);
    // 에러 발생 시 렌더링을 깨지 않기 위해 기본값 반환
    return {
      total: 0,
      resolved: 0,
      resolvedRate: 0,
      topEmpathy: [],
    };
  }
}
