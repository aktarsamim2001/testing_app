import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface PageBuilderFormProps {
  formData: {
    title: string;
    slug: string;
    template: string;
    status: 'active' | 'inactive';
  };
  loading: boolean;
  isEditMode: boolean;
  handleTitleChange: (title: string) => void;
  setFormData: (data: any) => void;
  handleTemplateChange: (template: string) => void;
  errors?: {
    title?: string;
    template?: string;
    slug?: string;
  };
}

const PageBuilderForm: React.FC<PageBuilderFormProps> = ({
  formData,
  loading,
  isEditMode,
  handleTitleChange,
  setFormData,
  handleTemplateChange,
  errors = {},
}) => (
  <Card className="p-4">
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title<span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Enter page title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          disabled={loading}
          className={`text-sm ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-medium">
          Slug<span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          placeholder="auto-generated"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          disabled={loading || isEditMode}
          readOnly={isEditMode}
          className={`text-sm bg-muted ${errors.slug ? 'border-red-500' : ''}`}
        />
        {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
        {!errors.slug && <p className="text-xs text-muted-foreground">Auto-generated from title</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="template" className="text-sm font-medium">
          Template<span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.template}
          onValueChange={handleTemplateChange}
          disabled={loading || isEditMode}
        >
          <SelectTrigger id="template" className={`text-sm ${errors.template ? 'border-red-500' : ''}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="creators">Creators</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="how-it-works">How It Works</SelectItem>
            <SelectItem value="pricing">Pricing</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="about">About</SelectItem>
            <SelectItem value="contact">Contact</SelectItem>
          </SelectContent>
        </Select>
        {errors.template && <p className="text-xs text-red-500">{errors.template}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
          disabled={loading}
        >
          <SelectTrigger id="status" className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="pt-4 border-t space-y-1 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Created At</span>
          <p>{isEditMode ? new Date().toLocaleDateString() : '--'}</p>
        </div>
        <div>
          <span className="font-medium">Updated At</span>
          <p>{isEditMode ? new Date().toLocaleDateString() : '--'}</p>
        </div>
      </div>
    </div>
  </Card>
);

export default PageBuilderForm;
