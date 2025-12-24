"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import AuthorDialog from '@/components/admin/AuthorDialog';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchAuthors, 
  deleteAuthorThunk, 
  selectAuthors, 
  selectAuthorsLoading 
} from '@/store/slices/authors';

interface Author {
  id: string;
  name: string;
  image: string;
  about: string | null;
}

export default function Authors() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  
  const authors = useSelector(selectAuthors);
  const dataLoading = useSelector(selectAuthorsLoading);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);

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
      router.push('/auth');
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
            <CardTitle>All Authors</CardTitle>
            <CardDescription>View and manage content authors</CardDescription>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>About</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell className="font-medium">{author.name}</TableCell>
                      <TableCell>
                        {author.image && author.image.trim() !== '' ? (
                          <img 
                            src={author.image}
                            alt={author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {author.about ? author.about.substring(0, 50) + (author.about.length > 50 ? '...' : '') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {author.status === 1 ? (
                          <span className="text-green-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-gray-400">Inactive</span>
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
            )}
          </CardContent>
        </Card>

        <AuthorDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          author={editingAuthor}
        />

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Delete Author</h2>
              <p className="mb-4">Are you sure you want to delete <span className="font-bold">{deletingAuthor?.name}</span>? This action cannot be undone.</p>
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
