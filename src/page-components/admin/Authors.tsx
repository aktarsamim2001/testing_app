"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, CircleUserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import AuthorDialog from '@/components/admin/AuthorDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchAuthors, 
  deleteAuthorThunk, 
  selectAuthors, 
  selectAuthorsLoading, 
  selectAuthorsPagination, 
  setPage 
} from '@/store/slices/authors';

interface Author {
  id: string;
  name: string;
  image: string;
  about: string | null;
  status?: number;
}

export default function Authors() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  
  const authors = useSelector(selectAuthors);
  const dataLoading = useSelector(selectAuthorsLoading);
  const pagination = useSelector((state: RootState) => selectAuthorsPagination(state));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const loadAuthors = useCallback(() => {
    dispatch(fetchAuthors(1, 100));
  }, [dispatch]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAuthors();
    }
  }, [user, isAdmin, loadAuthors]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, router]);

  const handleDelete = useCallback(async () => {
    if (deletingAuthor) {
      await dispatch(deleteAuthorThunk(deletingAuthor.id));
      setDeleteDialogOpen(false);
      setDeletingAuthor(null);
    }
  }, [dispatch, deletingAuthor]);

  const openDeleteDialog = useCallback((author: Author) => {
    setDeletingAuthor(author);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingAuthor(null);
  }, []);

  const handleEdit = useCallback((author: Author) => {
    setEditingAuthor(author);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingAuthor(null);
  }, []);

  // Pagination handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      dispatch(setPage(page));
      dispatch(fetchAuthors(page, pagination.perPage));
    }
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
            <h1 className="text-3xl font-bold">Authors</h1>
            <p className="text-muted-foreground">Manage blog and content authors</p>
          </div>
          <Button 
            onClick={() => {
              setEditingAuthor(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Author
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
            <CardTitle>All Authors</CardTitle>
            <CardDescription>View and manage content authors</CardDescription>
             </div>
              <Input
                id="category-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter Author name"
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
            ) : authors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No authors yet. Click "Add Author" to get started.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>About</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author, idx) => (
                      <TableRow key={author.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{author.name}</TableCell>
                        <TableCell>
                          {author.image && author.image.trim() !== '' ? (
                            <img 
                              src={author.image}
                              alt={author.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '';
                                target.style.display = 'none';
                                target.parentElement?.querySelector('.profile-icon')?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {(!author.image || author.image.trim() === '') && (
                            <CircleUserRound className="w-10 h-10 text-gray-400 profile-icon" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {author.about ? author.about.substring(0, 50) + (author.about.length > 50 ? '...' : '') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {author.status === 1 ? (
                            <Badge className="font-semibold">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-400">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(author)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(author)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-end mt-6 gap-2 sm:gap-4">
                    <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                      Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to {((pagination.currentPage - 1) * pagination.perPage) + authors.length} of {typeof pagination.totalRecords === 'number' && pagination.totalRecords >= 0 ? pagination.totalRecords : authors.length} results
                    </span>
                    <nav className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end" aria-label="Pagination">
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
                        if (total <= 5) {
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
              </>
            )}
          </CardContent>
        </Card>

        <AuthorDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          author={editingAuthor}
        />

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-bold">{deletingAuthor?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2 pt-4">
              <AlertDialogCancel asChild>
                <Button variant="outline" size="sm" onClick={closeDeleteDialog}>Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
