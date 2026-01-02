"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createBlogThunk, updateBlogThunk, selectBlogs } from '@/store/slices/blogs';
import { selectAuthors, fetchAuthors } from '@/store/slices/authors';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TagsInput from '@/components/ui/TagsInput';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';
// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/ui/TiptapEditor'), { ssr: false });
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from "next/navigation";
import { decryptId } from '@/helpers/crypto';
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
  const encryptedId = searchParams.get('id');
  const editId = encryptedId ? decryptId(encryptedId) : null;
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
    tags: '', // will be handled as array in UI, string for backend
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
  const [errors, setErrors] = useState<{
    title?: string;
    author_id?: string;
    description?: string;
  }>({});

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
        setFaqs(editingBlog.faq.map((f, i) => ({ ...f, order_index: i })));
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

  // S3 upload temporarily disabled, just use file path
  const uploadImage = async () => {
    if (!imageFile) return formData.image;
    // S3 upload disabled, just use file path
    // const s3Url = await uploadToS3(imageFile, "development/blog");
    // setFormData((prev) => ({ ...prev, image: s3Url }));
    // return s3Url;
    return `development/blog/${imageFile.name}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage(); // will just set file path for now
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
        await dispatch(createBlogThunk(postData) as any);
        toast.success('Blog post created successfully');
      }
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

  // Stepper validation for Next button
  const handleNextStep = () => {
    const newErrors: typeof errors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required.';
      if (!formData.author_id) newErrors.author_id = 'Author is required.';
    }
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Content is required.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStep(step + 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title, author, and images' },
    { number: 2, title: 'Content', description: 'Write your blog post' },
    { number: 3, title: 'FAQ & SEO', description: 'Add FAQs and optimize for search' }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
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
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    aria-invalid={!!errors.title}
                    placeholder="Enter blog post title"
                  />
                  {errors.title && (
                    <div className="text-red-500 text-xs mt-1">{errors.title}</div>
                  )}
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
                  <Label htmlFor="author_id">Author <span className="text-red-500">*</span></Label>
                  <Select value={formData.author_id} onValueChange={(value) => {
                    setFormData({ ...formData, author_id: value });
                    if (errors.author_id) setErrors((prev) => ({ ...prev, author_id: undefined }));
                  }}>
                    <SelectTrigger aria-invalid={!!errors.author_id}>
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
                  {errors.author_id && (
                    <div className="text-red-500 text-xs mt-1">{errors.author_id}</div>
                  )}
                </div>

                  <div>
                  <Label htmlFor="author_id">Categories <span className="text-red-500">*</span></Label>
                  <Select value={formData.author_id} onValueChange={(value) => setFormData({ ...formData, author_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an category" />
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
                      <Label htmlFor="description">Content <span className="text-red-500">*</span></Label>
                      <TiptapEditor
                        value={formData.description}
                        onChange={(value: string) => {
                          setFormData({ ...formData, description: value });
                          if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                        }}
                      />
                      {errors.description && (
                        <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        You can format your text, add links, lists, and more.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Estimated reading time: {formData.estimated_reading_time || '5'} min
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <TagsInput
                        value={
                          typeof formData.tags === 'string'
                            ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : Array.isArray(formData.tags)
                              ? formData.tags
                              : []
                        }
                        onChange={tagsArr => setFormData({ ...formData, tags: tagsArr.join(',') })}
                        placeholder="Type and press enter"
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
                  <h1 className="font-semibold text-sm">SEO Settings</h1>
                  
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
                <Button onClick={handleNextStep}>
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
