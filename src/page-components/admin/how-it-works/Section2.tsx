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
  interface TitleItem {
    id: string;
    text: string;
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
            {/* Slide Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="Enter slide title"
                value={slide.title}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { title: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Slide Description */}
            <div className="space-y-2">
              <Label htmlFor={`slide-description-${slide.id}`} className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id={`slide-description-${slide.id}`}
                placeholder="Enter slide description"
                value={slide.description || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { description: e.target.value })
                }
                disabled={loading}
                className="text-sm min-h-[100px]"
              />
            </div>

            {/* Icon Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="border-2 border-dashed rounded p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateSlide(section.id, slide.id, { image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={loading}
                  className="hidden w-full"
                  id={`icon-upload-${slide.id}`}
                />
                <label htmlFor={`icon-upload-${slide.id}`} className="cursor-pointer block text-sm text-muted-foreground hover:text-foreground">
                  {slide.image ? '✓ Icon set' : 'Upload Icon'}
                </label>
              </div>
            </div>

            {/* Badge Input */}
            <div className="space-y-2">
              <Label htmlFor={`slide-badge-${slide.id}`} className="text-sm font-medium">
                Badge
              </Label>
              <Input
                id={`slide-badge-${slide.id}`}
                placeholder="e.g., New, Featured"
                value={slide.button1Text || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { button1Text: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Titles / Items Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Title
                </Button>
              </div>

              <div className="space-y-2">
                {((slide as any).titles || []).map((title: TitleItem, titleIndex: number) => (
                  <div key={titleIndex} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter item text"
                        value={title.text}
                        onChange={(e) =>
                          handleTitleChange(slide.id, titleIndex, e.target.value)
                        }
                        disabled={loading}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTitle(slide.id, titleIndex)}
                      disabled={loading}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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
