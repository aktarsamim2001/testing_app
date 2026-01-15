"use client";

import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchSubscriptions, deleteSubscriptionThunk, selectSubscriptions, selectSubscriptionsLoading, selectSubscriptionsPagination, setSubscriptionNumber } from '@/store/slices/subscriptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const SubscriptionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const subscriptions = useAppSelector(selectSubscriptions);
  const loading = useAppSelector(selectSubscriptionsLoading);
  const pagination = useAppSelector(selectSubscriptionsPagination);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchSubscriptions(pagination.currentPage, pagination.perPage, debouncedSearch) as any);
  }, [dispatch, pagination.currentPage, pagination.perPage, debouncedSearch]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      console.debug('Subscriptions search:', search);
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    dispatch(setSubscriptionNumber(1));
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await dispatch(deleteSubscriptionThunk(confirmDeleteId) as any);
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
        variant: "success",
      });
      setConfirmDeleteId(null);
      dispatch(fetchSubscriptions(pagination.currentPage, pagination.perPage, debouncedSearch) as any);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">View and manage subscription plans</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push('/admin/subscriptions/create')}>
            + New Subscription
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>View and manage subscription plans</CardDescription>
              </div>
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Partnerships</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center p-6">Loading...</TableCell></TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center p-6 text-gray-400">No subscriptions found.</TableCell></TableRow>
                ) : (
                  subscriptions.map((sub: any, idx: number) => {
                    const name = sub.name || '-';
                    const type = sub.flag || 'Normal';
                    const price = sub.price || '-';
                    const partnerships = sub.partnerships !== null && sub.partnerships !== undefined && sub.partnerships !== '' ? sub.partnerships : '-';
                    const popular = sub.popular === 1 ? 'Yes' : 'No';
                    return (
                      <TableRow key={sub.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>{(pagination.currentPage - 1) * pagination.perPage + idx + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{name}</TableCell>
                        <TableCell>
                          <Badge className={type === 'Normal' ? 'bg-blue-900 text-white' : 'bg-purple-900 text-white'}>
                            {type}
                          </Badge>
                        </TableCell>
                        <TableCell>{price ? `$${price}` : '-'}</TableCell>
                        <TableCell>{partnerships}</TableCell>
                        <TableCell>{popular}</TableCell>
                        <TableCell>
                          <Badge className={sub.status === 1 ? 'bg-green-900 text-white px-2 py-1 rounded-full text-xs font-semibold' : 'text-gray-300 bg-gray-700 px-2 py-1 rounded-full text-xs font-semibold'}>
                            {sub.status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/subscriptions/edit/${sub.id}`)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(sub.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-2 sm:gap-4">
            {(() => {
              const start = (pagination.currentPage - 1) * pagination.perPage + 1;
              const end = Math.min(start + subscriptions.length - 1, pagination.totalRecords || (start + subscriptions.length - 1));
              const total = typeof pagination.totalRecords === 'number' && pagination.totalRecords >= 0 ? pagination.totalRecords : subscriptions.length;
              return (
                <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                  Showing {start} to {end} of {total} results
                </span>
              );
            })()}

            <nav className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => dispatch(setSubscriptionNumber(Math.max(1, pagination.currentPage - 1)))}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {(() => {
                const pages: Array<number | string> = [];
                const total = pagination.totalPages;
                const current = pagination.currentPage;
                if (total <= 5) {
                  for (let i = 1; i <= total; i++) pages.push(i);
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
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === current ? 'default' : 'outline'}
                      size="sm"
                      className={p === current ? 'bg-orange-500 text-white' : ''}
                      onClick={() => dispatch(setSubscriptionNumber(Number(p)))}
                      aria-current={p === current ? 'page' : undefined}
                    >
                      {p}
                    </Button>
                  )
                );
              })()}

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => dispatch(setSubscriptionNumber(Math.min(pagination.totalPages, pagination.currentPage + 1)))}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this subscription? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionList;
