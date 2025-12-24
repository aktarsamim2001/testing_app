'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PageBuilderForm from './PageBuilderForm';
import PageBuilderSections from './PageBuilderSections';
import PageBuilderSEO from './PageBuilderSEO';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { createPageThunk, selectPagesLoading } from '@/store/slices/pages';

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
  stats?: Array<{
    number: string;
    label: string;
    icon?: string;
  }>;
  cards?: Array<{
    id: string;
    icon?: string;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  }>;
  features?: Array<{
    id: string;
    text: string;
  }>;
}

// Template sections mapping
const TEMPLATE_SECTIONS: Record<string, SectionData[]> = {
  home: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
  ],
  creators: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
    { id: 'section5', name: 'Section 5', type: 'stats', slides: [] },
  ],
  services: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
  ],
  'how-it-works': [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
  ],
  pricing: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
    { id: 'section5', name: 'Section 5', type: 'section5', slides: [] },
  ],
  about: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
    { id: 'section5', name: 'Section 5', type: 'section5', slides: [] },
    { id: 'section6', name: 'Section 6', type: 'section6', slides: [] },
  ],
  contact: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
  ],
  blog: [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
  ],
  'blog-details': [
    { id: 'hero', name: 'Section 1', type: 'hero', slides: [] },
    { id: 'channels', name: 'Section 2', type: 'channels', slides: [] },
    { id: 'features', name: 'Section 3', type: 'features', slides: [] },
    { id: 'stats', name: 'Section 4', type: 'stats', slides: [] },
  ],
};

interface PageBuilderProps {
  pageId?: string;
}

export default function PageBuilder({ pageId }: PageBuilderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  // Redux state
  const loading = useAppSelector(selectPagesLoading);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: 'home',
    status: 'active' as 'active' | 'inactive',
  });

  const [sections, setSections] = useState<SectionData[]>(
    JSON.parse(JSON.stringify(TEMPLATE_SECTIONS.home))
  );
  const [activeSection, setActiveSection] = useState('hero');
  const [sectionStep, setSectionStep] = useState(0);
  const [showSEO, setShowSEO] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [seoData, setSeoData] = useState({
    title: '',
    author: '',
    description: '',
    keywords: '',
    image: '',
  });

  const isEditMode = !!pageId;

  // Initialize sections on component mount
  useEffect(() => {
    const initialSections = JSON.parse(JSON.stringify(TEMPLATE_SECTIONS.home));
    setSections(initialSections);
    setActiveSection(initialSections[0]?.id || 'hero');
  }, []);

  const handleTemplateChange = (newTemplate: string) => {
    setFormData({
      ...formData,
      template: newTemplate,
    });
    const newSections = JSON.parse(
      JSON.stringify(TEMPLATE_SECTIONS[newTemplate as keyof typeof TEMPLATE_SECTIONS] || [])
    );
    setSections(newSections);
    setActiveSection(newSections[0]?.id || 'hero');
    setSectionStep(0);
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
    setSections(
      sections.map((section) => {
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
      })
    );
  };

  const removeSlide = (sectionId: string, slideId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            slides: section.slides.filter((s) => s.id !== slideId),
          };
        }
        return section;
      })
    );
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

  const updateSlide = (
    sectionId: string,
    slideId: string,
    updates: Partial<SlideData>
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            slides: section.slides.map((slide) =>
              slide.id === slideId ? { ...slide, ...updates } : slide
            ),
          };
        }
        return section;
      })
    );
  };

  // Build API payload according to API requirements
  const buildApiPayload = () => {
    // Build data object: { section1: [...], section2: [...], ... }
    const data: Record<string, any> = {};
    
    sections.forEach((section, idx) => {
      const key = `section${idx + 1}`;
      // Remove 'id' and 'order' fields from each slide before sending to API
      data[key] = section.slides.map((slide) => {
        const { id, order, ...slideData } = slide;
        return slideData;
      });
    });

    return {
      template: formData.template,
      title: formData.title,
      slug: formData.slug,
      meta_title: seoData.title,
      meta_author: seoData.author,
      meta_keywords: seoData.keywords,
      meta_description: seoData.description,
      meta_feature_image: seoData.image || '',
      data: [data], // API expects array with single data object
      status: formData.status === 'active' ? 1 : 0, // Convert to number
    };
  };

  // Section continue handler
  const handleSectionContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectionStep < sections.length - 1) {
      setSectionStep(sectionStep + 1);
      setActiveSection(sections[sectionStep + 1].id);
    }
  };

  // Main form submit handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Page title is required',
        variant: 'destructive',
      });
      return;
    }

    if (sections.length === 0) {
      toast({
        title: 'Error',
        description: 'Page must have at least one section',
        variant: 'destructive',
      });
      return;
    }

    // Build payload
    const payload = buildApiPayload();

    try {
      // Dispatch createPageThunk
      const resultAction = await dispatch(createPageThunk(payload));
      
      // Check if action was successful
      if (createPageThunk.fulfilled.match(resultAction)) {
        // Success - toast already shown by thunk
        router.push('/admin/pages');
      } else if (createPageThunk.rejected.match(resultAction)) {
        // Error - toast already shown by thunk, but we can add fallback
        console.error('Failed to create page:', resultAction.error);
      }
    } catch (error: any) {
      // Unexpected error
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {isEditMode ? 'Edit Page' : 'Create Pages'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode
                  ? 'Update your page details and sections'
                  : 'Create a new page by selecting a template and configuring sections'}
              </p>
            </div>
          </div>
           <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/admin/pages')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
        </div>

        <form
          onSubmit={
            showSEO || sectionStep === sections.length - 1
              ? handleCreate
              : handleSectionContinue
          }
          className="space-y-6"
        >
          <div className="grid grid-cols-4 gap-6">
            {/* Left Panel - Form */}
            <div className="col-span-1 space-y-4">
              <PageBuilderForm
                formData={formData}
                loading={loading}
                isEditMode={isEditMode}
                handleTitleChange={handleTitleChange}
                setFormData={setFormData}
                handleTemplateChange={handleTemplateChange}
              />
            </div>

            {/* Right Panel - Sections/SEO */}
            <div className="col-span-3 space-y-4">
              <div className="relative">
                <Button
                  type="button"
                  variant={showSEO ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setShowSEO(!showSEO);
                  }}
                  className="absolute top-[25px] right-4 mt-2 mr-2 z-10 whitespace-nowrap flex-shrink-0"
                >
                  SEO
                </Button>
                <div className="pt-2">
                  {!showSEO ? (
                    <PageBuilderSections
                      sections={sections}
                      formData={formData}
                      activeSection={sections[sectionStep]?.id || ''}
                      setActiveSection={(id) => {
                        const idx = sections.findIndex((s) => s.id === id);
                        if (idx !== -1) setSectionStep(idx);
                        setActiveSection(id);
                      }}
                      collapsedSections={collapsedSections}
                      toggleCollapse={toggleCollapse}
                      loading={loading}
                      updateSlide={updateSlide}
                      addSlide={addSlide}
                      removeSlide={removeSlide}
                      TEMPLATE_SECTIONS={TEMPLATE_SECTIONS}
                    />
                  ) : (
                    <PageBuilderSEO
                      seoData={seoData}
                      setSeoData={setSeoData}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
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
            {!showSEO && sectionStep < sections.length - 1 ? (
              <Button type="submit" disabled={loading} className="bg-gradient-primary">
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="bg-gradient-primary">
                {loading ? 'Creating...' : 'Create'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}