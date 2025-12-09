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
  included?: Array<{
    id: string;
    text: string;
  }>;
  benefits?: Array<{
    id: string;
    title: string;
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
  const handleIncludedItemChange = (slideId: string, itemIndex: number, value: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedItems = [...(slide.included || [])];
    if (!updatedItems[itemIndex]) {
      updatedItems[itemIndex] = { id: `item-${Date.now()}`, text: '' };
    }
    updatedItems[itemIndex].text = value;
    updateSlide(section.id, slideId, { included: updatedItems });
  };

  const addIncludedItem = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newItems = [...(slide.included || []), { id: `item-${Date.now()}`, text: '' }];
    updateSlide(section.id, slideId, { included: newItems });
  };

  const removeIncludedItem = (slideId: string, itemIndex: number) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedItems = slide.included?.filter((_, i) => i !== itemIndex) || [];
    updateSlide(section.id, slideId, { included: updatedItems });
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

            {/* Slide Description */}
            <div className="space-y-2">
              <Label htmlFor={`slide-description-${slide.id}`} className="text-sm font-medium">
                Description
              </Label>
              <Input
                id={`slide-description-${slide.id}`}
                placeholder="Enter slide description"
                value={slide.description || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { description: e.target.value })
                }
                disabled={loading}
                className="text-sm"
              />
            </div>

            {/* Icon Upload */}
            <div className="space-y-2">
              <Label htmlFor={`slide-icon-${slide.id}`} className="text-sm font-medium">
                Icon Upload
              </Label>
              <Input
                id={`slide-icon-${slide.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateSlide(section.id, slide.id, { image: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={loading}
                className="text-sm"
              />
              {slide.image && (
                <div className="mt-2">
                  <img src={slide.image} alt="Icon preview" className="h-20 w-20 object-cover rounded" />
                </div>
              )}
            </div>

            {/* Additional Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-secondary-title-${slide.id}`} className="text-sm font-medium">
                Additional Title
              </Label>
              <Input
                id={`slide-secondary-title-${slide.id}`}
                placeholder="Enter additional title"
                value={(slide as any).secondaryTitle || ''}
                onChange={(e) =>
                  updateSlide(section.id, slide.id, { secondaryTitle: e.target.value } as any)
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
                    placeholder="e.g., Get Started"
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

            {/* What's Included Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                <Label className="text-sm font-semibold">What's Included</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addIncludedItem(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2 ml-2">
                {(slide.included || []).map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2 items-center">
                    <span className="text-green-600 font-bold">✓</span>
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Targeted blogger identification & vetting"
                        value={item.text}
                        onChange={(e) =>
                          handleIncludedItemChange(slide.id, itemIndex, e.target.value)
                        }
                        disabled={loading}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIncludedItem(slide.id, itemIndex)}
                      disabled={loading}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                <Label className="text-sm font-semibold">Key Benefits</Label>
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

              <div className="space-y-2 ml-2">
                {(slide.benefits || []).map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex gap-2 items-center">
                    <span className="text-blue-600 font-bold">★</span>
                    <div className="flex-1">
                      <Input
                        placeholder="e.g., Boost domain authority"
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
          Add New
        </Button>
      )}
    </div>
  );
}
