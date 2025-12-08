"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Users, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      // Fetch campaign with client check
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          clients!inner (
            id,
            company_name,
            created_by
          ),
          campaign_partners (
            id,
            status,
            compensation,
            partners (
              id,
              name,
              email,
              channel_type,
              platform_handle,
              follower_count,
              engagement_rate
            )
          )
        `)
        .eq('id', id)
        .single();

      if (campaignError) throw campaignError;

      // Check if user owns this campaign
      if (campaignData.clients.created_by !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this campaign",
          variant: "destructive",
        });
        router.push('/brand');
        return;
      }

      setCampaign(campaignData);
      setPartners(campaignData.campaign_partners || []);

      // Fetch available partners not yet in campaign
      const assignedPartnerIds = campaignData.campaign_partners?.map((cp: any) => cp.partners.id) || [];
      const { data: allPartners } = await supabase
        .from('partners')
        .select('*')
        .not('id', 'in', `(${assignedPartnerIds.join(',') || 'null'})`);

      setAvailablePartners(allPartners || []);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPartnerToCampaign = async (partnerId: string) => {
    try {
      const { error } = await supabase.from('campaign_partners').insert({
        campaign_id: id,
        partner_id: partnerId,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner added to campaign",
      });

      fetchCampaignData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add partner",
        variant: "destructive",
      });
    }
  };

  const removePartner = async (campaignPartnerId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_partners')
        .delete()
        .eq('id', campaignPartnerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Partner removed from campaign",
      });

      fetchCampaignData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove partner",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <p>Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Button variant="ghost" onClick={() => router.push('/brand')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-2">
            <Badge>{campaign.status}</Badge>
            <Badge variant="outline">{campaign.type}</Badge>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${Number(campaign.budget || 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{partners.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners ({partners.length})</TabsTrigger>
          <TabsTrigger value="add-partners">Add Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{campaign.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Start Date</h3>
                  <p>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">End Date</h3>
                  <p>{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          {partners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No partners assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            partners.map((cp) => (
              <Card key={cp.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{cp.partners.name}</CardTitle>
                      <CardDescription>{cp.partners.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{cp.status || 'pending'}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePartner(cp.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Channel</p>
                      <p className="font-medium">{cp.partners.channel_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-medium">{cp.partners.follower_count?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-medium">{cp.partners.engagement_rate ? `${cp.partners.engagement_rate}%` : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add-partners" className="space-y-4">
          {availablePartners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No available partners</p>
              </CardContent>
            </Card>
          ) : (
            availablePartners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{partner.name}</CardTitle>
                      <CardDescription>{partner.email}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addPartnerToCampaign(partner.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Campaign
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Channel</p>
                      <p className="font-medium">{partner.channel_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-medium">{partner.follower_count?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-medium">{partner.engagement_rate ? `${partner.engagement_rate}%` : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
