"use client";

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import AuthorDialog from '@/components/admin/AuthorDialog';
import FAQBuilder, { FAQ } from '@/components/admin/FAQBuilder';
import ImageUpload from '@/components/admin/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BlogPostWizard() {
  const [step, setStep] = useState(1);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    status: 'draft',
    tags: '',
    meta_title: '',
    meta_description: '',
    author_id: '',
    reading_time: 5
  });

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      const readingTime = calculateReadingTime(formData.content);

      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        thumbnail_url: formData.thumbnail_url,
        status: formData.status,
        tags,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        author_id: formData.author_id || null,
        reading_time: readingTime,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      const { data: post, error: postError } = await supabase
        .from('blog_posts' as any)
        .insert([postData])
        .select()
        .single();

      if (postError) throw postError;

      if (faqs.length > 0 && post) {
        const faqData = faqs.map(faq => ({
          blog_post_id: (post as any).id,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index
        }));

        const { error: faqError } = await supabase
          .from('blog_post_faqs' as any)
          .insert(faqData);

        if (faqError) throw faqError;
      }

      toast({
        title: 'Success',
        description: 'Blog post created successfully'
      });

      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Blog post creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create blog post',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title, author, and images' },
    { number: 2, title: 'Content', description: 'Write your blog post' },
    { number: 3, title: 'FAQ & SEO', description: 'Add FAQs and optimize for search' }
  ];

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Blog Post</h1>
            <p className="text-muted-foreground">Follow the wizard to create a complete blog post</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 ${
                      step > s.number ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter blog post title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={formData.title ? generateSlug(formData.title) : 'auto-generated-from-title'}
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of your post"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Author</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAuthorDialogOpen(true)}
                    >
                      {formData.author_id ? 'Change Author' : 'Select Author'}
                    </Button>
                  </div>
                  {formData.author_id && (
                    <div className="text-sm text-muted-foreground">Author selected</div>
                  )}
                </div>

                <ImageUpload
                  label="Thumbnail Image"
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your blog post content here..."
                        rows={15}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Estimated reading time: {calculateReadingTime(formData.content)} min
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="marketing, social media, influencer"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <Card>
                      <CardContent className="prose max-w-none p-6">
                        <h1>{formData.title || 'Your Title Here'}</h1>
                        {formData.excerpt && <p className="lead">{formData.excerpt}</p>}
                        <div className="whitespace-pre-wrap">{formData.content || 'Your content will appear here...'}</div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <FAQBuilder faqs={faqs} onChange={setFaqs} />

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">SEO Settings</h3>
                  
                  <div>
                    <Label htmlFor="meta_title">SEO Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder={formData.title || 'Leave empty to use post title'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">SEO Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder={formData.excerpt || 'Leave empty to use excerpt'}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <AuthorDialog
          open={authorDialogOpen}
          onOpenChange={setAuthorDialogOpen}
          onAuthorSelect={(authorId) => setFormData({ ...formData, author_id: authorId })}
        />
      </div>
    </AdminLayout>
  );
}
