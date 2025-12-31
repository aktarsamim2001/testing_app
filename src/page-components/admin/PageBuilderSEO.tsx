import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea} from '@/components/ui/textarea';

interface PageBuilderSEOProps {
  seoData: {
    title: string;
    author: string;
    description: string;
    keywords: string;
    image: string;
  };
  setSeoData: (data: any) => void;
  loading: boolean;
}

const PageBuilderSEO: React.FC<PageBuilderSEOProps> = ({ seoData, setSeoData, loading }) => (
  <Card className="p-5">
  <div className="space-y-4 mt-4">
    <h3 className="font-semibold text-sm">SEO Settings</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="seo-title" className="text-sm font-medium">
          Seo title
        </Label>
        <Input
          id="seo-title"
          placeholder="Enter SEO title"
          value={seoData.title}
          onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
          disabled={loading}
          className="text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-author" className="text-sm font-medium">
          Author
        </Label>
        <Input
          id="seo-author"
          placeholder="Enter author name"
          value={seoData.author}
          onChange={(e) => setSeoData({ ...seoData, author: e.target.value })}
          disabled={loading}
          className="text-sm"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="seo-description" className="text-sm font-medium">
        Meta description
      </Label>
      <Textarea
        id="seo-description"
        placeholder="Enter meta description"
        value={seoData.description}
        onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
        disabled={loading}
        className="w-full text-xs border rounded p-2 min-h-20 font-sans"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="seo-keywords" className="text-sm font-medium">
        Meta keywords
      </Label>
      <Input
        id="seo-keywords"
        placeholder="Enter meta keywords (comma-separated)"
        value={seoData.keywords}
        onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
        disabled={loading}
        className="text-sm"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="seo-image" className="text-sm font-medium">
        Image
      </Label>
      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
        <p className="text-sm text-muted-foreground">
          Drag & Drop your files or <span className="text-primary font-medium">Browse</span>
        </p>
        <Input
          id="seo-image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setSeoData({ ...seoData, image: e.target.files[0].name });
            }
          }}
          disabled={loading}
          className="hidden"
        />
      </div>
      {seoData.image && (
        <p className="text-xs text-muted-foreground">Selected: {seoData.image}</p>
      )}
    </div>
  </div>
</Card>
);

export default PageBuilderSEO;
