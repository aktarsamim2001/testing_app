import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: any;
}

export default function PartnerDialog({ open, onOpenChange, partner }: PartnerDialogProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    channel_type: 'blogger' | 'linkedin' | 'youtube';
    platform_handle: string;
    follower_count: string;
    engagement_rate: string;
    category: string;
    notes: string;
  }>({
    name: '',
    email: '',
    channel_type: 'blogger',
    platform_handle: '',
    follower_count: '',
    engagement_rate: '',
    category: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        email: partner.email || '',
        channel_type: partner.channel_type || 'blogger',
        platform_handle: partner.platform_handle || '',
        follower_count: partner.follower_count?.toString() || '',
        engagement_rate: partner.engagement_rate?.toString() || '',
        category: partner.category?.join(', ') || '',
        notes: partner.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        channel_type: 'blogger',
        platform_handle: '',
        follower_count: '',
        engagement_rate: '',
        category: '',
        notes: ''
      });
    }
  }, [partner, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: formData.name,
      email: formData.email,
      channel_type: formData.channel_type,
      platform_handle: formData.platform_handle || null,
      follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
      engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
      category: formData.category ? formData.category.split(',').map(c => c.trim()) : null,
      notes: formData.notes || null,
      created_by: user?.id
    };

    const { error } = partner
      ? await supabase.from('partners').update(data).eq('id', partner.id)
      : await supabase.from('partners').insert([data]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Partner ${partner ? 'updated' : 'created'} successfully` });
      onOpenChange(false);
    }
    setLoading(false);
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel_type">Channel Type *</Label>
              <Select value={formData.channel_type} onValueChange={(value: 'blogger' | 'linkedin' | 'youtube') => setFormData({ ...formData, channel_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blogger">Blogger</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
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
            <Label htmlFor="category">Categories (comma-separated)</Label>
            <Input
              id="category"
              placeholder="Tech, SaaS, B2B"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
