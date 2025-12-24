import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import SectionRenderer from './SectionRenderer';

interface SectionData {
  id: string;
  name: string;
  type: string;
  slides: any[];
}

interface PageBuilderSectionsProps {
  sections: SectionData[];
  formData: any;
  activeSection: string;
  setActiveSection: (id: string) => void;
  collapsedSections: Set<string>;
  toggleCollapse: (id: string) => void;
  loading: boolean;
  updateSlide: any;
  addSlide: any;
  removeSlide: any;
  TEMPLATE_SECTIONS: Record<string, SectionData[]>;
}

const PageBuilderSections: React.FC<PageBuilderSectionsProps> = ({
  sections,
  formData,
  activeSection,
  setActiveSection,
  collapsedSections,
  toggleCollapse,
  loading,
  updateSlide,
  addSlide,
  removeSlide,
  TEMPLATE_SECTIONS,
}) => (
  <Card>
    <CardContent className="pt-6">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted p-1 gap-1 h-auto flex-wrap">
            {sections.filter(section => {
              const templateSections = TEMPLATE_SECTIONS[formData.template as keyof typeof TEMPLATE_SECTIONS] || [];
              const maxSectionCount = templateSections.length;
              const sectionMatch = section.name.match(/Section (\d+)/);
              const sectionNumber = sectionMatch ? parseInt(sectionMatch[1]) : 0;
              return sectionNumber > 0 && sectionNumber <= maxSectionCount;
            }).map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="text-xs whitespace-nowrap"
              >
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {sections.map((section) => (
          <TabsContent 
            key={section.id} 
            value={section.id}
            className="space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{section.name}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCollapse(section.id)}
                  className="h-6 w-6 p-0"
                >
                  {collapsedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {!collapsedSections.has(section.id) && (
                <SectionRenderer
                  section={section}
                  formData={formData}
                  loading={loading}
                  updateSlide={updateSlide}
                  addSlide={addSlide}
                  removeSlide={removeSlide}
                />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardContent>
  </Card>
);

export default PageBuilderSections;
