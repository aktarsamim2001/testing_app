'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit2, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Json } from '@/integrations/supabase/types';

interface SectionData {
  id: string;
  name: string;
  type: string;
  slides: any[];
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  template: string;
  sections: SectionData[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export default function Pages() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages((data as unknown as PageData[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    router.push('/admin/pages/create');
  };

  const handleEditClick = (page: PageData) => {
    router.push(`/admin/pages/edit/${page.id}`);
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });

      fetchPages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (page: PageData) => {
    try {
      const newStatus = page.status === 'draft' ? 'published' : 'draft';
      const { error } = await supabase
        .from('pages')
        .update({ status: newStatus })
        .eq('id', page.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Page ${newStatus}`,
      });

      fetchPages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update page status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your website pages with custom sections
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Page
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No pages created yet</p>
            <Button onClick={handleCreateClick} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{page.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="inline-block">/{page.slug}</span>
                      <span className="mx-2">•</span>
                      <span className="inline-block capitalize">{page.template}</span>
                      <span className="mx-2">•</span>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {page.status}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-2">
                      <strong>Sections ({page.sections.length}):</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {page.sections.map((section) => (
                        <span
                          key={section.id}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {section.name}
                          {section.slides.length > 0 && ` (${section.slides.length} slides)`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${page.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(page)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(page)}
                  >
                    {page.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
