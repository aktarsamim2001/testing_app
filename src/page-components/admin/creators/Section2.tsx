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
  const handleCardChange = (
    slideId: string,
    cardIndex: number,
    field: 'icon' | 'title' | 'description' | 'buttonText' | 'buttonUrl',
    value: string
  ) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCards = [...(slide.cards || [])];
    if (!updatedCards[cardIndex]) {
      updatedCards[cardIndex] = {
        id: `card-${Date.now()}`,
        icon: '',
        title: '',
        description: '',
        buttonText: '',
        buttonUrl: '',
      };
    }
    updatedCards[cardIndex][field] = value;
    updateSlide(section.id, slideId, { cards: updatedCards });
  };

  const addCard = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newCards = [
      ...(slide.cards || []),
      {
        id: `card-${Date.now()}`,
        icon: '',
        title: '',
        description: '',
        buttonText: '',
        buttonUrl: '',
      },
    ];
    updateSlide(section.id, slideId, { cards: newCards });
  };

  const removeCard = (slideId: string, cardIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedCards = slide.cards?.filter((_, i) => i !== cardIndex) || [];
    updateSlide(section.id, slideId, { cards: updatedCards });
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

            {/* Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Cards</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCard(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Card
                </Button>
              </div>

              <div className="space-y-3">
                {(slide.cards || []).map((card, cardIndex) => (
                  <Card key={cardIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Icon</Label>
                          <div className="border-2 border-dashed rounded p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleCardChange(slide.id, cardIndex, 'icon', reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              disabled={loading}
                              className="hidden w-full"
                              id={`icon-upload-${slide.id}-${cardIndex}`}
                            />
                            <label htmlFor={`icon-upload-${slide.id}-${cardIndex}`} className="cursor-pointer block text-xs text-muted-foreground hover:text-foreground">
                              {card.icon ? '✓ Icon set' : 'Upload Icon'}
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Title</Label>
                          <Input
                            placeholder="e.g., LinkedIn Influencers"
                            value={card.title}
                            onChange={(e) =>
                              handleCardChange(slide.id, cardIndex, 'title', e.target.value)
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          placeholder="e.g., $100-300 per post"
                          value={card.description}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, 'description', e.target.value)
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Subtitle/Details</Label>
                        <Input
                          placeholder="e.g., Share SAAS insights with your professional network"
                          value={card.buttonText}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, 'buttonText', e.target.value)
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
                        Remove Card
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
