import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Users, Package, TrendingUp } from "lucide-react";
import { DashboardCharts } from "./charts";

async function getStats() {
  const supabase = await createClient();
  
  // Get total users
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });
    
  // Get total coffees
  const { count: totalCoffees } = await supabase
    .from("coffee_catalog")
    .select("*", { count: "exact", head: true });
    
  // Get verified coffees
  const { count: verifiedCoffees } = await supabase
    .from("coffee_catalog")
    .select("*", { count: "exact", head: true })
    .eq("verified_by_moderator", true);
    
  // Get recent activity (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const { count: newCoffeesThisWeek } = await supabase
    .from("coffee_catalog")
    .select("*", { count: "exact", head: true })
    .gte("created_at", lastWeek.toISOString());
    
  return {
    totalUsers: totalUsers || 0,
    totalCoffees: totalCoffees || 0,
    verifiedCoffees: verifiedCoffees || 0,
    newCoffeesThisWeek: newCoffeesThisWeek || 0,
  };
}

async function getChartData() {
  const supabase = await createClient();
  
  // 1. User Growth Chart - Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: userProfiles } = await supabase
    .from("user_profiles")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });
    
  // Group by date
  const userGrowthMap = new Map<string, number>();
  
  // Initialize all dates with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    userGrowthMap.set(dateStr, 0);
  }
  
  // Count users per day
  userProfiles?.forEach((profile: { created_at: string }) => {
    const date = new Date(profile.created_at).toISOString().split('T')[0];
    userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
  });
  
  const userGrowth = Array.from(userGrowthMap.entries()).map(([date, users]) => ({
    date,
    users,
  }));
  
  // 2. Coffee Verification Status
  const { count: verifiedCount } = await supabase
    .from("coffee_catalog")
    .select("*", { count: "exact", head: true })
    .eq("verified_by_moderator", true);
    
  const { count: pendingCount } = await supabase
    .from("coffee_catalog")
    .select("*", { count: "exact", head: true })
    .eq("verified_by_moderator", false);
    
  const coffeeStatus = [
    { name: "검증됨", value: verifiedCount || 0 },
    { name: "검토 중", value: pendingCount || 0 },
  ];
  
  // 3. Weekly Activity - Tastings per day
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: tastings } = await supabase
    .from("coffee_tastings")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });
    
  // Group by day of week
  const weeklyActivityMap = new Map<string, number>();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // Initialize all days with 0
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = dayNames[date.getDay()];
    weeklyActivityMap.set(dayName, 0);
  }
  
  // Count tastings per day
  tastings?.forEach((tasting: { created_at: string }) => {
    const date = new Date(tasting.created_at);
    const dayName = dayNames[date.getDay()];
    weeklyActivityMap.set(dayName, (weeklyActivityMap.get(dayName) || 0) + 1);
  });
  
  const weeklyActivity = Array.from(weeklyActivityMap.entries()).map(([day, tastings]) => ({
    day,
    tastings,
  }));
  
  // 4. Top Roasters
  const { data: roasterCounts } = await supabase
    .from("coffee_catalog")
    .select("roastery")
    .not("roastery", "is", null);
    
  // Count occurrences
  const roasterMap = new Map<string, number>();
  roasterCounts?.forEach((item: { roastery: string | null }) => {
    if (item.roastery) {
      roasterMap.set(item.roastery, (roasterMap.get(item.roastery) || 0) + 1);
    }
  });
  
  // Sort and get top 10
  const topRoasters = Array.from(roasterMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([roastery, count]) => ({ roastery, count }))
    .reverse(); // Reverse for horizontal bar chart
    
  return {
    userGrowth,
    coffeeStatus,
    weeklyActivity,
    topRoasters,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const chartData = await getChartData();
  
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-8">대시보드</h2>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              전체 사용자
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              등록된 사용자 수
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              전체 커피
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoffees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              카탈로그 등록 커피
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              검증된 커피
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCoffees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCoffees > 0 
                ? `${Math.round((stats.verifiedCoffees / stats.totalCoffees) * 100)}% 검증됨`
                : "0% 검증됨"
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              주간 신규 커피
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newCoffeesThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              지난 7일간 추가됨
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <DashboardCharts data={chartData} />
      
      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentActivity() {
  const supabase = await createClient();
  
  // Get recent coffees
  const { data: recentCoffees } = await supabase
    .from("coffee_catalog")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
    
  if (!recentCoffees || recentCoffees.length === 0) {
    return <p className="text-sm text-muted-foreground">최근 활동이 없습니다.</p>;
  }
  
  return (
    <div className="space-y-4">
      {recentCoffees.map((coffee: any) => (
        <div key={coffee.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {coffee.coffee_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {coffee.roastery} • {new Date(coffee.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {coffee.verified_by_moderator ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                검증됨
              </span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                검토 중
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}