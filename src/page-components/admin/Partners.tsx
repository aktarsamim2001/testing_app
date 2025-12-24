"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import PartnerDialog from '@/components/admin/PartnerDialog';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchPartners, 
  deletePartnerThunk, 
  selectPartners, 
  selectPartnersLoading, 
  selectPartnersPagination
} from '@/store/slices/partners';

interface Partner {
  id: string;
  name: string;
  email: string;
  channel_type: string;
  platform_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  categories: string[] | null;
  notes: string | null;
  status: number;
}

export default function Partners() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  
  const partners = useSelector(selectPartners);
  const dataLoading = useSelector(selectPartnersLoading);
  const pagination = useSelector(selectPartnersPagination);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  const loadPartners = useCallback((page = 1, limit = 10) => {
    dispatch(fetchPartners(page, limit));
  }, [dispatch]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    if (user && isAdmin) {
      loadPartners(page, perPage);
    }
  }, [user, isAdmin, loadPartners, page, perPage]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth');
    }
  }, [user, isAdmin, loading, router]);

  const handleDelete = useCallback(async () => {
    if (deletingPartner) {
      await dispatch(deletePartnerThunk(deletingPartner.id));
      setDeleteDialogOpen(false);
      setDeletingPartner(null);
    }
  }, [dispatch, deletingPartner]);

  const openDeleteDialog = useCallback((partner: Partner) => {
    setDeletingPartner(partner);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingPartner(null);
  }, []);

  const handleEdit = useCallback((partner: Partner) => {
    setEditingPartner(partner);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingPartner(null);
  }, []);

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'blogger': return 'bg-purple-500';
      case 'linkedin': return 'bg-blue-500';
      case 'youtube': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

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

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Partners & Influencers</h1>
            <p className="text-muted-foreground">Manage your influencer network</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>View and manage influencer partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partners yet. Click "Add Partner" to get started.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>
                          <Badge className={getChannelColor(partner.channel_type)}>
                            {partner.channel_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.platform_handle || 'N/A'}</TableCell>
                        <TableCell>{formatNumber(partner.follower_count)}</TableCell>
                        <TableCell>{partner.engagement_rate ? `${partner.engagement_rate}%` : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(partner)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(partner)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <PartnerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          partner={editingPartner}
        />

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Delete Partner</h2>
              <p className="mb-4">Are you sure you want to delete <span className="font-bold">{deletingPartner?.name}</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={closeDeleteDialog}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
