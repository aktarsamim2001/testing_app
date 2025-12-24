"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { encode as base64Encode } from '@/lib/utils';
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCampaigns, deleteCampaignThunk, createCampaignThunk, updateCampaignThunk, selectCampaigns, selectCampaignsLoading } from '@/store/slices/campaigns';
import { fetchClients, selectClients } from '@/store/slices/clients';

interface CampaignItem {
  id: string;
  name: string;
  campaign_type: string;
  status: string;
  budget: number | string | null;
  start_date: string | null;
  end_date: string | null;
  client_id: string;
  description?: string | null;
  campaign_goals?: string | null;
  target_audience?: string | null;
  created_at?: string;
}

export default function Campaigns() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const campaigns = useSelector((state: RootState) => selectCampaigns(state)) as unknown as CampaignItem[];
  const dataLoading = useSelector((state: RootState) => selectCampaignsLoading(state));
  const clients = useSelector((state: RootState) => selectClients(state));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    campaign_type: 'blogger_outreach',
    status: 'Planning',
    budget: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchCampaigns(1, 100) as any);
    dispatch(fetchClients(1, 100) as any);
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      campaign_type: 'blogger_outreach',
      status: 'Planning',
      budget: '',
      start_date: '',
      end_date: '',
      description: '',
    });
  };

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingCampaignId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCampaignId) {
      await dispatch(deleteCampaignThunk(deletingCampaignId) as any);
      setDeleteDialogOpen(false);
      setDeletingCampaignId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingCampaignId(null);
  };

  const handleEdit = (campaign: CampaignItem) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      client_id: campaign.client_id || '',
      campaign_type: campaign.campaign_type || 'blogger_outreach',
      status: campaign.status || 'Planning',
      budget: campaign.budget ? String(campaign.budget) : '',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      description: (campaign as any).description || '',
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCampaign(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blogger_outreach': return 'bg-purple-500';
      case 'linkedin_influencer': return 'bg-blue-500';
      case 'youtube_campaign': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (dataLoading && campaigns.length === 0) {
    return (
      <AdminLayout>
        <AdminPageLoader />
      </AdminLayout>
    );
  }

  // Helper to get client name by id
  const getClientName = (id: string) => {
    const client = clients.find((c: any) => c.id === id);
    return client ? (client.company_name || client.name) : 'N/A';
  };

  // Improved budget display: show as currency if set, else N/A
  const displayBudget = (budget: string | number | null | undefined) => {
    if (budget === null || budget === undefined || budget === '' || isNaN(Number(budget))) return 'N/A';
    return formatCurrency(Number(budget));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Manage your marketing campaigns</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingCampaign(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>View and manage active campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns yet. Click "Add Campaign" to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{getClientName(campaign.client_id)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(campaign.campaign_type)}>
                          {formatType(campaign.campaign_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{displayBudget(campaign.budget)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Encrypt the campaign id before using in URL
                            const encryptedId = base64Encode(campaign.id);
                            router.push(`/admin/campaigns/${encryptedId}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(campaign)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)}>
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

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Delete Campaign</h2>
              <p className="mb-4">Are you sure you want to delete this campaign? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={cancelDelete}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={confirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
              <DialogDescription>
                {editingCampaign ? 'Update campaign details' : 'Create a new marketing campaign'}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const payload = {
                  name: formData.name,
                  client_id: formData.client_id,
                  budget: formData.budget ? parseFloat(formData.budget) : 0,
                  campaign_type: formData.campaign_type,
                  status: formData.status,
                  start_date: formData.start_date,
                  end_date: formData.end_date,
                  description: formData.description,
                  campaign_goals: '',
                  target_audience: ''
                };

                if (editingCampaign?.id) {
                  dispatch(updateCampaignThunk({ ...payload, id: editingCampaign.id }) as any);
                } else {
                  dispatch(createCampaignThunk(payload) as any);
                }
                setDialogOpen(false);
                resetForm();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name || client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Campaign Type *</Label>
                  <Select value={formData.campaign_type} onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blogger_outreach">Blogger Outreach</SelectItem>
                      <SelectItem value="linkedin_influencer">LinkedIn Influencer</SelectItem>
                      <SelectItem value="youtube_campaign">YouTube Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <PremiumDatePicker
                    label="Start Date"
                    value={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={(date: Date | null) => {
                      setFormData({ ...formData, start_date: date ? date.toISOString().slice(0, 10) : '' });
                    }}
                    minDate={new Date()}
                    maxDate={formData.end_date ? new Date(formData.end_date) : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <PremiumDatePicker
                    label="End Date"
                    value={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={(date: Date | null) => {
                      setFormData({ ...formData, end_date: date ? date.toISOString().slice(0, 10) : '' });
                    }}
                    minDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {/* Premium Textarea for better UX */}
                <div className="relative">
                  <textarea
                    id="description"
                    className="w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/30 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-200 resize-none min-h-[100px] max-h-[300px] font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the campaign goals, deliverables, or any special notes..."
                  />
                  <span className="absolute right-3 bottom-2 text-xs text-gray-400 select-none pointer-events-none">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => handleDialogClose()}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCampaign ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
