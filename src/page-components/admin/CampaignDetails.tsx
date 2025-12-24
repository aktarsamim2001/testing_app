"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaignById } from '@/store/slices/campaigns';
import { assignPartnerToCampaign, removePartnerFromCampaign } from '@/store/slices/campaignPartners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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




export default function CampaignDetails() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [partnerToRemove, setPartnerToRemove] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await dispatch<any>(fetchCampaignById(id));
      setCampaign(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line
  }, [id]);

  const handleRemovePartner = (partnerId: string) => {
    setPartnerToRemove(partnerId);
    setRemoveDialogOpen(true);
  };

  const confirmRemovePartner = async () => {
    if (!partnerToRemove || !id) return;
    setLoading(true);
    try {
      await dispatch<any>(removePartnerFromCampaign({ id: partnerToRemove, campaignId: id }));
      await fetchCampaign();
    } finally {
      setLoading(false);
      setRemoveDialogOpen(false);
      setPartnerToRemove(null);
    }
  };

  const handleDialogClose = async () => {
    setDialogOpen(false);
    await fetchCampaign();
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
              <div className="text-2xl font-bold">{campaign.assigned_partners?.length || 0}</div>
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
            ) : !campaign.assigned_partners || campaign.assigned_partners.length === 0 ? (
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
                  {campaign.assigned_partners.map((cp: any) => (
                    <TableRow key={cp.id}>
                      <TableCell className="font-medium">{cp.partner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cp.partner_channel_type?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{cp.partner_email}</TableCell>
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
                            {/* Remove Partner Confirmation Dialog */}
                            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Partner</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to remove this partner from the campaign?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={loading}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={confirmRemovePartner} disabled={loading}>
                                    {loading ? 'Removing...' : 'Remove'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
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
