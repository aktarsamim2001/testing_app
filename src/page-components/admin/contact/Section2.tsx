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

  const handleTitleChange = (
    slideId: string,
    titleIndex: number,
    value: string,
    field: 'titles' | 'budgetItems'
  ) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedTitles = [...((slide as any)[field] || [])];
    if (!updatedTitles[titleIndex]) {
      updatedTitles[titleIndex] = { id: `title-${Date.now()}`, text: '' };
    }
    updatedTitles[titleIndex].text = value;
    updateSlide(section.id, slideId, { [field]: updatedTitles } as any);
  };

  const addTitle = (slideId: string, field: 'titles' | 'budgetItems') => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newTitles = [...((slide as any)[field] || []), { id: `title-${Date.now()}`, text: '' }];
    updateSlide(section.id, slideId, { [field]: newTitles } as any);
  };

  const removeTitle = (slideId: string, titleIndex: number, field: 'titles' | 'budgetItems') => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedTitles = (slide as any)[field]?.filter((_: any, i: number) => i !== titleIndex) || [];
    updateSlide(section.id, slideId, { [field]: updatedTitles } as any);
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
                Section Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="e.g., Contact Information"
                value={slide.title}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { title: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor={`slide-description-${slide.id}`} className="text-sm font-medium">
                Section Description
              </Label>
              <Textarea
                id={`slide-description-${slide.id}`}
                placeholder="e.g., We typically respond within 24 hours. For urgent inquiries, call us directly."
                value={slide.description || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { description: e.target.value })
                }
                disabled={loading}
                className="text-sm min-h-[80px]"
              />
            </div>

            {/* Contact Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Contact Methods</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCard(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-3">
                {((slide as any).cards || []).map((card: CardItem, cardIndex: number) => (
                  <Card key={cardIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Contact Type Title */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Contact Type</Label>
                        <Input
                          placeholder="e.g., Email, Phone, Office"
                          value={card.title}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, { title: e.target.value })
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Contact Value/Details */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Contact Details</Label>
                        <Input
                          placeholder="e.g., hello@example.com or 123 Growth Street&#10;San Francisco, CA 94105"
                          value={card.description}
                          onChange={(e) =>
                            handleCardChange(slide.id, cardIndex, { description: e.target.value })
                          }
                          disabled={loading}
                          className="text-xs"
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
                                handleCardChange(slide.id, cardIndex, { icon: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                        {card.icon && (
                          <p className="text-xs text-green-600">✓ Image uploaded</p>
                        )}
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
                        Remove Contact
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* What to Expect Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">What to Expect</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id, 'titles')}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {((slide as any).titles || []).map((title: TitleItem, titleIndex: number) => (
                  <div key={titleIndex} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Free 30-minute consultation"
                        value={title.text}
                        onChange={(e) =>
                          handleTitleChange(slide.id, titleIndex, e.target.value, 'titles')
                        }
                        disabled={loading}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTitle(slide.id, titleIndex, 'titles')}
                      disabled={loading}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Budget Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Monthly Budget</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id, 'budgetItems')}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Budget Item
                </Button>
              </div>

              <div className="space-y-2">
                {((slide as any).budgetItems || []).map((item: TitleItem, itemIndex: number) => (
                  <div key={itemIndex} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Starter Package - $500/month"
                        value={item.text}
                        onChange={(e) =>
                          handleTitleChange(slide.id, itemIndex, e.target.value, 'budgetItems')
                        }
                        disabled={loading}
                        className="text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTitle(slide.id, itemIndex, 'budgetItems')}
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
    </div>
  );
}
