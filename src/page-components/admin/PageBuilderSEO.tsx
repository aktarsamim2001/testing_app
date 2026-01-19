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
  errors?: {
    seoTitle?: string;
    seoDescription?: string;
    seoImage?: string;
  };
}

const PageBuilderSEO: React.FC<PageBuilderSEOProps> = ({ seoData, setSeoData, loading, errors = {} }) => (
  <Card className="p-5">
  <div className="space-y-4 mt-4">
    <h3 className="font-semibold text-sm">SEO Settings</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="seo-title" className="text-sm font-medium">
          Seo title<span className="text-red-500">*</span>
        </Label>
        <Input
          id="seo-title"
          placeholder="Enter SEO title"
          value={seoData.title}
          onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
          disabled={loading}
          className={`text-sm`}
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
        Meta description<span className="text-red-500">*</span>
      </Label>
      <Textarea
        id="seo-description"
        placeholder="Enter meta description"
        value={seoData.description}
        onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
        disabled={loading}
        className={`w-full text-xs border rounded p-2 min-h-20 font-sans`}
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
        Image<span className="text-red-500">*</span>
      </Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${errors.seoImage ? 'border-red-500' : ''}`}
        onClick={() => document.getElementById('seo-image')?.click()}
      >
        <p className="text-sm text-muted-foreground">
          Drag & Drop your files or <span className="text-primary font-medium">Browse</span>
        </p>
        <Input
          id="seo-image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              // Create a URL for the file
              const fileUrl = URL.createObjectURL(file);
              // Store the file path
              setSeoData({ ...seoData, image: fileUrl });
            }
          }}
          disabled={loading}
          className="hidden"
        />
      </div>
      {seoData.image && (
        <div className="space-y-2">
          <img 
            src={seoData.image} 
            alt="SEO Preview" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <p className="text-xs text-muted-foreground">Image selected and ready to upload</p>
        </div>
      )}
      {errors.seoImage && <p className="text-xs text-red-500">{errors.seoImage}</p>}
    </div>
  </div>
</Card>
);

export default PageBuilderSEO;
