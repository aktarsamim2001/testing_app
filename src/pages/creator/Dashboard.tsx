"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";
import { Briefcase, DollarSign, TrendingUp, Eye } from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (!rolesLoading && !roles.some(r => r === 'creator' as any)) {
      router.push('/');
    }
  }, [roles, rolesLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCreatorData();
    }
  }, [user]);

  const fetchCreatorData = async () => {
    try {
      // Fetch partner profile
      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('created_by', user?.id)
        .single();

      setPartnerData(partner);

      if (partner) {
        // Fetch campaigns for this partner
        const { data: campaignPartnersData } = await supabase
          .from('campaign_partners')
          .select(`
            *,
            campaigns (
              id,
              name,
              description,
              type,
              status,
              budget,
              start_date,
              end_date,
              clients (
                company_name
              )
            )
          `)
          .eq('partner_id', partner.id)
          .order('created_at', { ascending: false });

        const campaignsData = campaignPartnersData?.map(cp => ({
          ...cp.campaigns,
          partnership_status: cp.status,
          compensation: cp.compensation
        })) || [];

        setCampaigns(campaignsData);

        // Fetch earnings data
        const { data: earningsData } = await supabase
          .from('creator_earnings')
          .select('*')
          .eq('partner_id', partner.id);

        // Calculate stats
        const totalCampaigns = campaignsData.length;
        const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
        const totalEarnings = earningsData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        setStats({
          totalCampaigns,
          activeCampaigns,
          totalEarnings
        });
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      planning: 'bg-blue-500',
      paused: 'bg-yellow-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blogger_outreach: 'Blogger Outreach',
      linkedin_influencer: 'LinkedIn Influencer',
      youtube_campaign: 'YouTube Campaign'
    };
    return labels[type] || type;
  };

  if (loading || rolesLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <CreatorSidebar />
          <div className="flex-1">
            <header className="h-16 border-b flex items-center px-6">
              <SidebarTrigger />
            </header>
            <div className="p-6">
              <Skeleton className="h-8 w-64 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CreatorSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b flex items-center px-6">
            <SidebarTrigger />
            <h2 className="ml-4 text-xl font-semibold">Creator Dashboard</h2>
          </header>

          <main className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Welcome back, {partnerData?.name}</h1>
              <p className="text-muted-foreground mt-1">Manage your campaign partnerships</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">All partnerships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all campaigns</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Your latest campaign assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground text-center">
                      You haven't been assigned to any campaigns yet. Brands will reach out when they find you!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                <Badge className={getStatusColor(campaign.status)}>
                                  {campaign.status}
                                </Badge>
                                <Badge variant="outline">{getTypeLabel(campaign.type)}</Badge>
                              </div>
                              <CardDescription>
                                {campaign.clients?.company_name && (
                                  <span className="font-medium">{campaign.clients.company_name}</span>
                                )}
                                {campaign.description && ` • ${campaign.description}`}
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/creator/campaigns/${campaign.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Compensation</p>
                              <p className="font-semibold">
                                {campaign.compensation ? `$${Number(campaign.compensation).toLocaleString()}` : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-semibold">
                                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <Badge variant="outline">{campaign.partnership_status || 'pending'}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
