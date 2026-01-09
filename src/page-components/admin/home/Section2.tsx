'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Section2Props {
  section: any;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: any) => void;
  addSlide: (sectionId: string) => void;
}

export default function Section2({
  section,
  loading,
  updateSlide,
  addSlide,
}: Section2Props) {
  const [collapsedCards, setCollapsedCards] = useState(false);

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
      {section.slides.length === 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSlide(section.id)}
          className="w-full text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Initialize Section
        </Button>
      )}

      {section.slides.length > 0 && (
        <div className="space-y-3">
          {/* Title 1 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Badge Title</Label>
            <Input
               value={section.slides[0]?.title === 'Slide 1' ? '' : (section.slides[0]?.title || '')}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { title: e.target.value })
              }
              placeholder="Badge Title"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Title 2 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Title</Label>
            <Input
              value={section.slides[0]?.subtitle || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { subtitle: e.target.value })
              }
              placeholder="Title"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={section.slides[0]?.description || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { description: e.target.value })
              }
              placeholder="Enter section description..."
              className="w-full text-sm border rounded p-2 min-h-20 font-sans"
              disabled={loading}
            />
          </div>

          {/* Cards Section */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Cards</Label>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {((section.slides[0] as any)?.cards || []).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentCards = (section.slides[0] as any)?.cards || [];
                    updateSlide(section.id, section.slides[0].id, {
                      ...section.slides[0],
                      cards: [
                        ...currentCards,
                        {
                          id: `card-${Date.now()}`,
                          icon: '',
                          title: '',
                          subtitle: '',
                          description: '',
                          buttonText: '',
                          buttonUrl: '',
                        },
                      ],
                    } as any);
                  }}
                  className="text-xs h-7"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Card
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsedCards(!collapsedCards)}
                  className="h-6 w-6 p-0"
                >
                  {collapsedCards ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {!collapsedCards && (
              <>
                {((section.slides[0] as any)?.cards || []).map((card: any, index: number) => (
                  <div key={card.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Card {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedCards = ((section.slides[0] as any)?.cards || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        className="h-6 w-6 p-0"
                        disabled={loading}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>

                    {/* Icon Upload */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Icon</Label>
                      <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const updatedCards = [
                                ...((section.slides[0] as any)?.cards || []),
                              ];
                              updatedCards[index].icon = `/uploads/icons/${e.target.files[0].name}`;
                              updateSlide(section.id, section.slides[0].id, {
                                ...section.slides[0],
                                cards: updatedCards,
                              } as any);
                            }
                          }}
                          disabled={loading}
                          className="hidden"
                          id={`card-icon-${card.id}`}
                        />
                        <label htmlFor={`card-icon-${card.id}`} className="cursor-pointer block">
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary font-medium">Upload icon</span>
                          </p>
                        </label>
                      </div>
                      {/* {card.icon && (
                        <p className="text-xs text-muted-foreground">Selected: {card.icon}</p>
                      )} */}
                    </div>

                    {/* Title 1 */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Channel Title</Label>
                      <Input
                        value={card.title || ''}
                        onChange={(e) => {
                          const updatedCards = [
                            ...((section.slides[0] as any)?.cards || []),
                          ];
                          updatedCards[index].title = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        placeholder="Channel title"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>

                    {/* Title 2 */}
                    {/* <div className="space-y-1">
                      <Label className="text-xs font-medium">Title 2</Label>
                      <Input
                        value={card.subtitle || ''}
                        onChange={(e) => {
                          const updatedCards = [
                            ...((section.slides[0] as any)?.cards || []),
                          ];
                          updatedCards[index].subtitle = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        placeholder="e.g., $100-300 per post"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div> */}

                    {/* Description */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Channel Description</Label>
                      <Textarea
                        value={card.description || ''}
                        onChange={(e) => {
                          const updatedCards = [
                            ...((section.slides[0] as any)?.cards || []),
                          ];
                          updatedCards[index].description = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        placeholder="Channel description"
                        className="w-full text-xs border rounded p-2 min-h-16 font-sans"
                        disabled={loading}
                      />
                    </div>

                    {/* Button Text */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Button Text</Label>
                      <Input
                        value={card.buttonText || ''}
                        onChange={(e) => {
                          const updatedCards = [
                            ...((section.slides[0] as any)?.cards || []),
                          ];
                          updatedCards[index].buttonText = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        placeholder="Button Text"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>

                    {/* Button URL */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Button URL</Label>
                      <Input
                        value={card.buttonUrl || ''}
                        onChange={(e) => {
                          const updatedCards = [
                            ...((section.slides[0] as any)?.cards || []),
                          ];
                          updatedCards[index].buttonUrl = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            cards: updatedCards,
                          } as any);
                        }}
                        placeholder="/example"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
