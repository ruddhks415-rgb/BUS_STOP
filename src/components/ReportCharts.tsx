"use client";

import { Report } from "@/lib/reportStore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ReportChartsProps {
  reports: Report[];
}

export default function ReportCharts({ reports }: ReportChartsProps) {
  if (reports.length === 0) {
    return <div className="text-center text-gray-500 py-10">데이터가 없습니다.</div>;
  }

  // 1. 상태별 통계
  const statusCounts = reports.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  const STATUS_COLORS: Record<string, string> = {
    "접수됨": "#EF4444", // red-500
    "검토중": "#F97316", // orange-500
    "제출됨": "#EAB308", // yellow-500
    "해결됨": "#22C55E", // green-500
    "반려": "#9CA3AF"    // gray-400
  };

  // 2. 민원 유형별 통계
  const typeCounts = reports.reduce((acc, curr) => {
    acc[curr.issueType] = (acc[curr.issueType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.keys(typeCounts)
    .map(key => ({ name: key, 건수: typeCounts[key] }))
    .sort((a, b) => b.건수 - a.건수)
    .slice(0, 5); // 상위 5개만

  // 3. 장소별 통계 (버스 vs 캠퍼스)
  const categoryCounts = reports.reduce((acc, curr) => {
    const label = curr.type === "bus" ? "버스 정류장" : "캠퍼스 건물";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  const CATEGORY_COLORS = ["#10B981", "#3B82F6"]; // jnu-green, jnu-blue

  return (
    <div className="flex flex-col gap-8 w-full mt-6">
      
      {/* 윗줄: 상태별 & 장소별 파이차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 상태별 파이 차트 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-4 text-center">진행 상태 현황</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#CBD5E1"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 장소별 파이 차트 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-4 text-center">제보 분야 분포</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 아랫줄: 최다 민원 유형 바 차트 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-4 text-center">가장 많이 발생한 민원 유형 (TOP 5)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={typeData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="건수" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
