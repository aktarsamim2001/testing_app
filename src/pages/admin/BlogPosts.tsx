"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from "next/navigation";
import AdminPageLoader from '@/components/admin/AdminPageLoader';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  published_at: string | null;
  created_at: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
}

export default function BlogPosts() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: '',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchPosts();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth');
    }
  }, [user, isAdmin, loading, router]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as unknown as BlogPost[]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts',
        variant: 'destructive'
      });
    } finally {
      setDataLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = formData.slug || generateSlug(formData.title);
    const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];

    try {
      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        status: formData.status,
        tags,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        author_id: user?.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert([postData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post created successfully'
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      tags: post.tags?.join(', ') || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Blog post deleted successfully'
      });
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      tags: '',
      meta_title: '',
      meta_description: ''
    });
    setEditingPost(null);
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

  if (dataLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
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
              <Button onClick={() => router.push('/admin/blog/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
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
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(post.created_at).toLocaleDateString()}
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
