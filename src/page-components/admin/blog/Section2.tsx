'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface SectionData {
  id: string;
  name: string;
  type: string;
  slides: SlideData[];
}

interface SlideData {
  id: string;
  title: string;
  content: string;
  order: number;
  subtitle?: string;
  description?: string;
  button1Text?: string;
  button2Text?: string;
  image?: string;
  button1Url?: string;
  button2Url?: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  date?: string;
  readTime?: string;
  authorName?: string;
  authorImage?: string;
}

interface Section2Props {
  section: SectionData;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: Partial<SlideData>) => void;
  addSlide: (sectionId: string) => void;
  removeSlide?: (sectionId: string, slideId: string) => void;
  showButton?: boolean;
}

export default function Section2({
  section,
  loading,
  updateSlide,
  addSlide,
  removeSlide,
  showButton = true,
}: Section2Props) {
  const handleCategoryChange = (slideId: string, categoryIndex: number, value: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCategories = [...((slide as any).categories || [])];
    if (!updatedCategories[categoryIndex]) {
      updatedCategories[categoryIndex] = { id: `cat-${Date.now()}`, name: '' };
    }
    updatedCategories[categoryIndex].name = value;
    updateSlide(section.id, slideId, { categories: updatedCategories } as any);
  };

  const addCategory = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newCategories = [...((slide as any).categories || []), { id: `cat-${Date.now()}`, name: '' }];
    updateSlide(section.id, slideId, { categories: newCategories } as any);
  };

  const removeCategory = (slideId: string, categoryIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCategories = (slide as any).categories?.filter((_: any, i: number) => i !== categoryIndex) || [];
    updateSlide(section.id, slideId, { categories: updatedCategories } as any);
  };

  const handleBlogChange = (slideId: string, blogIndex: number, updates: Partial<BlogItem>) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedBlogs = [...((slide as any).blogs || [])];
    updatedBlogs[blogIndex] = { ...updatedBlogs[blogIndex], ...updates };
    updateSlide(section.id, slideId, { blogs: updatedBlogs } as any);
  };

  const addBlog = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newBlog: BlogItem = {
      id: `blog-${Date.now()}`,
      title: '',
      excerpt: '',
      category: '',
      date: '',
      readTime: '',
      authorName: '',
    };
    const newBlogs = [...((slide as any).blogs || []), newBlog];
    updateSlide(section.id, slideId, { blogs: newBlogs } as any);
  };

  const removeBlog = (slideId: string, blogIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedBlogs = (slide as any).blogs?.filter((_: any, i: number) => i !== blogIndex) || [];
    updateSlide(section.id, slideId, { blogs: updatedBlogs } as any);
  };

  return (
    <div className="space-y-4">
      {section.slides.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => addSlide(section.id)}
          disabled={loading}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Initialize Section
        </Button>
      ) : (
        section.slides.map((slide, slideIndex) => (
          <Card key={slide.id} className="p-4 relative">
            {removeSlide && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSlide(section.id, slide.id)}
                disabled={loading}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <CardContent className="space-y-4">
              {/* Section Title */}
              <div className="space-y-2">
                <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                  Section Title
                </Label>
                <Input
                  id={`slide-title-${slide.id}`}
                  placeholder="e.g., Filter by Category"
                  value={slide.title}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { title: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor={`slide-subtitle-${slide.id}`} className="text-sm font-medium">
                  Subtitle
                </Label>
                <Input
                  id={`slide-subtitle-${slide.id}`}
                  placeholder="Enter subtitle"
                  value={slide.subtitle || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { subtitle: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>

              {/* Categories Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Category Buttons</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCategory(slide.id)}
                    disabled={loading}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-2">
                  {((slide as any).categories || []).map((category: CategoryItem, categoryIndex: number) => (
                    <div key={categoryIndex} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="e.g., Blogger Outreach, SaaS Growth, Content Marketing"
                          value={category.name}
                          onChange={(e) =>
                            handleCategoryChange(slide.id, categoryIndex, e.target.value)
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(slide.id, categoryIndex)}
                        disabled={loading}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {((slide as any).categories || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No categories added yet. Add one to get started.
                  </p>
                )}
              </div>

              {/* Blog Posts Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Blog Posts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addBlog(slide.id)}
                    disabled={loading}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Post
                  </Button>
                </div>

                <div className="space-y-3">
                  {((slide as any).blogs || []).map((blog: BlogItem, blogIndex: number) => (
                    <Card key={blogIndex} className="p-3 bg-muted/50">
                      <div className="space-y-2">
                        {/* Blog Title */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Blog Title</Label>
                          <Input
                            placeholder="e.g., How to Scale Your SaaS Through Blogger Outreach in 2025"
                            value={blog.title}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { title: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Category Badge</Label>
                          <Input
                            placeholder="e.g., Blogger Outreach, LinkedIn Marketing"
                            value={blog.category}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { category: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Publish Date</Label>
                          <Input
                            placeholder="e.g., 1/17/2025"
                            value={blog.date || ''}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { date: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>

                        {/* Read Time */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Read Time (minutes)</Label>
                          <Input
                            placeholder="e.g., 8"
                            value={blog.readTime || ''}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { readTime: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Excerpt</Label>
                          <Textarea
                            placeholder="Brief description of the blog post"
                            value={blog.excerpt}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { excerpt: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs min-h-[60px]"
                          />
                        </div>

                        {/* Author Name */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Author Name</Label>
                          <Input
                            placeholder="e.g., Sarah Mitchell"
                            value={blog.authorName || ''}
                            onChange={(e) =>
                              handleBlogChange(slide.id, blogIndex, { authorName: e.target.value })
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>

                        {/* Featured Image */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Featured Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleBlogChange(slide.id, blogIndex, { image: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={loading}
                            className="text-xs"
                          />
                          {blog.image && (
                            <p className="text-xs text-green-600">✓ Image uploaded</p>
                          )}
                        </div>

                        {/* Author Avatar Image */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Author Avatar</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleBlogChange(slide.id, blogIndex, { authorImage: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={loading}
                            className="text-xs"
                          />
                          {blog.authorImage && (
                            <p className="text-xs text-green-600">✓ Avatar uploaded</p>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlog(slide.id, blogIndex)}
                          disabled={loading}
                          className="text-xs text-red-500 hover:text-red-700 w-full"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove Post
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Add Slide Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => addSlide(section.id)}
                disabled={loading}
                className="w-full mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {/* Add New Slide Button */}
      {section.slides.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => addSlide(section.id)}
          disabled={loading}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Slide
        </Button>
      )}
    </div>
  );
}
