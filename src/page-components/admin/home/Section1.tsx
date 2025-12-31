'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface Section1Props {
  section: any;
  loading: boolean;
  updateSlide: (sectionId: string, slideId: string, updates: any) => void;
  addSlide: (sectionId: string) => void;
}

export default function Section1({
  section,
  loading,
  updateSlide,
  addSlide,
}: Section1Props) {
  const [collapsedStats, setCollapsedStats] = useState(false);

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
          Initialize Banner
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
              placeholder="e.g., Slide 1"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Title 2 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Title 2</Label>
            <Input
              value={section.slides[0]?.subtitle || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { subtitle: e.target.value })
              }
              placeholder="e.g., Additional title"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Description</Label>
            <textarea
              value={section.slides[0]?.description || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { description: e.target.value })
              }
              placeholder="Enter banner description..."
              className="w-full text-sm border rounded p-2 min-h-20 font-sans"
              disabled={loading}
            />
          </div>

          {/* Button 1 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Button 1 Text</Label>
            <Input
              value={section.slides[0]?.button1Text || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { button1Text: e.target.value })
              }
              placeholder="e.g., Start Growing Today"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Button 1 URL/Endpoint */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Button 1 URL</Label>
            <Input
              value={(section.slides[0] as any)?.button1Url || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, {
                  ...section.slides[0],
                  button1Url: e.target.value,
                } as any)
              }
              placeholder="e.g., /start or https://example.com"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Button 2 */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Button 2 Text</Label>
            <Input
              value={section.slides[0]?.button2Text || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, { button2Text: e.target.value })
              }
              placeholder="e.g., See How It Works"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Button 2 URL/Endpoint */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Button 2 URL</Label>
            <Input
              value={(section.slides[0] as any)?.button2Url || ''}
              onChange={(e) =>
                updateSlide(section.id, section.slides[0].id, {
                  ...section.slides[0],
                  button2Url: e.target.value,
                } as any)
              }
              placeholder="e.g., /how-it-works or https://example.com/info"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Stats Section */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Stats</Label>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {((section.slides[0] as any)?.stats || []).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentStats = (section.slides[0] as any)?.stats || [];
                    updateSlide(section.id, section.slides[0].id, {
                      ...section.slides[0],
                      stats: [...currentStats, { number: '', label: '', test: '' }],
                    } as any);
                  }}
                  className="text-xs h-7"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Stat
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsedStats(!collapsedStats)}
                  className="h-6 w-6 p-0"
                >
                  {collapsedStats ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {!collapsedStats && (
              <>
                {((section.slides[0] as any)?.stats || []).map((stat: any, index: number) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Stat {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedStats = ((section.slides[0] as any)?.stats || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            stats: updatedStats,
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
                              const updatedStats = [
                                ...((section.slides[0] as any)?.stats || []),
                              ];
                              updatedStats[index].icon = e.target.files[0].name;
                              updateSlide(section.id, section.slides[0].id, {
                                ...section.slides[0],
                                stats: updatedStats,
                              } as any);
                            }
                          }}
                          disabled={loading}
                          className="hidden"
                          id={`stat-icon-${index}`}
                        />
                        <label htmlFor={`stat-icon-${index}`} className="cursor-pointer block">
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary font-medium">Upload icon</span>
                          </p>
                        </label>
                      </div>
                      {stat.icon && (
                        <p className="text-xs text-muted-foreground">Selected: {stat.icon}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Number</Label>
                      <Input
                        value={stat.number || ''}
                        onChange={(e) => {
                          const updatedStats = [
                            ...((section.slides[0] as any)?.stats || []),
                          ];
                          updatedStats[index].number = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            stats: updatedStats,
                          } as any);
                        }}
                        placeholder="e.g., 500+"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Label</Label>
                      <Input
                        value={stat.label || ''}
                        onChange={(e) => {
                          const updatedStats = [
                            ...((section.slides[0] as any)?.stats || []),
                          ];
                          updatedStats[index].label = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            stats: updatedStats,
                          } as any);
                        }}
                        placeholder="e.g., Active Campaigns"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div>

                    {/* <div className="space-y-1">
                      <Label className="text-xs font-medium">Test</Label>
                      <Input
                        type="number"
                        value={stat.test || ''}
                        onChange={(e) => {
                          const updatedStats = [
                            ...((section.slides[0] as any)?.stats || []),
                          ];
                          updatedStats[index].test = e.target.value;
                          updateSlide(section.id, section.slides[0].id, {
                            ...section.slides[0],
                            stats: updatedStats,
                          } as any);
                        }}
                        placeholder="e.g., 1000"
                        className="text-sm"
                        disabled={loading}
                      />
                    </div> */}
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
