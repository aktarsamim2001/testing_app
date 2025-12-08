"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Users, DollarSign, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function BrandDashboardClient() {
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalPartners: 0,
    totalBudget: 0
  });

  useEffect(() => {
    if (!rolesLoading && !roles.some(r => r === 'brand' as any)) {
      router.push('/');
    }
  }, [roles, rolesLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBrandData();
    }
  }, [user]);

  const fetchBrandData = async () => {
    try {
      // Fetch client profile
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', user?.id)
        .single();

      setClientData(client);

      if (client) {
        // Fetch campaigns for this client
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select(`
            *,
            campaign_partners (
              id,
              partner_id,
              partners (
                name,
                email,
                channel_type
              )
            )
          `)
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });

        setCampaigns(campaignsData || []);

        // Calculate stats
        const activeCampaigns = campaignsData?.filter(c => c.status === 'active').length || 0;
        const totalBudget = campaignsData?.reduce((sum, c) => sum + (Number(c.budget) || 0), 0) || 0;
        const partnerIds = new Set();
        campaignsData?.forEach(c => {
          c.campaign_partners?.forEach((cp: any) => partnerIds.add(cp.partner_id));
        });

        setStats({
          activeCampaigns,
          totalPartners: partnerIds.size,
          totalBudget
        });
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
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
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {clientData?.company_name}</h1>
        <p className="text-muted-foreground mt-1">Manage your influencer marketing campaigns</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button 
          onClick={() => router.push('/brand/campaigns/new')}
          className="h-16 text-lg"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Campaign
        </Button>
        <Button 
          onClick={() => router.push('/brand/marketplace')}
          variant="outline"
          className="h-16 text-lg"
          size="lg"
        >
          <Users className="w-5 h-5 mr-2" />
          Browse Creator Marketplace
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Running campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">Collaborating creators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Section */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first campaign to start collaborating with influencers
                </p>
                <Button onClick={() => router.push('/brand/campaigns/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(campaign.type)}</Badge>
                      </div>
                      <CardDescription>{campaign.description || 'No description'}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">${Number(campaign.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Partners</p>
                      <p className="font-semibold">{campaign.campaign_partners?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-semibold">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-semibold">
                        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {['active', 'planning', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {campaigns.filter(c => c.status === status).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No {status} campaigns</p>
                </CardContent>
              </Card>
            ) : (
              campaigns
                .filter(c => c.status === status)
                .map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{campaign.name}</CardTitle>
                            <Badge variant="outline">{getTypeLabel(campaign.type)}</Badge>
                          </div>
                          <CardDescription>{campaign.description || 'No description'}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/brand/campaigns/${campaign.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
