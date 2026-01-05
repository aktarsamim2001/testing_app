"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogs, deleteBlogThunk, selectBlogs, selectBlogsLoading } from '@/store/slices/blogs';
import { encryptId } from '@/helpers/crypto';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Loading skeleton component
function AdminPageLoader() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-6" />
      <Card className="rounded-xl border bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlogPosts() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const posts = useSelector((state: RootState) => selectBlogs(state));
  const loading = useSelector((state: RootState) => selectBlogsLoading(state));

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchBlogs(1, 100) as any);
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    dispatch(deleteBlogThunk(id) as any);
  };

  const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      (post.tags && post.tags.toLowerCase().includes(q))
    );
  });

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
        <div className="flex items-center justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold">Blog Posts</h1>
        <p className="text-muted-foreground">Manage your blog content</p>
          </div>
           <Button onClick={() => router.push('/admin/blog/new')} className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
          </div>
        <Card className="rounded-xl border bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="font-semibold text-lg">All Blog Posts</h2>
                <p className="text-sm text-muted-foreground">View and manage your blog posts</p>
              </div>
                <Input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                />
            </div>
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No blog posts found</div>
              ) : filteredPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {Array.isArray(post.tags) && post.tags.length > 0 ? (
                          post.tags.map((tag: string) => (
                            <Badge key={tag.trim()} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))
                        ) : typeof post.tags === 'string' && post.tags.length > 0 ? (
                          post.tags.split(',').map((tag: string) => (
                            <Badge key={tag.trim()} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))
                        ) : null}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Created: {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</span>
                        <span>Published: {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0 sm:flex-col sm:items-end">
                      <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/blog/new?id=${encodeURIComponent(encryptId(post.id))}`)}>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}