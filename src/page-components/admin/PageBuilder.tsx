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
import { createPageThunk, updatePageThunk, fetchPages, selectPagesLoading, selectPages, fetchPageDetailsThunk, selectSelectedPage, selectSelectedPageLoading } from '@/store/slices/pages';
import type { PageUpdatePayload } from '@/store/slices/pages';

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
    { id: 'hero', name: 'Banner', type: 'hero', slides: [] },
    { id: 'channels', name: 'Channels', type: 'channels', slides: [] },
    { id: 'features', name: 'Features', type: 'features', slides: [] },
    { id: 'stats', name: 'CTA Banner', type: 'stats', slides: [] },
  ],
  creators: [
    { id: 'hero', name: 'Creators Header', type: 'hero', slides: [] },
    { id: 'channels', name: 'Channels', type: 'channels', slides: [] },
    { id: 'features', name: 'Process', type: 'features', slides: [] },
    { id: 'stats', name: 'Benefits', type: 'stats', slides: [] },
    { id: 'section5', name: 'CTA Banner', type: 'stats', slides: [] },
  ],
  services: [
    { id: 'hero', name: 'Services Header', type: 'hero', slides: [] },
  ],
  how_it_works: [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
    { id: 'channels', name: 'Steps', type: 'channels', slides: [] },
    { id: 'features', name: 'Process', type: 'features', slides: [] },
    { id: 'stats', name: 'CTA Banner', type: 'stats', slides: [] },
  ],
  pricing: [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
    { id: 'features', name: 'Add On', type: 'features', slides: [] },
    { id: 'stats', name: 'Faq', type: 'stats', slides: [] },
    { id: 'section5', name: 'CTA Banner', type: 'section5', slides: [] },
  ],
  about: [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
    { id: 'channels', name: 'Story', type: 'channels', slides: [] },
    { id: 'features', name: 'Impact', type: 'features', slides: [] },
    { id: 'stats', name: 'Values', type: 'stats', slides: [] },
    { id: 'section5', name: 'Experts', type: 'section5', slides: [] },
    { id: 'section6', name: 'CTA Banner', type: 'section6', slides: [] },
  ],
  contact: [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
    { id: 'channels', name: 'Contact Info', type: 'channels', slides: [] },
  ],
  blog: [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
  ],
  'blog-details': [
    { id: 'hero', name: 'Header', type: 'hero', slides: [] },
    { id: 'channels', name: 'Story', type: 'channels', slides: [] },
    { id: 'features', name: 'Impact', type: 'features', slides: [] },
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
  const allPages = useAppSelector((state) => (typeof selectPages === 'function' ? selectPages(state) : []));
  const selectedPage = useAppSelector(selectSelectedPage);
  const selectedPageLoading = useAppSelector(selectSelectedPageLoading);

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

  const [errors, setErrors] = useState<{
    title?: string;
    template?: string;
    slug?: string;
    sections?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoImage?: string;
  }>({});

  const isEditMode = !!pageId;

  // Find the page to edit from Redux state
  const editingPage = isEditMode && pageId ? allPages.find((p: any) => String(p.id) === String(pageId)) : null;

  // Always fetch pages on mount in edit mode to ensure data is loaded (handles direct navigation)
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchPages(1, 100));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, dispatch]);

  // Fetch page details when in edit mode
  useEffect(() => {
    if (isEditMode && pageId) {
      dispatch(fetchPageDetailsThunk(pageId) as any);
    }
  }, [pageId, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && !selectedPageLoading && selectedPage) {
      // Always use underscores for template key internally
      const templateKey = (selectedPage.template || 'home').replace(/-/g, '_');
      setFormData({
        title: selectedPage.title || '',
        slug: selectedPage.slug || '',
        template: templateKey,
        status: selectedPage.status === 1 ? 'active' : 'inactive',
      });
      setSeoData({
        title: selectedPage.meta_title || '',
        author: selectedPage.meta_author || '',
        description: selectedPage.meta_description || '',
        keywords: selectedPage.meta_keywords || '',
        image: selectedPage.meta_feature_image || '',
      });

      // Parse sections from API data
      let apiSections = [];
      // Support both 'content' and 'data' fields from API
      // Use type assertion to safely access potentially unknown properties
      const pageData = selectedPage as any;
      let contentData = pageData.content;
      
      // Check if 'data' property exists and is an array
      if (typeof contentData === 'undefined' && 'data' in pageData && Array.isArray(pageData.data)) {
        contentData = pageData.data;
      }
      
      const templateSections = TEMPLATE_SECTIONS[templateKey] || [];

      if (Array.isArray(contentData) && contentData.length > 0 && typeof contentData[0] === 'object') {
        const sectionObj = contentData[0];
        // Try to match by id or type, not just order
        apiSections = templateSections.map((section, idx) => {
          let slidesFromApi = sectionObj[`section${idx + 1}`];
          if (!slidesFromApi) {
            for (const key in sectionObj) {
              if (Array.isArray(sectionObj[key]) && sectionObj[key].length > 0) {
                const first = sectionObj[key][0];
                if ((first.type && first.type === section.type) || (first.id && first.id === section.id)) {
                  slidesFromApi = sectionObj[key];
                  break;
                }
              }
            }
          }
          const slides = Array.isArray(slidesFromApi)
            ? slidesFromApi.map((slide, i) => ({
                ...slide,
                id: slide.id || `slide-${i}`,
                order: i,
              }))
            : [];
          return {
            ...section,
            slides,
          };
        });
      } else {
        // If no content, use default template sections
        apiSections = JSON.parse(JSON.stringify(templateSections.length ? templateSections : TEMPLATE_SECTIONS.home));
      }
      setSections(apiSections);
      setActiveSection(apiSections[0]?.id || 'hero');
    }
  }, [isEditMode, selectedPageLoading, selectedPage]);

  // Only initialize default sections for create mode, and only on first mount
  useEffect(() => {
    if (!isEditMode) {
      const initialSections = JSON.parse(JSON.stringify(TEMPLATE_SECTIONS.home));
      setSections(initialSections);
      setActiveSection(initialSections[0]?.id || 'hero');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTemplateChange = (newTemplate: string) => {
    // Normalize template name: convert underscores to dashes for consistency
    const normalizedTemplate = newTemplate.replace(/_/g, '-');
    
    // Check if this template is already used more than once
    const usedCount = allPages.filter((p: any) => p.template === normalizedTemplate).length;
    if (usedCount > 0) {
      toast({
        title: 'Template already used',
        description: `The "${normalizedTemplate}" template has already been used.`,
        variant: 'destructive',
      });
      return; // Prevent selection
    }
    setFormData({
      ...formData,
      template: normalizedTemplate,
    });
    const newSections = JSON.parse(
      JSON.stringify(TEMPLATE_SECTIONS[normalizedTemplate as keyof typeof TEMPLATE_SECTIONS] || [])
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
            title: '',
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


  // Main form submit handler (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    const newErrors: typeof errors = {};

    // Validation
    if (!formData.title.trim()) {
      newErrors.title = 'Page title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (!formData.template) {
      newErrors.template = 'Template selection is required';
    }

    if (sections.length === 0) {
      newErrors.sections = 'Page must have at least one section';
    } else {
      // Check if at least one section has content
      const hasContent = sections.some(section => section.slides.length > 0);
      if (!hasContent) {
        newErrors.sections = 'At least one section must have content';
      }
    }

    // SEO validation
    if (!seoData.title.trim()) {
      newErrors.seoTitle = 'SEO title is required';
    }

    if (!seoData.description.trim()) {
      newErrors.seoDescription = 'SEO description is required';
    }

    if (!seoData.image.trim()) {
      newErrors.seoImage = 'SEO image is required';
    }

    // If there are errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Clear errors if validation passed
    setErrors({});

    // Build payload
    let payload = buildApiPayload();
    // For update, use PageUpdatePayload (which includes id)
    let updatePayload: PageUpdatePayload = { ...(payload as any), id: pageId };

    try {
      let resultAction;
      if (isEditMode && pageId) {
        resultAction = await dispatch(updatePageThunk(updatePayload));
      } else {
        resultAction = await dispatch(createPageThunk(payload));
      }

      if ((isEditMode && updatePageThunk.fulfilled.match(resultAction)) ||
          (!isEditMode && createPageThunk.fulfilled.match(resultAction))) {
        dispatch(fetchPages(1, 10) as any);
        router.push('/admin/pages');
      } else if ((isEditMode && updatePageThunk.rejected.match(resultAction)) ||
                 (!isEditMode && createPageThunk.rejected.match(resultAction))) {
        console.error('Failed to save page:', resultAction.error);
      }
    } catch (error: any) {
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit Page' : 'Create Pages'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedPageLoading
                ? 'Loading page details...'
                : isEditMode
                ? 'Update your page details and sections'
                : 'Create a new page by selecting a template and configuring sections'}
            </p>
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
              ? handleSubmit
              : handleSectionContinue
          }
          className="space-y-6"
        >
          <div className="flex flex-col sm:grid sm:grid-cols-4 gap-6">
            {/* Left Panel - Form */}
            <div className="w-full sm:col-span-1 space-y-4">
              <PageBuilderForm
                formData={formData}
                loading={loading}
                isEditMode={isEditMode}
                handleTitleChange={handleTitleChange}
                setFormData={setFormData}
                handleTemplateChange={handleTemplateChange}
                errors={errors}
              />
            </div>
            {/* Right Panel - Sections/SEO */}
            <div className="w-full sm:col-span-3 space-y-4">
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
                      sectionError={errors.sections}
                    />
                  ) : (
                    <PageBuilderSEO
                      seoData={seoData}
                      setSeoData={setSeoData}
                      loading={loading}
                      errors={errors}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            {!showSEO && sectionStep < sections.length - 1 && (
              <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                Continue
              </Button>
            )}
            {!showSEO && sectionStep === sections.length - 1 && (
              <Button
                type="button"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowSEO(true)}
              >
                Continue to SEO
              </Button>
            )}
            {showSEO && (
              <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save' : 'Create')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}