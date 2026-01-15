"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  createBlogThunk,
  updateBlogThunk,
  selectBlogs,
  fetchBlogDetailsThunk,
  selectSelectedBlog,
  selectSelectedBlogLoading,
  fetchBlogs,
} from "@/store/slices/blogs";
import { selectAuthors, fetchAuthors } from "@/store/slices/authors";
import { selectBlogCategories, fetchBlogCategories } from "@/store/slices/blog-categories";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagsInput from "@/components/ui/TagsInput";
import { Textarea } from "@/components/ui/textarea";
import ReactSelect from "@/components/ui/ReactSelect";
import dynamic from "next/dynamic";
const TiptapEditor = dynamic(() => import("@/components/ui/TiptapEditor"), {
  ssr: false,
});
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { decryptId } from "@/helpers/crypto";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import FAQBuilder, { FAQ } from "@/components/admin/FAQBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/services/s3-upload";

export default function BlogPostWizard() {
  const [step, setStep] = useState(1);
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const encryptedId = searchParams.get("id");
  const editId = encryptedId ? decryptId(encryptedId) : null;
  const dispatch = useDispatch<AppDispatch>();

  const allBlogs = useSelector((state: RootState) => selectBlogs(state));
  const selectedBlog = useSelector((state: RootState) => selectSelectedBlog(state));
  const selectedBlogLoading = useSelector((state: RootState) => selectSelectedBlogLoading(state));
  const authors = useSelector((state: RootState) => selectAuthors(state));
  const blogCategories = useSelector((state: RootState) => selectBlogCategories(state));

  const initialFormData = {
    title: "",
    slug: "",
    excerpt: "",
    description: "",
    image: "",
    status: "Draft",
    tags: "",
    meta_title: "",
    meta_description: "",
    author_id: "",
    category_id: "",
    estimated_reading_time: "",
    meta_author: "",
    meta_keywords: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<{
    title?: string;
    author_id?: string;
    category_id?: string;
    description?: string;
    image?: string;
    excerpt?: string;
    tags?: string;
    meta_title?: string;
    meta_description?: string;
    meta_author?: string;
    meta_keywords?: string;
    estimated_reading_time?: string;
  }>({});

  useEffect(() => {
    dispatch(fetchAuthors(1, 100) as any);
    dispatch(fetchBlogCategories(1, 100) as any);
  }, [dispatch]);

  // Clear selected blog when component unmounts or when switching to create mode
  useEffect(() => {
    return () => {
      // Cleanup: clear selected blog when component unmounts
      // If you have a clearSelectedBlog action, dispatch it here
      // dispatch(clearSelectedBlog());
    };
  }, []);

  // Fetch blog details only when editId exists
  useEffect(() => {
    if (editId) {
      dispatch(fetchBlogDetailsThunk(editId) as any);
    }
  }, [editId, dispatch]);

  // Reset or populate form based on editId
  useEffect(() => {
    // If no editId, reset to initial state (Create mode)
    if (!editId) {
      setFormData(initialFormData);
      setImagePreview("");
      setFaqs([]);
      setImageFile(null);
      setStep(1);
      return;
    }

    // If editId exists and we have the blog data (Edit mode)
    if (editId && selectedBlog && selectedBlog.id === editId) {
      setFormData({
        title: selectedBlog.title,
        slug: selectedBlog.slug,
        excerpt: selectedBlog.excerpt,
        description: selectedBlog.description,
        image: selectedBlog.image,
        status: selectedBlog.status,
        tags: selectedBlog.tags,
        meta_title: selectedBlog.meta_title,
        meta_description: selectedBlog.meta_description,
        author_id: selectedBlog.author_id,
        category_id: selectedBlog.category_id || "",
        estimated_reading_time: selectedBlog.estimated_reading_time,
        meta_author: selectedBlog.meta_author,
        meta_keywords: selectedBlog.meta_keywords,
      });
      setImagePreview(selectedBlog.image);
      if (selectedBlog.faq) {
        setFaqs(selectedBlog.faq.map((f, i) => ({ ...f, order_index: i })));
      }
      setStep(1);
    }
  }, [editId, selectedBlog]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  console.log("[BlogPostWizard] Rendered", { step, editId });

  const uploadImage = async () => {
    if (!imageFile) return formData.image;
    return `development/blog/${imageFile.name}`;
  };

  const handleSubmit = async () => {
    // Final validation before submit
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.author_id) newErrors.author_id = "Author is required.";
    if (!formData.category_id) newErrors.category_id = "Category is required.";
    if (!imagePreview) newErrors.image = "Blog image is required.";
    if (!formData.description.trim()) newErrors.description = "Content is required.";
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required.";
    
    const tagsArray = typeof formData.tags === "string"
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(formData.tags)
      ? formData.tags
      : [];
    if (tagsArray.length === 0) newErrors.tags = "At least one tag is required.";
    
    if (!formData.meta_title.trim()) newErrors.meta_title = "SEO Title is required.";
    if (!formData.meta_description.trim()) newErrors.meta_description = "SEO Description is required.";
    if (!formData.meta_author.trim()) newErrors.meta_author = "Meta Author is required.";
    if (!formData.meta_keywords.trim()) newErrors.meta_keywords = "Meta Keywords are required.";
    if (!formData.estimated_reading_time.trim()) newErrors.estimated_reading_time = "Estimated reading time is required.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      let tagsString = "";
      if (typeof formData.tags === "string") {
        tagsString = formData.tags;
      } else if (Array.isArray(formData.tags)) {
        tagsString = (formData.tags as string[]).join(",");
      }
      
      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        description: formData.description,
        image: imageUrl,
        status: formData.status,
        tags: tagsString,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt,
        author_id: formData.author_id,
        category_id: formData.category_id,
        estimated_reading_time: formData.estimated_reading_time || "5 min read",
        meta_author: formData.meta_author || formData.title,
        meta_keywords: formData.meta_keywords || formData.title,
        faq: faqs,
        published_at:
          formData.status?.toLowerCase() === "published"
            ? new Date().toISOString()
            : null,
      };
      
      if (editId) {
        await dispatch(
          updateBlogThunk({ ...postData, id: editId }) as any
        );
        toast.success("Blog post updated successfully");
      } else {
        await dispatch(createBlogThunk(postData) as any);
        toast.success("Blog post created successfully");
      }
      dispatch(fetchBlogs(1, 10, "") as any);
      setFormData(initialFormData);
      setImagePreview("");
      setFaqs([]);
      setImageFile(null);
      setStep(1);
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    const newErrors: typeof errors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required.";
      if (!formData.author_id) newErrors.author_id = "Author is required.";
      if (!formData.category_id) newErrors.category_id = "Category is required.";
      if (!imagePreview) newErrors.image = "Blog image is required.";
      if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required.";
    }
    if (step === 2) {
      if (!formData.description.trim())
        newErrors.description = "Content is required.";
      const tagsArray = typeof formData.tags === "string"
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(formData.tags)
        ? formData.tags
        : [];
      if (tagsArray.length === 0) newErrors.tags = "At least one tag is required.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStep(step + 1);
  };

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Title, author, and images",
    },
    { number: 2, title: "Content", description: "Write your blog post" },
    {
      number: 3,
      title: "FAQ & SEO",
      description: "Add FAQs and optimize for search",
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {editId ? "Edit Blog Post" : "Create Blog Post"}
            </h1>
            <p className="text-muted-foreground">
              {selectedBlogLoading
                ? "Loading blog details..."
                : editId
                ? "Update your blog post"
                : "Follow the wizard to create a complete blog post"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/blog")}
          >
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 ${
                      step > s.number ? "bg-primary" : "bg-muted"
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
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title)
                        setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    aria-invalid={!!errors.title}
                    placeholder="Enter blog post title"
                  />
                  {errors.title && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.title}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder={
                      formData.title
                        ? generateSlug(formData.title)
                        : "auto-generated-from-title"
                    }
                    readOnly={!!editId}
                    disabled={!!editId}
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">
                    Excerpt <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => {
                      setFormData({ ...formData, excerpt: e.target.value });
                      if (errors.excerpt)
                        setErrors((prev) => ({ ...prev, excerpt: undefined }));
                    }}
                    aria-invalid={!!errors.excerpt}
                    placeholder="Brief summary of your post"
                    rows={3}
                  />
                  {errors.excerpt && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.excerpt}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="author_id">
                    Author <span className="text-red-500">*</span>
                  </Label>
                  <ReactSelect
                    options={authors.map((author) => ({
                      value: author.id,
                      label: author.name,
                    }))}
                    value={
                      formData.author_id
                        ? {
                            value: formData.author_id,
                            label:
                              authors.find((a) => a.id === formData.author_id)
                                ?.name || "",
                          }
                        : null
                    }
                    onChange={(option) => {
                      setFormData({
                        ...formData,
                        author_id: option?.value || "",
                      });
                      if (errors.author_id)
                        setErrors((prev) => ({
                          ...prev,
                          author_id: undefined,
                        }));
                    }}
                    placeholder="Select an author"
                    isClearable
                  />
                  {errors.author_id && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.author_id}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="category_id">
                    Categories <span className="text-red-500">*</span>
                  </Label>
                  <ReactSelect
                    options={blogCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    value={
                      formData.category_id
                        ? {
                            value: formData.category_id,
                            label:
                              blogCategories.find((c) => c.id === formData.category_id)
                                ?.name || "",
                          }
                        : null
                    }
                    onChange={(option) => {
                      setFormData({
                        ...formData,
                        category_id: option?.value || "",
                      });
                      if (errors.category_id)
                        setErrors((prev) => ({
                          ...prev,
                          category_id: undefined,
                        }));
                    }}
                    placeholder="Select a category"
                    isClearable
                  />
                  {errors.category_id && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.category_id}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="image">
                    Blog Image <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    aria-invalid={!!errors.image}
                  />
                  {errors.image && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.image}
                    </div>
                  )}
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
                      <Label htmlFor="description">
                        Content <span className="text-red-500">*</span>
                      </Label>
                      <TiptapEditor
                        value={formData.description}
                        onChange={(value: string) => {
                          setFormData({ ...formData, description: value });
                          if (errors.description)
                            setErrors((prev) => ({
                              ...prev,
                              description: undefined,
                            }));
                        }}
                      />
                      {errors.description && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.description}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        You can format your text, add links, lists, and more.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Estimated reading time:{" "}
                        {formData.estimated_reading_time || "5"} min
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tags">
                        Tags <span className="text-red-500">*</span>
                      </Label>
                      <TagsInput
                        value={
                          typeof formData.tags === "string"
                            ? formData.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                            : Array.isArray(formData.tags)
                            ? formData.tags
                            : []
                        }
                        onChange={(tagsArr) => {
                          setFormData({ ...formData, tags: tagsArr.join(",") });
                          if (errors.tags)
                            setErrors((prev) => ({ ...prev, tags: undefined }));
                        }}
                        placeholder="Type and press enter"
                      />
                      {errors.tags && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.tags}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <Card>
                      <CardContent className="prose max-w-none p-6">
                        <h1>{formData.title || "Your Title Here"}</h1>
                        {formData.excerpt && (
                          <p className="lead">{formData.excerpt}</p>
                        )}
                        <div className="whitespace-pre-wrap">
                          {formData.description ||
                            "Your content will appear here..."}
                        </div>
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
                    <Label htmlFor="meta_title">
                      SEO Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => {
                        setFormData({ ...formData, meta_title: e.target.value });
                        if (errors.meta_title)
                          setErrors((prev) => ({ ...prev, meta_title: undefined }));
                      }}
                      aria-invalid={!!errors.meta_title}
                      placeholder={
                        formData.title || "Leave empty to use post title"
                      }
                    />
                    {errors.meta_title && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.meta_title}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="meta_description">
                      SEO Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          meta_description: e.target.value,
                        });
                        if (errors.meta_description)
                          setErrors((prev) => ({ ...prev, meta_description: undefined }));
                      }}
                      aria-invalid={!!errors.meta_description}
                      placeholder={
                        formData.excerpt || "Leave empty to use excerpt"
                      }
                      rows={3}
                    />
                    {errors.meta_description && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.meta_description}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="meta_author">
                      Meta Author <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meta_author"
                      value={formData.meta_author}
                      onChange={(e) => {
                        setFormData({ ...formData, meta_author: e.target.value });
                        if (errors.meta_author)
                          setErrors((prev) => ({ ...prev, meta_author: undefined }));
                      }}
                      aria-invalid={!!errors.meta_author}
                      placeholder="Author name for meta tags"
                    />
                    {errors.meta_author && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.meta_author}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="meta_keywords">
                      Meta Keywords <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => {
                        setFormData({ ...formData, meta_keywords: e.target.value });
                        if (errors.meta_keywords)
                          setErrors((prev) => ({ ...prev, meta_keywords: undefined }));
                      }}
                      aria-invalid={!!errors.meta_keywords}
                      placeholder="Comma-separated keywords for SEO"
                    />
                    {errors.meta_keywords && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.meta_keywords}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estimated_reading_time">
                      Estimated Reading Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="estimated_reading_time"
                      type="number"
                      value={formData.estimated_reading_time}
                      onChange={(e) => {
                        setFormData({ ...formData, estimated_reading_time: e.target.value });
                        if (errors.estimated_reading_time)
                          setErrors((prev) => ({ ...prev, estimated_reading_time: undefined }));
                      }}
                      aria-invalid={!!errors.estimated_reading_time}
                      placeholder="Reading time in minutes"
                      min="1"
                    />
                    {errors.estimated_reading_time && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.estimated_reading_time}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
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
                  {isSubmitting
                    ? editId
                      ? "Updating..."
                      : "Creating..."
                    : editId
                    ? "Update Post"
                    : "Create Post"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}