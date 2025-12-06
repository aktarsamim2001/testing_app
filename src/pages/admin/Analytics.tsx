"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Users, DollarSign, TrendingUp, Megaphone } from 'lucide-react';

interface CampaignStats {
  type: string;
  count: number;
}

interface StatusStats {
  status: string;
  count: number;
}

interface UserGrowth {
  date: string;
  users: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface PlatformMetrics {
  totalUsers: number;
  totalRevenue: number;
  totalCampaigns: number;
  totalPartners: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
}

export default function Analytics() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const [campaignsByType, setCampaignsByType] = useState<CampaignStats[]>([]);
  const [campaignsByStatus, setCampaignsByStatus] = useState<StatusStats[]>([]);
  const [partnersByChannel, setPartnersByChannel] = useState<CampaignStats[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    totalRevenue: 0,
    totalCampaigns: 0,
    totalPartners: 0,
    userGrowthRate: 0,
    revenueGrowthRate: 0
  });
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth');
    }
  }, [user, isAdmin, loading, router]);

  const fetchAnalytics = async () => {
    const [campaigns, partners, profiles, payments, earnings] = await Promise.all([
      supabase.from('campaigns').select('type, status, created_at'),
      supabase.from('partners').select('channel_type, created_at'),
      supabase.from('profiles').select('created_at'),
      supabase.from('payments').select('amount, created_at'),
      supabase.from('creator_earnings').select('amount, created_at')
    ]);

    // Platform metrics
    const totalUsers = profiles.data?.length || 0;
    const totalCampaigns = campaigns.data?.length || 0;
    const totalPartners = partners.data?.length || 0;
    
    const paymentsRevenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const earningsRevenue = earnings.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const totalRevenue = paymentsRevenue + earningsRevenue;

    // Calculate growth rates (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentUsers = profiles.data?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length || 0;
    const previousUsers = profiles.data?.filter(p => new Date(p.created_at) >= sixtyDaysAgo && new Date(p.created_at) < thirtyDaysAgo).length || 0;
    const userGrowthRate = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;

    const recentRevenue = [...(payments.data || []), ...(earnings.data || [])]
      .filter(item => new Date(item.created_at) >= thirtyDaysAgo)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const previousRevenue = [...(payments.data || []), ...(earnings.data || [])]
      .filter(item => new Date(item.created_at) >= sixtyDaysAgo && new Date(item.created_at) < thirtyDaysAgo)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const revenueGrowthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    setPlatformMetrics({
      totalUsers,
      totalRevenue,
      totalCampaigns,
      totalPartners,
      userGrowthRate,
      revenueGrowthRate
    });

    // User growth over last 12 months
    const monthlyUsers: Record<string, number> = {};
    profiles.data?.forEach(p => {
      const month = new Date(p.created_at).toISOString().slice(0, 7);
      monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
    });
    
    const userGrowthData: UserGrowth[] = [];
    let cumulativeUsers = 0;
    Object.entries(monthlyUsers)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .forEach(([date, count]) => {
        cumulativeUsers += count;
        userGrowthData.push({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          users: cumulativeUsers
        });
      });
    setUserGrowth(userGrowthData);

    // Revenue over last 12 months
    const monthlyRevenue: Record<string, number> = {};
    [...(payments.data || []), ...(earnings.data || [])].forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(item.amount);
    });

    const revenueChartData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      }));
    setRevenueData(revenueChartData);

    // Campaign stats
    if (campaigns.data) {
      const typeCount = campaigns.data.reduce((acc: Record<string, number>, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {});
      setCampaignsByType(
        Object.entries(typeCount).map(([type, count]) => ({
          type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: count as number
        }))
      );

      const statusCount = campaigns.data.reduce((acc: Record<string, number>, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});
      setCampaignsByStatus(
        Object.entries(statusCount).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count: count as number
        }))
      );
    }

    // Partner stats
    if (partners.data) {
      const channelCount = partners.data.reduce((acc: Record<string, number>, p) => {
        acc[p.channel_type] = (acc[p.channel_type] || 0) + 1;
        return acc;
      }, {});
      setPartnersByChannel(
        Object.entries(channelCount).map(([type, count]) => ({
          type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: count as number
        }))
      );
    }

    setDataLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader />
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatGrowth = (rate: number) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform metrics, user growth, and revenue insights</p>
        </div>

        {dataLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Platform Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformMetrics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={platformMetrics.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatGrowth(platformMetrics.userGrowthRate)}
                    </span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(platformMetrics.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={platformMetrics.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatGrowth(platformMetrics.revenueGrowthRate)}
                    </span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformMetrics.totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">Across all channels</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformMetrics.totalPartners}</div>
                  <p className="text-xs text-muted-foreground">Active creators</p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Cumulative user signups over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Campaign & Partner Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns by Type</CardTitle>
                  <CardDescription>Distribution across channel types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignsByType}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="type" className="text-xs" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Status</CardTitle>
                  <CardDescription>Current campaign pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={campaignsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {campaignsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Partners by Channel</CardTitle>
                <CardDescription>Distribution of influencer types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={partnersByChannel}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
