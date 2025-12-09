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

interface Section5Props {
  section: SectionData;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: Partial<SlideData>) => void;
  addSlide: (sectionId: string) => void;
  removeSlide?: (sectionId: string, slideId: string) => void;
  showButton?: boolean;
}

export default function Section5({
  section,
  loading,
  updateSlide,
  addSlide,
  removeSlide,
  showButton = true,
}: Section5Props) {
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
            {/* CTA Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                CTA Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="e.g., Not Sure Which Plan is Right?"
                value={slide.title}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { title: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* CTA Description */}
            <div className="space-y-2">
              <Label htmlFor={`slide-description-${slide.id}`} className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id={`slide-description-${slide.id}`}
                placeholder="e.g., Schedule a free consultation and we'll help you choose the perfect plan for your goals"
                value={slide.description || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { description: e.target.value })
                }
                disabled={loading}
                className="text-sm min-h-[80px]"
              />
            </div>

            {/* Button Text and URL (Side by Side) */}
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor={`slide-button1text-${slide.id}`} className="text-sm font-medium">
                  Button Text
                </Label>
                <Input
                  id={`slide-button1text-${slide.id}`}
                  placeholder="e.g., Talk to Our Team"
                  value={slide.button1Text || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button1Text: e.target.value })
                  }
                  disabled={loading}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`slide-button1url-${slide.id}`} className="text-sm font-medium">
                  Button URL
                </Label>
                <Input
                  id={`slide-button1url-${slide.id}`}
                  placeholder="e.g., /contact"
                  value={slide.button1Url || ''}
                  onChange={(e) =>
                    updateSlide(section.id, slide.id, { button1Url: e.target.value })
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
