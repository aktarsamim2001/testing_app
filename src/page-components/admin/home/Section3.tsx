'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Section3Props {
  section: any;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: any) => void;
  addSlide: (sectionId: string) => void;
  showButton?: boolean;
}

export default function Section3({
  section,
  loading,
  updateSlide,
  addSlide,
  showButton = false,
}: Section3Props) {
  const [collapsedSteps, setCollapsedSteps] = useState(false);

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
            <Label className="text-xs font-medium">Title 1</Label>
            <Input
              value={section.slides[0]?.title === 'Slide 1' ? '' : (section.slides[0]?.title || '')}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { title: e.target.value })
              }
              placeholder="e.g., Why Join?"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Title 2 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Title 2 (Subtitle)</Label>
            <Input
              value={section.slides[0]?.subtitle || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { subtitle: e.target.value })
              }
              placeholder="e.g., Everything you need"
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

          {/* Button (conditional) */}
          {showButton && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Button Text</Label>
                <Input
                  value={section.slides[0]?.button1Text || ''}
                  onChange={(e) =>
                    updateSlide(section.id, section.slides[0].id, {
                      button1Text: e.target.value,
                    })
                  }
                  placeholder="e.g., Get Started"
                  className="text-sm"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Button URL / Endpoint</Label>
                <Input
                  value={(section.slides[0] as any)?.button1Url || ''}
                  onChange={(e) =>
                    updateSlide(section.id, section.slides[0].id, {
                      ...section.slides[0],
                      button1Url: e.target.value,
                    } as any)
                  }
                  placeholder="e.g., /signup or https://example.com"
                  className="text-sm"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Steps Section */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Steps</Label>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {((section.slides[0] as any)?.steps || []).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentSteps = (section.slides[0] as any)?.steps || [];
                    updateSlide(section.id, section.slides[0].id, {
                      ...section.slides[0],
                      steps: [...currentSteps, { title: '', description: '' }],
                    } as any);
                  }}
                  className="text-xs h-7"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Step
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsedSteps(!collapsedSteps)}
                  className="h-6 w-6 p-0"
                >
                  {collapsedSteps ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {!collapsedSteps && (
              <>
                {((section.slides[0] as any)?.steps || []).map((step: any, index: number) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Step {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedSteps = ((section.slides[0] as any)?.steps || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            steps: updatedSteps,
                          } as any);
                        }}
                        className="h-6 w-6 p-0"
                        disabled={loading}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Title</Label>
                      <Input
                        value={step.title || ''}
                        onChange={(e) => {
                          const updatedSteps = [
                            ...((section.slides[0] as any)?.steps || []),
                          ];
                          updatedSteps[index].title = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            steps: updatedSteps,
                          } as any);
                        }}
                        placeholder="e.g., Create Your Profile"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Button (CTA) */}
            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm font-medium">Button (CTA)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Button Text</Label>
                  <Input
                    placeholder="e.g., Get Started Today"
                    value={(section.slides[0] as any)?.button1Text || ''}
                    onChange={(e) =>
                      updateSlide(section.id, section.slides[0].id, {
                        ...section.slides[0],
                        button1Text: e.target.value,
                      } as any)
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Button URL</Label>
                  <Input
                    placeholder="e.g., /get-started"
                    value={(section.slides[0] as any)?.button1Url || ''}
                    onChange={(e) =>
                      updateSlide(section.id, section.slides[0].id, {
                        ...section.slides[0],
                        button1Url: e.target.value,
                      } as any)
                    }
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Stats Management */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Stat Cards</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStats = [...((section.slides[0] as any)?.stats || []), { number: '', label: '' }];
                    updateSlide(section.id, section.slides[0].id, {
                      ...section.slides[0],
                      stats: newStats,
                    } as any);
                  }}
                  disabled={loading}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Stat
                </Button>
              </div>

              <div className="space-y-3">
                {((section.slides[0] as any)?.stats || []).map((stat: any, statIndex: number) => (
                  <Card key={statIndex} className="p-3 bg-muted/50">
                    <div className="space-y-2">
                      {/* Stat Number */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Number/Value</Label>
                        <Input
                          placeholder="e.g., 5X, $2M+, 10K+, 92%"
                          value={stat.number}
                          onChange={(e) => {
                            const newStats = [...((section.slides[0] as any)?.stats || [])];
                            newStats[statIndex].number = e.target.value;
                            updateSlide(section.id, section.slides[0].id, {
                              ...section.slides[0],
                              stats: newStats,
                            } as any);
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                      </div>

                      {/* Stat Label */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Label/Description</Label>
                        <Input
                          placeholder="e.g., Average traffic increase"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...((section.slides[0] as any)?.stats || [])];
                            newStats[statIndex].label = e.target.value;
                            updateSlide(section.id, section.slides[0].id, {
                              ...section.slides[0],
                              stats: newStats,
                            } as any);
                          }}
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
                              const newStats = [...((section.slides[0] as any)?.stats || [])];
                              newStats[statIndex].icon = `/uploads/icons/${file.name}`;
                              updateSlide(section.id, section.slides[0].id, {
                                ...section.slides[0],
                                stats: newStats,
                              } as any);
                            }
                          }}
                          disabled={loading}
                          className="text-xs"
                        />
                        {stat.icon && (
                          <p className="text-xs text-green-600">✓ Icon uploaded</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newStats = ((section.slides[0] as any)?.stats || []).filter(
                            (_: any, i: number) => i !== statIndex
                          );
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            stats: newStats,
                          } as any);
                        }}
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
          </div>
        </div>
      )}
    </div>
  );
}
