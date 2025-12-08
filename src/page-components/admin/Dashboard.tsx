"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCampaigns: 0,
    totalPartners: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [clients, campaigns, partners] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('partners').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalClients: clients.count || 0,
        activeCampaigns: campaigns.count || 0,
        totalPartners: partners.count || 0
      });
    };

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth');
    }
  }, [user, isAdmin, loading, router]);

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

  const statsData = [
    { title: 'Total Clients', value: stats.totalClients.toString(), icon: Users, description: 'SAAS companies' },
    { title: 'Active Campaigns', value: stats.activeCampaigns.toString(), icon: BarChart3, description: 'Running campaigns' },
    { title: 'Partners', value: stats.totalPartners.toString(), icon: MessageSquare, description: 'Influencers' }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Phase 3: Advanced Features - Complete ✓</CardTitle>
            <CardDescription>
              Full platform with analytics, campaign-partner management, and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="font-semibold">Phase 1 - Foundation:</CardTitle>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Lovable Cloud backend enabled</li>
                <li>User authentication & role-based access</li>
                <li>Admin dashboard with sidebar navigation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-semibold">Phase 2 - Core Management:</CardTitle>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Client management (SAAS companies)</li>
                <li>Partner directory (bloggers, LinkedIn influencers, YouTubers)</li>
                <li>Campaign management (all three channel types)</li>
                <li>Full CRUD operations with data persistence</li>
              </ul>
            </div>
            <div className="space-y-2">
              <CardTitle className="font-semibold">Phase 3 - Advanced Features:</CardTitle>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Campaign-partner assignment & management</li>
                <li>Analytics dashboard with visual charts</li>
                <li>User management & settings page</li>
                <li>Campaign details with partner tracking</li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                All core platform features are now complete and operational!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
