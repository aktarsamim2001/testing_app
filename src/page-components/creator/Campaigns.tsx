"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Eye } from "lucide-react";

export default function CreatorCampaigns() {
  const { user } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('created_by', user?.id)
        .single();

      if (partner) {
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
          compensation: cp.compensation,
          campaign_partner_id: cp.id
        })) || [];

        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
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

  const filterByStatus = (status?: string) => {
    if (!status) return campaigns;
    return campaigns.filter(c => c.status === status);
  };

  return (
    <div className="flex-1 p-6">
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

              {['all', 'active', 'planning', 'completed'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {filterByStatus(tab === 'all' ? undefined : tab).length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No {tab !== 'all' && tab} campaigns found
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filterByStatus(tab === 'all' ? undefined : tab).map((campaign) => (
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
                              View Details
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Compensation</p>
                              <p className="font-semibold">
                                {campaign.compensation ? `$${Number(campaign.compensation).toLocaleString()}` : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <Badge variant="outline">{campaign.partnership_status || 'pending'}</Badge>
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
              ))}
      </Tabs>
    </div>
  );
}
