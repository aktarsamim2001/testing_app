'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

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
  seo?: {
    title: string;
    author: string;
    description: string;
    keywords: string;
    image: string;
  };
}

// Template sections mapping
const TEMPLATE_SECTIONS: Record<string, SectionData[]> = {
  home: [
    {
      id: 'hero',
      name: 'Banner',
      type: 'hero',
      slides: [],
    },
    {
      id: 'channels',
      name: 'Packages',
      type: 'channels',
      slides: [],
    },
    {
      id: 'features',
      name: 'Section 3',
      type: 'features',
      slides: [],
    },
    {
      id: 'stats',
      name: 'Section 4',
      type: 'stats',
      slides: [],
    },
    {
      id: 'benefits',
      name: 'What You Can Do',
      type: 'benefits',
      slides: [],
    },
    {
      id: 'how-it-works',
      name: 'How It Works',
      type: 'how-it-works',
      slides: [],
    },
    {
      id: 'cta',
      name: 'Section 9',
      type: 'cta',
      slides: [],
    },
  ],
};

interface PageBuilderProps {
  pageId?: string;
}

export default function PageBuilder({ pageId }: PageBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: 'home',
    status: 'draft' as 'draft' | 'published',
  });

  const [sections, setSections] = useState<SectionData[]>([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [showSEO, setShowSEO] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!pageId);
  const [seoData, setSeoData] = useState({
    title: '',
    author: '',
    description: '',
    keywords: '',
    image: '',
  });

  const isEditMode = !!pageId;

  useEffect(() => {
    if (isEditMode && pageId) {
      fetchPage(pageId);
    } else {
      initializeNewPage();
    }
  }, [pageId, isEditMode]);

  const fetchPage = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          template: data.template || 'home',
          status: (data.status as 'draft' | 'published') || 'draft',
        });
        setSections((data.sections as unknown as SectionData[]) || []);
        setSeoData({
          title: '',
          author: '',
          description: '',
          keywords: '',
          image: '',
        });
        setActiveSection((data.sections as unknown as SectionData[])?.[0]?.id || 'hero');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load page',
        variant: 'destructive',
      });
    } finally {
      setPageLoading(false);
    }
  };

  const initializeNewPage = () => {
    setFormData({
      title: '',
      slug: '',
      template: 'home',
      status: 'draft',
    });
    setSections(JSON.parse(JSON.stringify(TEMPLATE_SECTIONS['home'])));
    setActiveSection('hero');
    setPageLoading(false);
  };

  const handleTemplateChange = (newTemplate: string) => {
    setFormData({
      ...formData,
      template: newTemplate,
    });
    const newSections = JSON.parse(JSON.stringify(TEMPLATE_SECTIONS[newTemplate as keyof typeof TEMPLATE_SECTIONS] || []));
    setSections(newSections);
    setActiveSection(newSections[0]?.id || 'hero');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const addSlide = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newSlide: SlideData = {
          id: `slide-${Date.now()}`,
          title: `Slide ${section.slides.length + 1}`,
          content: '',
          order: section.slides.length,
        };
        return {
          ...section,
          slides: [...section.slides, newSlide],
        };
      }
      return section;
    }));
  };

  const removeSlide = (sectionId: string, slideId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          slides: section.slides.filter(s => s.id !== slideId),
        };
      }
      return section;
    }));
  };

  const toggleCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const updateSlide = (sectionId: string, slideId: string, updates: Partial<SlideData>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          slides: section.slides.map(slide => 
            slide.id === slideId ? { ...slide, ...updates } : slide
          ),
        };
      }
      return section;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Page title is required');
      }

      if (sections.length === 0) {
        throw new Error('Page must have at least one section');
      }

      const pageData = {
        title: formData.title,
        slug: formData.slug,
        template: formData.template,
        sections: sections as unknown as any,
        status: formData.status,
      };

      if (isEditMode && pageId) {
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', pageId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        const { data: newPage, error } = await supabase
          .from('pages')
          .insert([pageData])
          .select();

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }

      router.push('/admin/pages');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Page' : 'Create Pages'}</h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode ? 'Update your page details and sections' : 'Create a new page by selecting a template and configuring sections'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
          {/* Left Panel - Form */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter page title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    disabled={loading}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    disabled={loading}
                    className="text-sm bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated from title</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template" className="text-sm font-medium">
                    Template<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.template}
                    onValueChange={handleTemplateChange}
                    disabled={loading || isEditMode}
                  >
                    <SelectTrigger id="template" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as 'draft' | 'published',
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="status" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Created At</span>
                    <p>{isEditMode ? new Date().toLocaleDateString() : '--'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Updated At</span>
                    <p>{isEditMode ? new Date().toLocaleDateString() : '--'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Sections */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList className="w-full justify-start overflow-x-auto bg-muted p-1 gap-1 h-auto flex-wrap">
                      {sections.map((section) => (
                        <TabsTrigger 
                          key={section.id} 
                          value={section.id}
                          className="text-xs whitespace-nowrap"
                        >
                          {section.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <Button
                      type="button"
                      variant={showSEO ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowSEO(!showSEO);
                        setActiveSection('');
                      }}
                      className="ml-2 whitespace-nowrap flex-shrink-0"
                    >
                      SEO
                    </Button>
                  </div>

                  {/* Section Content */}
                  {sections.map((section) => (
                    <TabsContent 
                      key={section.id} 
                      value={section.id}
                      className="space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm">{section.name}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCollapse(section.id)}
                            className="h-6 w-6 p-0"
                          >
                            {collapsedSections.has(section.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {!collapsedSections.has(section.id) && (
                          <>
                            {/* Banner Section - Special Treatment */}
                            {section.type === 'hero' ? (
                              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                {/* Initialize slide if not exists */}
                                {section.slides.length === 0 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSlide(section.id)}
                                    className="w-full text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Initialize Banner
                                  </Button>
                                )}

                                {section.slides.length > 0 && (
                                  <div className="space-y-3">
                                    {/* Subtitle */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Subtitle</Label>
                                      <Input
                                        value={section.slides[0]?.subtitle || ''}
                                        onChange={(e) => updateSlide(section.id, section.slides[0].id, { subtitle: e.target.value })}
                                        placeholder="e.g., Trusted by 500+ Growing SaaS Companies"
                                        className="text-sm"
                                        disabled={loading}
                                      />
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Title</Label>
                                      <Input
                                        value={section.slides[0]?.title || ''}
                                        onChange={(e) => updateSlide(section.id, section.slides[0].id, { title: e.target.value })}
                                        placeholder="e.g., Scale Your SaaS Through Strategic Partnerships"
                                        className="text-sm"
                                        disabled={loading}
                                      />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Description</Label>
                                      <textarea
                                        value={section.slides[0]?.description || ''}
                                        onChange={(e) => updateSlide(section.id, section.slides[0].id, { description: e.target.value })}
                                        placeholder="Enter banner description..."
                                        className="w-full text-sm border rounded p-2 min-h-20 font-sans"
                                        disabled={loading}
                                      />
                                    </div>

                                    {/* Button 1 */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Button 1 Text</Label>
                                      <Input
                                        value={section.slides[0]?.button1Text || ''}
                                        onChange={(e) => updateSlide(section.id, section.slides[0].id, { button1Text: e.target.value })}
                                        placeholder="e.g., Start Growing Today"
                                        className="text-sm"
                                        disabled={loading}
                                      />
                                    </div>

                                    {/* Button 2 */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Button 2 Text</Label>
                                      <Input
                                        value={section.slides[0]?.button2Text || ''}
                                        onChange={(e) => updateSlide(section.id, section.slides[0].id, { button2Text: e.target.value })}
                                        placeholder="e.g., See How It Works"
                                        className="text-sm"
                                        disabled={loading}
                                      />
                                    </div>

                                    {/* Image */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Banner Image</Label>
                                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                              updateSlide(section.id, section.slides[0].id, { image: e.target.files[0].name });
                                            }
                                          }}
                                          disabled={loading}
                                          className="hidden"
                                          id="banner-image-input"
                                        />
                                        <label htmlFor="banner-image-input" className="cursor-pointer block">
                                          <p className="text-sm text-muted-foreground">
                                            Drag & Drop your image or <span className="text-primary font-medium">Browse</span>
                                          </p>
                                        </label>
                                      </div>
                                      {section.slides[0]?.image && (
                                        <p className="text-xs text-muted-foreground">Selected: {section.slides[0].image}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                        {/* Slides List for Other Sections */}
                        <div className="space-y-2 mb-4">
                          {section.slides.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center bg-muted rounded">No slides added yet</p>
                          ) : (
                            section.slides.map((slide) => (
                              <Card key={slide.id} className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                    <Input
                                      value={slide.title}
                                      onChange={(e) => updateSlide(section.id, slide.id, { title: e.target.value })}
                                      placeholder="Slide title"
                                      className="text-sm h-8"
                                      disabled={loading}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSlide(section.id, slide.id)}
                                      disabled={loading}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                  <textarea
                                    value={slide.content}
                                    onChange={(e) => updateSlide(section.id, slide.id, { content: e.target.value })}
                                    placeholder="Slide content"
                                    className="w-full text-xs border rounded p-2 min-h-24 font-sans"
                                    disabled={loading}
                                  />
                                </div>
                              </Card>
                            ))
                          )}
                        </div>

                        {/* Add Slide Button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSlide(section.id)}
                          disabled={loading}
                          className="w-full text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Slide
                        </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>
                  ))}

                  {/* SEO Content */}
                  {showSEO && (
                    <div className="space-y-4 mt-4">
                      <h3 className="font-semibold text-sm">SEO Settings</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="seo-title" className="text-sm font-medium">
                            Seo title
                          </Label>
                          <Input
                            id="seo-title"
                            placeholder="Enter SEO title"
                            value={seoData.title}
                            onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                            disabled={loading}
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seo-author" className="text-sm font-medium">
                            Author
                          </Label>
                          <Input
                            id="seo-author"
                            placeholder="Enter author name"
                            value={seoData.author}
                            onChange={(e) => setSeoData({ ...seoData, author: e.target.value })}
                            disabled={loading}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seo-description" className="text-sm font-medium">
                          Meta description
                        </Label>
                        <textarea
                          id="seo-description"
                          placeholder="Enter meta description"
                          value={seoData.description}
                          onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                          disabled={loading}
                          className="w-full text-xs border rounded p-2 min-h-20 font-sans"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seo-keywords" className="text-sm font-medium">
                          Meta keywords
                        </Label>
                        <Input
                          id="seo-keywords"
                          placeholder="Enter meta keywords (comma-separated)"
                          value={seoData.keywords}
                          onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                          disabled={loading}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seo-image" className="text-sm font-medium">
                          Image
                        </Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <p className="text-sm text-muted-foreground">
                            Drag & Drop your files or <span className="text-primary font-medium">Browse</span>
                          </p>
                          <Input
                            id="seo-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setSeoData({ ...seoData, image: e.target.files[0].name });
                              }
                            }}
                            disabled={loading}
                            className="hidden"
                          />
                        </div>
                        {seoData.image && (
                          <p className="text-xs text-muted-foreground">Selected: {seoData.image}</p>
                        )}
                      </div>
                    </div>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? 'Saving...' : isEditMode ? 'Create & create another' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
