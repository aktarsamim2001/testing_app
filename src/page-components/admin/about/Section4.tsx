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

interface TitleItem {
  id: string;
  text: string;
  description?: string;
  icon?: string;
}

interface Section4Props {
  section: SectionData;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: Partial<SlideData>) => void;
  addSlide: (sectionId: string) => void;
  removeSlide?: (sectionId: string, slideId: string) => void;
  showButton?: boolean;
}

export default function Section4({
  section,
  loading,
  updateSlide,
  addSlide,
  removeSlide,
  showButton = true,
}: Section4Props) {
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
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="e.g., Our Core Values"
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
                placeholder="e.g., The principles that guide everything we do"
                value={slide.subtitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Values Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Values</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Value
                </Button>
              </div>

              <div className="space-y-3">
                {((slide as any).titles || []).map((title: TitleItem, titleIndex: number) => (
                  <Card key={titleIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Value Title */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Value Title</Label>
                        <Input
                          placeholder="e.g., Results-Driven"
                          value={title.text}
                          onChange={(e) =>
                            handleTitleChange(slide.id, titleIndex, e.target.value)
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Value Description */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Description</Label>
                        <Textarea
                          placeholder="e.g., Every partnership is measured by ROI. We're obsessed with delivering tangible growth metrics."
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

                      {/* Icon Upload */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Icon</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const updated = [...((slide as any).titles || [])];
                                updated[titleIndex].icon = reader.result as string;
                                updateSlide(section.id, slide.id, { titles: updated } as any);
                              };
                              reader.readAsDataURL(file);
                            }
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
                        Remove Value
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
