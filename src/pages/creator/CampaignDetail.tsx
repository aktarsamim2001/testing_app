"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const dynamic = "force-dynamic";

export function CreatorCampaignDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [partnership, setPartnership] = useState<any>(null);

  useEffect(() => {
    if (id && user) {
      fetchCampaignDetails();
    }
  }, [id, user]);

  const fetchCampaignDetails = async () => {
    try {
      // Get partner ID
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('created_by', user?.id)
        .single();

      if (!partner) {
        toast({
          title: "Error",
          description: "Partner profile not found",
          variant: "destructive",
        });
        router.push('/creator');
        return;
      }

      // Get campaign partnership
      const { data: campaignPartner } = await supabase
        .from('campaign_partners')
        .select(`
          *,
          campaigns (
            *,
            clients (
              company_name,
              contact_name,
              contact_email,
              website
            )
          )
        `)
        .eq('campaign_id', id)
        .eq('partner_id', partner.id)
        .single();

      if (!campaignPartner) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this campaign",
          variant: "destructive",
        });
        router.push('/creator/campaigns');
        return;
      }

      setCampaign(campaignPartner.campaigns);
      setPartnership(campaignPartner);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blogger_outreach: 'Blogger Outreach',
      linkedin_influencer: 'LinkedIn Influencer',
      youtube_campaign: 'YouTube Campaign'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex-1 p-6">
        <p>Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
              <div className="flex items-center gap-2">
                <Badge>{campaign.status}</Badge>
                <Badge variant="outline">{getTypeLabel(campaign.type)}</Badge>
                <Badge variant="outline">{partnership.status || 'pending'}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Your Compensation</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {partnership.compensation ? `$${Number(partnership.compensation).toLocaleString()}` : 'TBD'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Start Date</CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">End Date</CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {campaign.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Campaign Type</h3>
                    <p>{getTypeLabel(campaign.type)}</p>
                  </div>
                  {partnership.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Partnership Notes</h3>
                      <p className="text-muted-foreground">{partnership.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    <CardTitle>Brand Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-semibold">{campaign.clients?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-semibold">{campaign.clients?.contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{campaign.clients?.contact_email}</p>
                  </div>
                  {campaign.clients?.website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={campaign.clients.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        {campaign.clients.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
      </div>
    </div>
  );
}

export default CreatorCampaignDetail;
