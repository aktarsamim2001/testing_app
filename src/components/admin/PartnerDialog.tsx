import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppDispatch } from '@/store';
import { createPartnerThunk, updatePartnerThunk } from '@/store/slices/partners';

// Use the Partner type from the store to ensure consistency
import type { Partner } from '@/store/slices/partners';

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: Partner | null;
}

export default function PartnerDialog({ open, onOpenChange, partner }: PartnerDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    channel_type: string;
    platform_handle: string;
    follower_count: string;
    engagement_rate: string;
    categories: string;
    notes: string;
    status: number;
  }>({
    name: '',
    email: '',
    channel_type: 'blogger',
    platform_handle: '',
    follower_count: '',
    engagement_rate: '',
    categories: '',
    notes: '',
    status: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    channel_type?: string;
  }>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        channel_type: partner.channel_type || 'blogger',
        platform_handle: partner.platform_handle || '',
        follower_count: partner.follower_count?.toString() || '',
        engagement_rate: partner.engagement_rate?.toString() || '',
        categories: Array.isArray(partner.categories) ? partner.categories.join(", ") : partner.categories || '',
        notes: partner.notes || '',
        status: partner.status ?? 0
      });
    } else {
      setFormData({
        name: '',
        email: '',
        channel_type: 'blogger',
        platform_handle: '',
        follower_count: '',
        engagement_rate: '',
        categories: '',
        notes: '',
        status: 0
      });
    }
  }, [partner, open]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.channel_type) {
      newErrors.channel_type = 'Channel type is required.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        channel_type: formData.channel_type,
        platform_handle: formData.platform_handle || null,
        follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
        engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
        categories: formData.categories ? formData.categories : null,
        notes: formData.notes || null,
        status: formData.status
      };

      if (partner) {
        await dispatch(updatePartnerThunk({
          id: partner.id,
          ...payload
        }));
      } else {
        await dispatch(createPartnerThunk(payload));
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting partner:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
          <DialogDescription>
            {partner ? 'Update partner information' : 'Add a new influencer or content creator'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-invalid={!!errors.name}
                // required removed for custom validation only
              />
              {errors.name && (
                <div className="text-red-500 text-xs mt-1">{errors.name}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={!!errors.email}
                // required removed for custom validation only
              />
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel_type">Channel Type <span className="text-red-500">*</span></Label>
              <Select value={formData.channel_type} onValueChange={(value) => setFormData({ ...formData, channel_type: value })}>
                <SelectTrigger aria-invalid={!!errors.channel_type}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blogger">Blogger</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
                {errors.channel_type && (
                  <div className="text-red-500 text-xs mt-1">{errors.channel_type}</div>
                )}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform_handle">Platform Handle</Label>
              <Input
                id="platform_handle"
                placeholder="@username"
                value={formData.platform_handle}
                onChange={(e) => setFormData({ ...formData, platform_handle: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="follower_count">Follower Count</Label>
              <Input
                id="follower_count"
                type="number"
                value={formData.follower_count}
                onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                step="0.01"
                value={formData.engagement_rate}
                onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              placeholder="Tech, SaaS, B2B"
              value={formData.categories}
              onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : partner ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
