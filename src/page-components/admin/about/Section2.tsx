'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
                placeholder="Enter title"
                value={section.slides[0]?.title === 'Slide 1' ? '' : (section.slides[0]?.title || '')}
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
                Description
              </Label>
              <Textarea
                id={`slide-subtitle-${slide.id}`}
                placeholder="Enter descriptions"
                value={slide.subtitle || ''}
                rows={15}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
}
