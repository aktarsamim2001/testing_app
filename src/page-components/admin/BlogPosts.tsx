"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogs, deleteBlogThunk, selectBlogs, selectBlogsLoading } from '@/store/slices/blogs';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import AdminPageLoader from '@/components/admin/AdminPageLoader';
import toast from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  status: string;
  published_at: string | null;
  created_at?: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  author_id: string;
  image: string;
  estimated_reading_time: string;
}

export default function BlogPosts() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const posts = useSelector((state: RootState) => selectBlogs(state));
  const loading = useSelector((state: RootState) => selectBlogsLoading(state));

  useEffect(() => {
    dispatch(fetchBlogs(1, 100) as any);
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    dispatch(deleteBlogThunk(id) as any);
  };

  if (loading && posts.length === 0) {
    return (
      <AdminLayout>
        <AdminPageLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your blog content</p>
          </div>
          <Button onClick={() => router.push('/admin/blog/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No blog posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {post.title}
                        <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
                      {post.tags && typeof post.tags === 'string' && post.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {post.tags.split(',').map((tag) => (
                            <Badge key={tag.trim()} variant="outline">{tag.trim()}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/blog/new?id=${post.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex justify-end gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)}>
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Created: {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                    {post.published_at && ` • Published: ${new Date(post.published_at).toLocaleDateString()}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
