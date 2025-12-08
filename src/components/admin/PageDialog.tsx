'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical } from 'lucide-react';

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
}

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: PageData | null;
}

// Template sections mapping
const TEMPLATE_SECTIONS: Record<string, SectionData[]> = {
  home: [
    {
      id: 'hero',
      name: 'Slider',
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

export default function PageDialog({ open, onOpenChange, page }: PageDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: 'home',
    status: 'draft' as 'draft' | 'published',
  });

  const [sections, setSections] = useState<SectionData[]>([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!page;
  const templateSections = TEMPLATE_SECTIONS[formData.template as keyof typeof TEMPLATE_SECTIONS] || [];

  useEffect(() => {
    if (open) {
      if (isEditMode && page) {
        setFormData({
          title: page.title || '',
          slug: page.slug || '',
          template: page.template || 'home',
          status: page.status || 'draft',
        });
        setSections(page.sections || []);
        setActiveSection(page.sections[0]?.id || 'hero');
      } else {
        setFormData({
          title: '',
          slug: '',
          template: 'home',
          status: 'draft',
        });
        setSections(JSON.parse(JSON.stringify(TEMPLATE_SECTIONS['home'])));
        setActiveSection('hero');
      }
    }
  }, [open, page, isEditMode]);

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
        sections: sections,
        status: formData.status,
      };

      if (isEditMode && page) {
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', page.id);

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

      onOpenChange(false);
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

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Page' : 'Create Pages'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Left Panel - Form */}
            <div className="w-64 flex-shrink-0 overflow-y-auto border-r pr-4 space-y-4">
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
                  disabled={loading}
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
                  <p>{isEditMode && page ? new Date(page.created_at).toLocaleDateString() : '--'}</p>
                </div>
                <div>
                  <span className="font-medium">Updated At</span>
                  <p>{isEditMode && page ? new Date(page.updated_at).toLocaleDateString() : '--'}</p>
                </div>
              </div>
            </div>

            {/* Right Panel - Sections */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="flex flex-col flex-1 overflow-hidden">
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

                {/* Section Content */}
                {sections.map((section) => (
                  <TabsContent 
                    key={section.id} 
                    value={section.id}
                    className="flex-1 overflow-y-auto mt-4"
                  >
                    <div className="space-y-3 pr-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-3">{section.name}</h3>
                        
                        {/* Slides List */}
                        <div className="space-y-2 mb-4">
                          {section.slides.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No slides added yet</p>
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
                                    className="w-full text-xs border rounded p-2 min-h-20 font-sans"
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
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? 'Saving...' : isEditMode ? 'Update Page' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
