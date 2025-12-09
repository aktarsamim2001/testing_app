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
  titles?: Array<{
    id: string;
    text: string;
  }>;
}

interface Section3Props {
  section: SectionData;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: Partial<SlideData>) => void;
  addSlide: (sectionId: string) => void;
  removeSlide?: (sectionId: string, slideId: string) => void;
  showButton?: boolean;
}

export default function Section3({
  section,
  loading,
  updateSlide,
  addSlide,
  removeSlide,
  showButton = true,
}: Section3Props) {
  interface TitleItem {
    id: string;
    text: string;
    description?: string;
    icon?: string;
    price?: string;
    buttonText?: string;
    buttonUrl?: string;
  }

  const handleTitleChange = (
    slideId: string,
    titleIndex: number,
    value: string
  ) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedTitles = [...((slide as any).titles || [])];
    if (!updatedTitles[titleIndex]) {
      updatedTitles[titleIndex] = { id: `title-${Date.now()}`, text: '' };
    }
    updatedTitles[titleIndex].text = value;
    updateSlide(section.id, slideId, { titles: updatedTitles } as any);
  };

  const addTitle = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newTitles = [...((slide as any).titles || []), { id: `title-${Date.now()}`, text: '' }];
    updateSlide(section.id, slideId, { titles: newTitles } as any);
  };

  const removeTitle = (slideId: string, titleIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedTitles = (slide as any).titles?.filter((_: any, i: number) => i !== titleIndex) || [];
    updateSlide(section.id, slideId, { titles: updatedTitles } as any);
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
                placeholder="e.g., Premium Add-on Service"
                value={slide.title}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { title: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Section Subtitle */}
            <div className="space-y-2">
              <Label htmlFor={`slide-subtitle-${slide.id}`} className="text-sm font-medium">
                Section Subtitle
              </Label>
              <Input
                id={`slide-subtitle-${slide.id}`}
                placeholder="e.g., Want us to handle everything?"
                value={slide.subtitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Add-on Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add-on Services</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Service
                </Button>
              </div>

              <div className="space-y-3">
                {((slide as any).titles || []).map((title: TitleItem, titleIndex: number) => (
                  <Card key={titleIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Service Title */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Service Title</Label>
                        <Input
                          placeholder="e.g., Fully Managed Partnerships"
                          value={title.text}
                          onChange={(e) =>
                            handleTitleChange(slide.id, titleIndex, e.target.value)
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Service Description */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Description</Label>
                        <Textarea
                          placeholder="e.g., Let our team handle everything from partner outreach to campaign execution"
                          value={title.description || ''}
                          onChange={(e) => {
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].description = e.target.value;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                          disabled={loading}
                          className="text-xs min-h-[60px]"
                        />
                      </div>

                      {/* Service Price */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Price</Label>
                        <Input
                          placeholder="e.g., $2,499/month"
                          value={title.price || ''}
                          onChange={(e) => {
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].price = e.target.value;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Button Text */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Button Text</Label>
                        <Input
                          placeholder="e.g., Learn More"
                          value={title.buttonText || ''}
                          onChange={(e) => {
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].buttonText = e.target.value;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Button URL */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Button URL</Label>
                        <Input
                          placeholder="Enter button URL"
                          value={title.buttonUrl || ''}
                          onChange={(e) => {
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].buttonUrl = e.target.value;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTitle(slide.id, titleIndex)}
                        disabled={loading}
                        className="text-xs text-red-500 hover:text-red-700 w-full"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Service
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
}
