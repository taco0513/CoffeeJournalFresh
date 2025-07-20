'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
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

const COLORS = ['#8B4513', '#CD853F', '#DEB887', '#F4A460', '#D2691E'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [popularScreens, setPopularScreens] = useState<PopularScreens[]>([]);
  const [loading, setLoading] = useState(true);
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="screens">Screen Analytics</TabsTrigger>
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
      </Tabs>
    </div>
  );
}