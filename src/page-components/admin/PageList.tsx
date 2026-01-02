"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import { fetchPages, deletePageThunk, selectPages, selectPagesLoading, selectPagesPagination } from "@/store/slices/pages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Example: You can replace this with your own modal/form logic


import type { AppDispatch } from '@/store';

const PageList = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const pages = useSelector(selectPages);
  const loading = useSelector(selectPagesLoading);
  const pagination = useSelector(selectPagesPagination);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPages(pagination.currentPage, pagination.perPage));
  }, [dispatch, pagination.currentPage, pagination.perPage]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-muted-foreground">View and manage site pages</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push('/admin/pages/create')}>
            + New Page
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Pages</CardTitle>
                <CardDescription>View and manage site pages</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  id="page-search"
                  placeholder="Search pages..."
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                  // Add search logic if needed
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead className="text-right ">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center p-6">Loading...</TableCell></TableRow>
                ) : pages.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center p-6 text-gray-400">No pages found.</TableCell></TableRow>
                ) : (
                  pages.map((page: any, idx: number) => (
                    <TableRow key={page.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>{(pagination.currentPage - 1) * pagination.perPage + idx + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{page.title}</TableCell>
                      <TableCell>{page.slug}</TableCell>
                      <TableCell>{page.template}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            page.status === 1
                              ? "bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold"
                              : "text-gray-300 bg-gray-700 px-4 py-1 rounded-full text-xs font-semibold"
                          }
                        >
                          {page.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{page.created_at ? new Date(page.created_at).toLocaleString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/pages/edit/${page.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(page.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Improved Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 gap-4">
            <span className="text-sm text-muted-foreground">Page {pagination.currentPage} of {pagination.totalPages}</span>
            <nav className="flex items-center gap-1 select-none" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => dispatch(fetchPages(pagination.currentPage - 1, pagination.perPage))}
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
                        onClick={() => dispatch(fetchPages(Number(p), pagination.perPage))}
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
                onClick={() => dispatch(fetchPages(pagination.currentPage + 1, pagination.perPage))}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (confirmDeleteId) {
                await dispatch(deletePageThunk(confirmDeleteId));
                // Re-fetch the current page list after delete
                dispatch(fetchPages(pagination.currentPage, pagination.perPage));
                setConfirmDeleteId(null);
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default PageList;
