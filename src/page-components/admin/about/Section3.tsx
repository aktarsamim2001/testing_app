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

interface CardItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
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
  const handleCardChange = (slideId: string, cardIndex: number, updates: Partial<CardItem>) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCards = [...((slide as any).cards || [])];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], ...updates };
    updateSlide(section.id, slideId, { cards: updatedCards } as any);
  };

  const addCard = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      title: '',
      description: '',
      buttonText: '',
      buttonUrl: '',
    };
    const newCards = [...((slide as any).cards || []), newCard];
    updateSlide(section.id, slideId, { cards: newCards } as any);
  };

  const removeCard = (slideId: string, cardIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCards = (slide as any).cards?.filter((_: any, i: number) => i !== cardIndex) || [];
    updateSlide(section.id, slideId, { cards: updatedCards } as any);
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
                Subtitle
              </Label>
              <Input
                id={`slide-subtitle-${slide.id}`}
                placeholder="Enter subtitle"
                value={slide.subtitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Stats Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Statistics</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCard(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Stat
                </Button>
              </div>

              <div className="space-y-3">
                {((slide as any).cards || []).map((card: CardItem, cardIndex: number) => (
                  <Card key={cardIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Stat Number */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Number</Label>
                        <Input
                          placeholder="500+"
                          value={card.title}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, { title: e.target.value })
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Stat Title */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Subtitle</Label>
                        <Input
                          placeholder="Enter subtitle"
                          value={card.description}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, { description: e.target.value })
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCard(slide.id, cardIndex)}
                        disabled={loading}
                        className="text-xs text-red-500 hover:text-red-700 w-full"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Stat
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
