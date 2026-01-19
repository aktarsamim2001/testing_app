"use client";

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBlogs, deleteBlogThunk, selectBlogs, selectBlogsLoading, selectBlogsPagination, setPage } from '@/store/slices/blogs';
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
  const pagination = useSelector((state: RootState) => selectBlogsPagination(state));

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search]);

  // Fetch blogs whenever page/perPage/search changes
  useEffect(() => {
    const page = pagination.currentPage || 1;
    const perPage = pagination.perPage || 10;
    dispatch(fetchBlogs(page, perPage, debouncedSearch) as any);
  }, [dispatch, pagination.currentPage, pagination.perPage, debouncedSearch]);

  const handleDelete = async (id: string) => {
    dispatch(deleteBlogThunk(id) as any);
  };

  // If server-side search is used, posts already reflect the query; keep client-side fallback
  const filteredPosts = posts.filter(post => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      (post.tags && String(post.tags).toLowerCase().includes(q))
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
              ) : (
                <>
                  {filteredPosts.map((post) => (
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

                {/* Pagination controls */}
                {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-4">
                  {(() => {
                    const start = (pagination.currentPage - 1) * pagination.perPage + 1;
                    const end = Math.min(start + posts.length - 1, pagination.totalRecords || posts.length);
                    const total = typeof pagination.totalRecords === 'number' && pagination.totalRecords >= 0 ? pagination.totalRecords : posts.length;
                    return (
                      <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                        Showing {start} to {end} of {total} results
                      </span>
                    );
                  })()}
                  <nav
                    className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() => dispatch(setPage(Math.max(1, pagination.currentPage - 1)))}
                      aria-label="Previous page"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Button>
                    {(() => {
                      const pages: (number | string)[] = [];
                      const total = pagination.totalPages || 1;
                      const current = pagination.currentPage || 1;
                      if (total <= 5) {
                        for (let i = 1; i <= total; i++) pages.push(i);
                      } else {
                        if (current <= 3) pages.push(1,2,3,4,'...', total);
                        else if (current >= total - 2) pages.push(1, '...', total-3, total-2, total-1, total);
                        else pages.push(1, '...', current-1, current, current+1, '...', total);
                      }
                      return pages.map((p, idx) =>
                        p === '...' ? (
                          <span key={'ellipsis-'+idx} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === current ? 'default' : 'outline'}
                            size="sm"
                            className={p === current ? 'bg-orange-500 text-white' : ''}
                            onClick={() => dispatch(setPage(Number(p)))}
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
                      onClick={() => dispatch(setPage(Math.min(pagination.totalPages, (pagination.currentPage || 1) + 1)))}
                      aria-label="Next page"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Button>
                  </nav>
                </div>
                )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}