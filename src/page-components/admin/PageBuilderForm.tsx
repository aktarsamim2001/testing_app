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
}

const PageBuilderForm: React.FC<PageBuilderFormProps> = ({
  formData,
  loading,
  isEditMode,
  handleTitleChange,
  setFormData,
  handleTemplateChange,
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
          className="text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-sm font-medium">
          Slug
        </Label>
        <Input
          id="slug"
          placeholder="auto-generated"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          disabled={loading}
          className="text-sm bg-muted"
        />
        <p className="text-xs text-muted-foreground">Auto-generated from title</p>
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
          <SelectTrigger id="template" className="text-sm">
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
