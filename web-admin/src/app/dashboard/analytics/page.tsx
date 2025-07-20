'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { format, subDays, parseISO } from 'date-fns';

interface AnalyticsData {
  date: string;
  total_events: number;
  unique_users: number;
  unique_sessions: number;
  screen_views: number;
  button_clicks: number;
  feature_uses: number;
  errors: number;
}

interface PerformanceData {
  date: string;
  crashes: number;
  errors: number;
  avg_performance_ms: number;
  avg_network_ms: number;
  memory_warnings: number;
}

interface PopularScreens {
  screen_name: string;
  view_count: number;
}

interface HourlyActivity {
  hour: number;
  users: number;
  events: number;
  day: string;
}

interface RetentionData {
  cohort: string;
  day0: number;
  day1: number;
  day7: number;
  day14: number;
  day30: number;
}

interface FunnelData {
  step: string;
  users: number;
  retention_rate: number;
  step_order: number;
}

interface FeatureTrend {
  date: string;
  coffee_logging: number;
  flavor_selection: number;
  photo_upload: number;
  social_features: number;
  search_usage: number;
}

const COLORS = ['#8B4513', '#CD853F', '#DEB887', '#F4A460', '#D2691E'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [popularScreens, setPopularScreens] = useState<PopularScreens[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [featureTrends, setFeatureTrends] = useState<FeatureTrend[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive filters
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('Mon');
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    totalErrors: 0,
    crashRate: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Generate mock data for new charts (replace with real Supabase queries)
  const generateMockHourlyActivity = (): HourlyActivity[] => {
    const data: HourlyActivity[] = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          hour,
          day,
          users: Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 21 ? 20 : 5),
          events: Math.floor(Math.random() * 200) + (hour >= 9 && hour <= 21 ? 100 : 20),
        });
      }
    });
    
    return data;
  };

  const generateMockRetentionData = (): RetentionData[] => {
    return [
      { cohort: 'Week 1', day0: 100, day1: 85, day7: 65, day14: 45, day30: 30 },
      { cohort: 'Week 2', day0: 120, day1: 95, day7: 75, day14: 55, day30: 35 },
      { cohort: 'Week 3', day0: 140, day1: 110, day7: 85, day14: 60, day30: 40 },
      { cohort: 'Week 4', day0: 160, day1: 125, day7: 95, day14: 70, day30: 45 },
    ];
  };

  const generateMockFunnelData = (): FunnelData[] => {
    return [
      { step: 'App Opens', users: 1000, retention_rate: 100, step_order: 1 },
      { step: 'Start Coffee Log', users: 750, retention_rate: 75, step_order: 2 },
      { step: 'Coffee Info Entry', users: 600, retention_rate: 60, step_order: 3 },
      { step: 'Flavor Selection', users: 450, retention_rate: 45, step_order: 4 },
      { step: 'Complete Tasting', users: 300, retention_rate: 30, step_order: 5 },
    ];
  };

  const generateMockFeatureTrends = (): FeatureTrend[] => {
    const data: FeatureTrend[] = [];
    for (let i = 14; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      data.push({
        date,
        coffee_logging: Math.floor(Math.random() * 100) + 50,
        flavor_selection: Math.floor(Math.random() * 80) + 30,
        photo_upload: Math.floor(Math.random() * 60) + 20,
        social_features: Math.floor(Math.random() * 40) + 10,
        search_usage: Math.floor(Math.random() * 70) + 25,
      });
    }
    return data;
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch analytics dashboard data
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics_dashboard')
        .select('*')
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Fetch performance dashboard data
      const { data: performance, error: performanceError } = await supabase
        .from('performance_dashboard')
        .select('*')
        .order('date', { ascending: true });

      if (performanceError) throw performanceError;

      // Fetch popular screens
      const { data: screens, error: screensError } = await supabase
        .from('analytics_events')
        .select('screen_name')
        .eq('event_type', 'screen_view')
        .not('screen_name', 'is', null)
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (screensError) throw screensError;

      // Process popular screens
      const screenCounts = screens.reduce((acc: Record<string, number>, item) => {
        acc[item.screen_name] = (acc[item.screen_name] || 0) + 1;
        return acc;
      }, {});

      const popularScreensData = Object.entries(screenCounts)
        .map(([screen_name, view_count]) => ({ screen_name, view_count }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);

      // Fetch total stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (sessionsError) throw sessionsError;

      const totalUsers = new Set(sessions.map(s => s.user_id).filter(Boolean)).size;
      const totalSessions = sessions.length;
      const avgSessionDuration = sessions
        .filter(s => s.duration_ms)
        .reduce((sum, s) => sum + (s.duration_ms || 0), 0) / 
        sessions.filter(s => s.duration_ms).length || 0;
      const totalErrors = sessions.reduce((sum, s) => sum + (s.error_count || 0), 0);
      const crashRate = sessions.reduce((sum, s) => sum + (s.crash_count || 0), 0) / totalSessions * 100;

      setAnalyticsData(analytics || []);
      setPerformanceData(performance || []);
      setPopularScreens(popularScreensData);
      
      // Set mock data for new charts
      setHourlyActivity(generateMockHourlyActivity());
      setRetentionData(generateMockRetentionData());
      setFunnelData(generateMockFunnelData());
      setFeatureTrends(generateMockFeatureTrends());
      setTotalStats({
        totalUsers,
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration / 1000), // Convert to seconds
        totalErrors,
        crashRate: Math.round(crashRate * 100) / 100,
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-amber-900">Analytics Dashboard</h1>
        <p className="text-amber-700 mt-2">User behavior and app performance insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{totalStats.totalUsers}</div>
            <p className="text-xs text-amber-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{totalStats.totalSessions}</div>
            <p className="text-xs text-orange-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Avg Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{totalStats.avgSessionDuration}s</div>
            <p className="text-xs text-yellow-600 mt-1">Duration</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{totalStats.totalErrors}</div>
            <p className="text-xs text-red-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Crash Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalStats.crashRate}%</div>
            <p className="text-xs text-gray-600 mt-1">Per session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usage">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="screens">Screen Analytics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Insights</TabsTrigger>
          <TabsTrigger value="funnel">User Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Daily User Activity</CardTitle>
                <CardDescription>Events and unique users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'PPP')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="unique_users" 
                      stroke="#8B4513" 
                      strokeWidth={2}
                      name="Unique Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_events" 
                      stroke="#CD853F" 
                      strokeWidth={2}
                      name="Total Events"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Event Types Distribution</CardTitle>
                <CardDescription>Breakdown of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'PPP')}
                    />
                    <Legend />
                    <Bar dataKey="screen_views" stackId="a" fill="#8B4513" name="Screen Views" />
                    <Bar dataKey="button_clicks" stackId="a" fill="#CD853F" name="Button Clicks" />
                    <Bar dataKey="feature_uses" stackId="a" fill="#DEB887" name="Feature Uses" />
                    <Bar dataKey="errors" stackId="a" fill="#DC2626" name="Errors" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Performance Metrics</CardTitle>
                <CardDescription>Average response times and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'PPP')}
                      formatter={(value: number, name: string) => [
                        `${Math.round(value)}ms`, 
                        name
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avg_performance_ms" 
                      stroke="#8B4513" 
                      strokeWidth={2}
                      name="App Performance"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_network_ms" 
                      stroke="#CD853F" 
                      strokeWidth={2}
                      name="Network Requests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Error & Crash Tracking</CardTitle>
                <CardDescription>App stability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'PPP')}
                    />
                    <Legend />
                    <Bar dataKey="errors" fill="#F59E0B" name="Errors" />
                    <Bar dataKey="crashes" fill="#DC2626" name="Crashes" />
                    <Bar dataKey="memory_warnings" fill="#6B7280" name="Memory Warnings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="screens" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Popular Screens</CardTitle>
                <CardDescription>Most visited screens (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={popularScreens}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ screen_name, percent }) => `${screen_name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="view_count"
                    >
                      {popularScreens.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} views`, 'Screen Views']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Screen Navigation Flow</CardTitle>
                <CardDescription>User journey through the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularScreens.map((screen, index) => (
                    <div key={screen.screen_name} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-sm font-medium text-amber-800">
                          {index + 1}
                        </div>
                        <span className="font-medium text-amber-900">{screen.screen_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-900">{screen.view_count}</div>
                        <div className="text-xs text-amber-600">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Activity Heatmap</CardTitle>
                <CardDescription>User activity by hour and day of week</CardDescription>
                <div className="flex space-x-2 mt-2">
                  <Select value={selectedDayOfWeek} onValueChange={setSelectedDayOfWeek}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mon">Monday</SelectItem>
                      <SelectItem value="Tue">Tuesday</SelectItem>
                      <SelectItem value="Wed">Wednesday</SelectItem>
                      <SelectItem value="Thu">Thursday</SelectItem>
                      <SelectItem value="Fri">Friday</SelectItem>
                      <SelectItem value="Sat">Saturday</SelectItem>
                      <SelectItem value="Sun">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={hourlyActivity.filter(h => h.day === selectedDayOfWeek)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      labelFormatter={(value) => `${value}:00`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      fill="#8B4513"
                      fillOpacity={0.3}
                      stroke="#8B4513"
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="events"
                      stroke="#CD853F"
                      strokeWidth={2}
                      name="Events"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Retention Cohort */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">User Retention Cohorts</CardTitle>
                <CardDescription>User return rates by signup week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} users`, 'Users']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="day0" stroke="#8B4513" strokeWidth={3} name="Day 0" />
                    <Line type="monotone" dataKey="day1" stroke="#CD853F" strokeWidth={2} name="Day 1" />
                    <Line type="monotone" dataKey="day7" stroke="#DEB887" strokeWidth={2} name="Day 7" />
                    <Line type="monotone" dataKey="day14" stroke="#F4A460" strokeWidth={2} name="Day 14" />
                    <Line type="monotone" dataKey="day30" stroke="#D2691E" strokeWidth={2} name="Day 30" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Usage Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-amber-900">Feature Usage Trends</CardTitle>
                <CardDescription>How different features are being adopted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={featureTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'PPP')}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="coffee_logging"
                      stackId="1"
                      stroke="#8B4513"
                      fill="#8B4513"
                      fillOpacity={0.8}
                      name="Coffee Logging"
                    />
                    <Area
                      type="monotone"
                      dataKey="flavor_selection"
                      stackId="1"
                      stroke="#CD853F"
                      fill="#CD853F"
                      fillOpacity={0.8}
                      name="Flavor Selection"
                    />
                    <Area
                      type="monotone"
                      dataKey="search_usage"
                      stackId="1"
                      stroke="#DEB887"
                      fill="#DEB887"
                      fillOpacity={0.8}
                      name="Search"
                    />
                    <Area
                      type="monotone"
                      dataKey="photo_upload"
                      stackId="1"
                      stroke="#F4A460"
                      fill="#F4A460"
                      fillOpacity={0.8}
                      name="Photo Upload"
                    />
                    <Area
                      type="monotone"
                      dataKey="social_features"
                      stackId="1"
                      stroke="#D2691E"
                      fill="#D2691E"
                      fillOpacity={0.8}
                      name="Social Features"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coffee Tasting Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Coffee Tasting Funnel</CardTitle>
                <CardDescription>User conversion through the tasting flow</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={funnelData} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'users' ? `${value} users` : `${value}%`,
                        name === 'users' ? 'Users' : 'Retention Rate'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="users" fill="#8B4513" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Conversion Rates</CardTitle>
                <CardDescription>Step-by-step retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step_order" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Retention Rate']}
                      labelFormatter={(value) => `Step ${value}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="retention_rate"
                      stroke="#8B4513"
                      strokeWidth={3}
                      dot={{ fill: '#8B4513', strokeWidth: 2, r: 6 }}
                      name="Retention Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Funnel Summary Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-amber-900">Funnel Summary</CardTitle>
                <CardDescription>Detailed breakdown of user journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((step, index) => (
                    <div key={step.step} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-lg font-bold text-amber-800">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900">{step.step}</h3>
                          <p className="text-sm text-amber-600">{step.retention_rate}% retention rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-900">{step.users}</div>
                        <div className="text-sm text-amber-600">users</div>
                        {index > 0 && (
                          <div className="text-xs text-red-600">
                            -{funnelData[index - 1].users - step.users} dropped off
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}