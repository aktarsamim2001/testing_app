"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createBlogThunk, updateBlogThunk, selectBlogs } from '@/store/slices/blogs';
import { selectAuthors, fetchAuthors } from '@/store/slices/authors';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import FAQBuilder, { FAQ } from '@/components/admin/FAQBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { uploadToS3 } from '@/services/s3-upload';

export default function BlogPostWizard() {
  const [step, setStep] = useState(1);
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const editId = searchParams.get('id');
  const dispatch = useDispatch<AppDispatch>();

  const allBlogs = useSelector((state: RootState) => selectBlogs(state));
  const authors = useSelector((state: RootState) => selectAuthors(state));
  const editingBlog = editId ? allBlogs.find(b => b.id === editId) : null;

  const initialFormData = {
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    image: '',
    status: 'Draft',
    tags: '',
    meta_title: '',
    meta_description: '',
    author_id: '',
    estimated_reading_time: '',
    meta_author: '',
    meta_keywords: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    dispatch(fetchAuthors(1, 100) as any);
  }, [dispatch]);

  // Reset form state when switching between create and edit mode
  useEffect(() => {
    if (editingBlog) {
      setFormData({
        title: editingBlog.title,
        slug: editingBlog.slug,
        excerpt: editingBlog.excerpt,
        description: editingBlog.description,
        image: editingBlog.image,
        status: editingBlog.status,
        tags: editingBlog.tags,
        meta_title: editingBlog.meta_title,
        meta_description: editingBlog.meta_description,
        author_id: editingBlog.author_id,
        estimated_reading_time: editingBlog.estimated_reading_time,
        meta_author: editingBlog.meta_author,
        meta_keywords: editingBlog.meta_keywords
      });
      setImagePreview(editingBlog.image);
      if (editingBlog.faq) {
        setFaqs(editingBlog.faq);
      }
    } else {
      setFormData(initialFormData);
      setImagePreview("");
      setFaqs([]);
      setImageFile(null);
    }
    setStep(1);
  }, [editingBlog]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

    console.log('[BlogPostWizard] Rendered', { step, editId });

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    try {
      console.log('[BlogPostWizard] Starting image upload', { imageFile });
      const s3Url = await uploadToS3(imageFile, "development/blog");
      setFormData((prev) => ({
        ...prev,
        image: s3Url,
      }));
      console.log('[BlogPostWizard] Image uploaded', { s3Url });
      return s3Url;
    } catch (error: any) {
      console.error('[BlogPostWizard] Image upload failed', error);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  const handleSubmit = async () => {
    console.log('[BlogPostWizard] handleSubmit called', { formData, editingBlog, step });
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    if (!formData.author_id) {
      toast.error('Author is required');
      return;
    }

    setIsSubmitting(true);
    console.log('[BlogPostWizard] Submitting form', { formData, faqs, imageFile });
    try {
      const slug = formData.slug || generateSlug(formData.title);
      let imageUrl = formData.image;


      if (imageFile) {
        console.log('[BlogPostWizard] Before image upload');
        imageUrl = await uploadImage();
        console.log('[BlogPostWizard] After image upload', { imageUrl });
      }

      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        description: formData.description,
        image: imageUrl,
        status: formData.status,
        tags: formData.tags,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        author_id: formData.author_id,
        estimated_reading_time: formData.estimated_reading_time,
        meta_author: formData.meta_author,
        meta_keywords: formData.meta_keywords,
        faq: faqs,
        published_at: formData.status?.toLowerCase() === 'published' ? new Date().toISOString() : null
      };


      if (editingBlog?.id) {
        await dispatch(updateBlogThunk({ ...postData, id: editingBlog.id }) as any);
        toast.success('Blog post updated successfully');
      } else {
        console.log('[BlogPostWizard] Before dispatch createBlogThunk', { postData });
        await dispatch(createBlogThunk(postData) as any);
        console.log('[BlogPostWizard] After dispatch createBlogThunk');
        toast.success('Blog post created successfully');
      }

      // Reset form state after submit to prevent duplicate API calls
      setFormData(initialFormData);
      setImagePreview("");
      setFaqs([]);
      setImageFile(null);
      setStep(1);

      setTimeout(() => {
        router.push('/admin/blog');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save blog post');
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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Create Blog Post</h1>
            <p className="text-muted-foreground">Follow the wizard to create a complete blog post</p>
          </div>
           <Button variant="ghost" size="sm" onClick={() => router.push('/admin/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
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
                  <Label htmlFor="author_id">Author *</Label>
                  <Select value={formData.author_id} onValueChange={(value) => setFormData({ ...formData, author_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">Blog Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
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
                      <Label htmlFor="description">Content *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Write your blog post content here..."
                        rows={15}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Estimated reading time: {formData.estimated_reading_time || '5'} min
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
                        <div className="whitespace-pre-wrap">{formData.description || 'Your content will appear here...'}</div>
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
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
                  {isSubmitting ? (editingBlog ? 'Updating...' : 'Creating...') : (editingBlog ? 'Update Post' : 'Create Post')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
