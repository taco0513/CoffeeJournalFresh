"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  userGrowth: Array<{ date: string; users: number }>;
  coffeeStatus: Array<{ name: string; value: number }>;
  weeklyActivity: Array<{ day: string; tastings: number }>;
  topRoasters: Array<{ roastery: string; count: number }>;
}

// Coffee-themed colors
const COLORS = {
  primary: "#8B4513", // Saddle Brown
  secondary: "#D2691E", // Chocolate
  tertiary: "#A0522D", // Sienna
  accent: "#CD853F", // Peru
  light: "#DEB887", // Burlywood
  success: "#228B22", // Forest Green
  warning: "#FFB347", // Deep Peach
  background: "#FFF8DC", // Cornsilk
};

const PIE_COLORS = [COLORS.success, COLORS.warning];

export function DashboardCharts({ data }: { data: ChartData }) {
  return (
    <div className="space-y-8">
      {/* First Row - Line Chart and Pie Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 증가 추이</CardTitle>
            <p className="text-sm text-muted-foreground">
              최근 30일간 일별 신규 사용자
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("ko-KR");
                  }}
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.light}`,
                    borderRadius: "6px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.secondary, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="신규 사용자"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coffee Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>커피 검증 현황</CardTitle>
            <p className="text-sm text-muted-foreground">
              검증됨 vs 검토 중 비율
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.coffeeStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.coffeeStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.light}`,
                    borderRadius: "6px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Bar Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>주간 활동</CardTitle>
            <p className="text-sm text-muted-foreground">
              최근 7일간 일별 테이스팅 수
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.light}`,
                    borderRadius: "6px",
                  }}
                />
                <Bar 
                  dataKey="tastings" 
                  fill={COLORS.tertiary}
                  radius={[8, 8, 0, 0]}
                  name="테이스팅"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Roasters Chart */}
        <Card>
          <CardHeader>
            <CardTitle>인기 로스터리</CardTitle>
            <p className="text-sm text-muted-foreground">
              커피 등록 수 기준 TOP 10
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data.topRoasters} 
                layout="horizontal"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="roastery" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.light}`,
                    borderRadius: "6px",
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={COLORS.accent}
                  radius={[0, 8, 8, 0]}
                  name="커피 수"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}