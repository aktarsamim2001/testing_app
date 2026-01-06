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

interface TitleItem {
  id: string;
  text: string;
  icon?: string;
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
  const handleTitleChange = (
    slideId: string,
    titleIndex: number,
    value: string
  ) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const updatedTitles = [...((slide as any).titles || [])];
    if (!updatedTitles[titleIndex]) {
      updatedTitles[titleIndex] = { id: `title-${Date.now()}`, text: '', icon: '' };
    }
    updatedTitles[titleIndex].text = value;
    updateSlide(section.id, slideId, { titles: updatedTitles } as any);
  };

  const addTitle = (slideId: string) => {
    const slide = section.slides.find(s => s.id === slideId);
    if (!slide) return;

    const newTitles = [...((slide as any).titles || []), { id: `title-${Date.now()}`, text: '', icon: '' }];
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
          {/* {removeSlide && (
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
          )} */}
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor={`slide-title-${slide.id}`} className="text-sm font-medium">
                Title
              </Label>
              <Input
                id={`slide-title-${slide.id}`}
                placeholder="e.g., Testimonials"
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

            {/* Testimonials Items Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Testimonials</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTitle(slide.id)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Testimonial
                </Button>
              </div>

              <div className="space-y-3">
                {((slide as any).titles || []).map((title: TitleItem, titleIndex: number) => (
                  <Card key={titleIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Client Name */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Client Name</Label>
                        <Input
                          placeholder="e.g., John Smith"
                          value={title.text}
                          onChange={(e) =>
                            handleTitleChange(slide.id, titleIndex, e.target.value)
                          }
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Testimonial Text */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Testimonial</Label>
                        <Textarea
                          placeholder="e.g., This company provided exceptional service..."
                          value={title.icon || ''}
                          onChange={(e) => {
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].icon = e.target.value;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                          disabled={loading}
                          className="text-xs min-h-[60px]"
                        />
                      </div>

                      {/* File Upload */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Upload File</Label>
                        <Input
                          type="file"
                          className="text-xs"
                          disabled={loading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // You can handle the file upload logic here, e.g., upload to server or update state
                            // For now, just update the file name in the title object as an example
                            const updated = [...((slide as any).titles || [])];
                            updated[titleIndex].file = file;
                            updateSlide(section.id, slide.id, { titles: updated } as any);
                          }}
                        />
                        {/* Optionally, show the uploaded file name */}
                        {title.file && (
                          <div className="text-xs text-muted-foreground">{typeof title.file === 'string' ? title.file : title.file.name}</div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTitle(slide.id, titleIndex)}
                        disabled={loading}
                        className="text-xs text-red-500 hover:text-red-700 w-full"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Testimonial
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Add Slide Button */}
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => addSlide(section.id)}
              disabled={loading}
              className="w-full mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button> */}
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
}
