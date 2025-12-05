"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import AssignPartnerDialog from '@/components/admin/AssignPartnerDialog';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  clients: { company_name: string } | null;
}

interface CampaignPartner {
  id: string;
  partner_id: string;
  compensation: number | null;
  status: string | null;
  notes: string | null;
  partners: {
    name: string;
    channel_type: string;
    email: string;
  };
}

export default function CampaignDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [partners, setPartners] = useState<CampaignPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCampaign = async () => {
    if (!id) return;

    const { data, error} = await supabase
      .from('campaigns')
      .select('*, clients(company_name)')
      .eq('id', id)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setCampaign(data);
    }
  };

  const fetchPartners = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('campaign_partners')
      .select('*, partners(name, channel_type, email)')
      .eq('campaign_id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaign();
    fetchPartners();
  }, [id]);

  const handleRemovePartner = async (partnerId: string) => {
    if (!confirm('Remove this partner from the campaign?')) return;

    const { error } = await supabase
      .from('campaign_partners')
      .delete()
      .eq('id', partnerId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Partner removed from campaign' });
      fetchPartners();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    fetchPartners();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!campaign) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/admin/campaigns')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.clients?.company_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(campaign.budget)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{campaign.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Partners Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Partners</CardTitle>
                <CardDescription>Manage partners working on this campaign</CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Partner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partners assigned yet. Click "Assign Partner" to add one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Compensation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((cp) => (
                    <TableRow key={cp.id}>
                      <TableCell className="font-medium">{cp.partners.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cp.partners.channel_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{cp.partners.email}</TableCell>
                      <TableCell>{formatCurrency(cp.compensation)}</TableCell>
                      <TableCell>
                        <Badge variant={cp.status === 'active' ? 'default' : 'secondary'}>
                          {cp.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePartner(cp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AssignPartnerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          campaignId={id || ''}
        />
      </div>
    </AdminLayout>
  );
}
