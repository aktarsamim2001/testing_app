"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { encode as base64Encode } from '@/lib/utils';
import { useRouter } from "next/navigation";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCampaigns, deleteCampaignThunk, createCampaignThunk, updateCampaignThunk, selectCampaigns, selectCampaignsLoading, selectCampaignsPagination } from '@/store/slices/campaigns';
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
  const pagination = useSelector((state: RootState) => selectCampaignsPagination(state));
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
  const [errors, setErrors] = useState<{
    name?: string;
    client_id?: string;
    campaign_type?: string;
  }>({});
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search]);

  useEffect(() => {
    dispatch(fetchCampaigns(pagination.currentPage, pagination.perPage, debouncedSearch) as any);
    dispatch(fetchClients(1, 100) as any);
  }, [dispatch, pagination.currentPage, pagination.perPage, debouncedSearch]);
  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      dispatch(fetchCampaigns(page, pagination.perPage, debouncedSearch) as any);
    }
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>View and manage active campaigns</CardDescription>
              </div>
              <Input
                id="campaign-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Optionally reset page to 1 if you add page state
                }}
                placeholder="Search campaigns by name..."
                className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
              />
            </div>
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
                      <TableCell>
                        {campaign.budget}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            router.push(`/admin/campaigns/${campaign.id}`);
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

        {/* Improved Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 gap-4">
            {(() => {
              const start = (pagination.currentPage - 1) * pagination.perPage + 1;
              const end = start + campaigns.length - 1;
              const total = (typeof pagination.totalResults === 'number' && pagination.totalResults >= 0)
                ? pagination.totalResults
                : campaigns.length;
              return (
                <span className="text-sm text-muted-foreground">
                  Showing {start} to {end} of {total} results
                </span>
              );
            })()}
            <nav className="flex items-center gap-1 select-none" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {(() => {
                const pages = [];
                const total = pagination.totalPages;
                const current = pagination.currentPage;
                if (total <= 6) {
                  for (let i = 1; i <= total; i++) {
                    pages.push(i);
                  }
                } else {
                  if (current <= 3) {
                    pages.push(1, 2, 3, 4, '...', total);
                  } else if (current >= total - 2) {
                    pages.push(1, '...', total - 3, total - 2, total - 1, total);
                  } else {
                    pages.push(1, '...', current - 1, current, current + 1, '...', total);
                  }
                }
                return pages.map((p, idx) =>
                  p === '...'
                    ? <span key={"ellipsis-" + idx} className="px-2 text-muted-foreground">...</span>
                    : <Button
                        key={p}
                        variant={p === current ? "default" : "outline"}
                        size="sm"
                        className={p === current ? "bg-orange-500 text-white" : ""}
                        onClick={() => handlePageChange(Number(p))}
                        aria-current={p === current ? "page" : undefined}
                      >
                        {p}
                      </Button>
                );
              })()}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) cancelDelete(); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this campaign? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} >Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                const newErrors: typeof errors = {};
                if (!formData.name.trim()) newErrors.name = 'Campaign name is required.';
                if (!formData.client_id) newErrors.client_id = 'Client is required.';
                if (!formData.campaign_type) newErrors.campaign_type = 'Campaign type is required.';
                setErrors(newErrors);
                if (Object.keys(newErrors).length > 0) return;
                const payload = {
                  name: formData.name,
                  client_id: formData.client_id,
                  budget: formData.budget ? String(formData.budget) : '',
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
                <Label htmlFor="name">Campaign Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  aria-invalid={!!errors.name}
                  // required removed for custom validation only
                />
                {errors.name && (
                  <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client <span className="text-red-500">*</span></Label>
                  <Select value={formData.client_id} onValueChange={(value) => {
                    setFormData({ ...formData, client_id: value });
                    if (errors.client_id) setErrors((prev) => ({ ...prev, client_id: undefined }));
                  }}>
                    <SelectTrigger aria-invalid={!!errors.client_id}>
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
                  {errors.client_id && (
                    <div className="text-red-500 text-xs mt-1">{errors.client_id}</div>
                  )}
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
                  <Label htmlFor="campaign_type">Campaign Type <span className="text-red-500">*</span></Label>
                  <Select value={formData.campaign_type} onValueChange={(value) => {
                    setFormData({ ...formData, campaign_type: value });
                    if (errors.campaign_type) setErrors((prev) => ({ ...prev, campaign_type: undefined }));
                  }}>
                    <SelectTrigger aria-invalid={!!errors.campaign_type}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blogger_outreach">Blogger Outreach</SelectItem>
                      <SelectItem value="linkedin_influencer">LinkedIn Influencer</SelectItem>
                      <SelectItem value="youtube_campaign">YouTube Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.campaign_type && (
                    <div className="text-red-500 text-xs mt-1">{errors.campaign_type}</div>
                  )}
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
                  <Textarea
                    id="description"
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
