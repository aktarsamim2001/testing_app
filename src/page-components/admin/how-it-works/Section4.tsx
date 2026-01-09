'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
                placeholder="Enter title"
                value={section.slides[0]?.title === 'Slide 1' ? '' : (section.slides[0]?.title || '')}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { title: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Slide Subtitle */}
            <div className="space-y-2">
              <Label htmlFor={`slide-subtitle-${slide.id}`} className="text-sm font-medium">
                Subtitle
              </Label>
              <Input
                id={`slide-subtitle-${slide.id}`}
                placeholder="Enter slide subtitle"
                value={slide.subtitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Button 1 Text & URL */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`button1-text-${slide.id}`} className="text-sm font-medium">
                  Button 1 Text
                </Label>
                <Input
                  id={`button1-text-${slide.id}`}
                  placeholder="Enter text"
                  value={slide.button1Text || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button1Text: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`button1-url-${slide.id}`} className="text-sm font-medium">
                  Button 1 URL
                </Label>
                <Input
                  id={`button1-url-${slide.id}`}
                  placeholder="Enter URL"
                  value={slide.button1Url || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button1Url: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Button 2 Text & URL */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`button2-text-${slide.id}`} className="text-sm font-medium">
                  Button 2 Text
                </Label>
                <Input
                  id={`button2-text-${slide.id}`}
                  placeholder="Enter text"
                  value={slide.button2Text || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button2Text: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`button2-url-${slide.id}`} className="text-sm font-medium">
                  Button 2 URL
                </Label>
                <Input
                  id={`button2-url-${slide.id}`}
                  placeholder="Enter URL"
                  value={slide.button2Url || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button2Url: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
}
