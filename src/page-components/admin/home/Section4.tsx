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
}

interface Section4Props {
  section: SectionData;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: Partial<SlideData>) => void;
  addSlide: (sectionId: string) => void;
  showButton?: boolean;
}

export default function Section4({
  section,
  loading,
  updateSlide,
  addSlide,
  showButton = true,
}: Section4Props) {
  const handleStatChange = (
    slideId: string,
    statIndex: number,
    field: 'number' | 'label' | 'icon',
    value: string
  ) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedStats = [...(slide.stats || [])];
    if (!updatedStats[statIndex]) {
      updatedStats[statIndex] = { number: '', label: '', icon: '' };
    }
    updatedStats[statIndex][field] = value;

    updateSlide(section.id, slideId, { stats: updatedStats });
  };

  const addStat = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newStats = [
      ...(slide.stats || []),
      { number: '', label: '', icon: '' },
    ];
    updateSlide(section.id, slideId, { stats: newStats });
  };

  const removeStat = (slideId: string, statIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedStats = slide.stats?.filter((_, i) => i !== statIndex) || [];
    updateSlide(section.id, slideId, { stats: updatedStats });
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
        <Card key={slide.id} className="p-4">
          <CardContent className="space-y-4">
            {/* Slide Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                Slide Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="Enter slide title"
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

            {/* Button 1 */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Button 1</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`button1-text-${slide.id}`} className="text-xs font-medium">
                    Button Text
                  </Label>
                  <Input
                    id={`button1-text-${slide.id}`}
                    placeholder="e.g., Get Started Today"
                    value={slide.button1Text || ''}
                    onChange={(e) =>
                      updateSlide(section.id, slide.id, { button1Text: e.target.value })
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`button1-url-${slide.id}`} className="text-xs font-medium">
                    Button URL
                  </Label>
                  <Input
                    id={`button1-url-${slide.id}`}
                    placeholder="e.g., /get-started"
                    value={slide.button1Url || ''}
                    onChange={(e) =>
                      updateSlide(section.id, slide.id, { button1Url: e.target.value })
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
}
