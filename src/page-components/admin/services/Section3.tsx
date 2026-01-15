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
  price?: string;
  priceLabel?: string;
  badge?: string;
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
  benefits?: Array<{
    id: string;
    title: string;
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

  const handleBenefitChange = (slideId: string, benefitIndex: number, value: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedBenefits = [...(slide.benefits || [])];
    if (!updatedBenefits[benefitIndex]) {
      updatedBenefits[benefitIndex] = { id: `benefit-${Date.now()}`, title: '' };
    }
    updatedBenefits[benefitIndex].title = value;
    updateSlide(section.id, slideId, { benefits: updatedBenefits });
  };

  const addBenefit = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newBenefits = [...(slide.benefits || []), { id: `benefit-${Date.now()}`, title: '' }];
    updateSlide(section.id, slideId, { benefits: newBenefits });
  };

  const removeBenefit = (slideId: string, benefitIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedBenefits = slide.benefits?.filter((_, i) => i !== benefitIndex) || [];
    updateSlide(section.id, slideId, { benefits: updatedBenefits });
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
            {/* Badge */}
            <div className="space-y-2">
              <Label htmlFor={`slide-badge-${slide.id}`} className="text-sm font-medium">
                Badge (e.g., "Recommended")
              </Label>
              <Input
                id={`slide-badge-${slide.id}`}
                placeholder="e.g., Recommended, Most Popular"
                value={(slide as any).badge || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { badge: e.target.value } as any)
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="e.g., Full-Service Partnership Suite"
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
                placeholder="e.g., Maximize your growth with..."
                value={slide.subtitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { subtitle: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Service Cards Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Service Cards</Label>
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
                                  handleCardChange(slide.id, cardIndex, 'icon', `/uploads/icons/${file.name}`);
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
                            placeholder="e.g., Blogger Outreach"
                            value={card.title}
                            onChange={(e) =>
                              handleCardChange(slide.id, cardIndex, 'title', e.target.value)
                            }
                            disabled={loading}
                            className="text-xs"
                          />
                        </div>
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

            {/* Additional Benefits Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                <Label className="text-sm font-semibold">Additional Benefits</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBenefit(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Benefit
                </Button>
              </div>

              <div className="space-y-2">
                {(slide.benefits || []).map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex gap-2 items-center">
                    <span className="text-blue-600 font-bold">◉</span>
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Unified reporting dashboard"
                        value={benefit.title}
                        onChange={(e) =>
                          handleBenefitChange(slide.id, benefitIndex, e.target.value)
                        }
                        disabled={loading}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBenefit(slide.id, benefitIndex)}
                      disabled={loading}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Pricing</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`slide-price-${slide.id}`} className="text-xs font-medium">
                    Price (e.g., $8,999)
                  </Label>
                  <Input
                    id={`slide-price-${slide.id}`}
                    placeholder="e.g., $8,999"
                    value={(slide as any).price || ''}
                    onChange={(e) =>
                      updateSlide(section.id, slide.id, { price: e.target.value } as any)
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`slide-price-label-${slide.id}`} className="text-xs font-medium">
                    Price Label (e.g., /month)
                  </Label>
                  <Input
                    id={`slide-price-label-${slide.id}`}
                    placeholder="e.g., /month"
                    value={(slide as any).priceLabel || ''}
                    onChange={(e) =>
                      updateSlide(section.id, slide.id, { priceLabel: e.target.value } as any)
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Call-to-Action Button</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`button1-text-${slide.id}`} className="text-xs font-medium">
                    Button Text
                  </Label>
                  <Input
                    id={`button1-text-${slide.id}`}
                    placeholder="e.g., Start Full-Service Package"
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
                    placeholder="e.g., /start-package"
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
