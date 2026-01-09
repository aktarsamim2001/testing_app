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
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
}

export default function CampaignDialog({ open, onOpenChange, campaign }: CampaignDialogProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    client_id: string;
    type: 'blogger_outreach' | 'linkedin_influencer' | 'youtube_campaign';
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
    budget: string;
    start_date: string;
    end_date: string;
    description: string;
  }>({
    name: '',
    client_id: '',
    type: 'blogger_outreach',
    status: 'planning',
    budget: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    client_id?: string;
    type?: string;
    budget?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('id, company_name').order('company_name');
      setClients(data || []);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    // Always clear errors when dialog opens or campaign changes
    setErrors({});
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        client_id: campaign.client_id || '',
        type: campaign.type || 'blogger_outreach',
        status: campaign.status || 'planning',
        budget: campaign.budget?.toString() || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        description: campaign.description || ''
      });
    } else {
      setFormData({
        name: '',
        client_id: '',
        type: 'blogger_outreach',
        status: 'planning',
        budget: '',
        start_date: '',
        end_date: '',
        description: ''
      });
    }
  }, [campaign, open]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required.';
    }
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required.';
    }
    if (!formData.type) {
      newErrors.type = 'Campaign type is required.';
    }
    // Budget: allow empty, but if not empty, must be a positive float
    if (formData.budget && !formData.budget.trim()) {
      newErrors.budget = 'Budget cannot be only spaces.';
    } else if (formData.budget) {
      const budgetVal = parseFloat(formData.budget);
      if (isNaN(budgetVal) || budgetVal < 0) {
        newErrors.budget = 'Budget must be a positive number.';
      }
    }
    // Start date: allow empty, but if not empty, must be valid ISO date
    if (formData.start_date && !formData.start_date.trim()) {
      newErrors.start_date = 'Start date cannot be only spaces.';
    } else if (formData.start_date && isNaN(Date.parse(formData.start_date))) {
      newErrors.start_date = 'Start date must be a valid date.';
    }
    // End date: allow empty, but if not empty, must be valid ISO date and after start_date
    if (formData.end_date && !formData.end_date.trim()) {
      newErrors.end_date = 'End date cannot be only spaces.';
    } else if (formData.end_date && isNaN(Date.parse(formData.end_date))) {
      newErrors.end_date = 'End date must be a valid date.';
    } else if (formData.start_date && formData.end_date) {
      const start = Date.parse(formData.start_date);
      const end = Date.parse(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date cannot be before start date.';
      }
    }
    // Description: allow empty, but if not empty, must not be only spaces
    if (formData.description && !formData.description.trim()) {
      newErrors.description = 'Description cannot be only spaces.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);

    const data = {
      name: formData.name,
      client_id: formData.client_id,
      type: formData.type,
      status: formData.status,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description || null,
      created_by: user?.id
    };

    const { error } = campaign
      ? await supabase.from('campaigns').update(data).eq('id', campaign.id)
      : await supabase.from('campaigns').insert([data]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      // Dialog stays open on error so user can fix and retry
    } else {
      toast({ title: 'Success', description: `Campaign ${campaign ? 'updated' : 'created'} successfully` });
      // Only close dialog on success
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaign ? 'Update campaign details' : 'Create a new marketing campaign'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={!!errors.name}
              // required removed for custom validation only
            />
            {errors.name && (
              <div className="text-red-500 text-xs mt-1">{errors.name}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => {
                setFormData({ ...formData, client_id: value });
                if (errors.client_id) setErrors((prev) => ({ ...prev, client_id: undefined }));
              }}>
                <SelectTrigger aria-invalid={!!errors.client_id}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <div className="text-red-500 text-xs mt-1">{errors.client_id}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'blogger_outreach' | 'linkedin_influencer' | 'youtube_campaign') => {
                setFormData({ ...formData, type: value });
                if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }));
              }}>
                <SelectTrigger aria-invalid={!!errors.type}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blogger_outreach">Blogger Outreach</SelectItem>
                  <SelectItem value="linkedin_influencer">LinkedIn Influencer</SelectItem>
                  <SelectItem value="youtube_campaign">YouTube Campaign</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <div className="text-red-500 text-xs mt-1">{errors.type}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <PremiumDatePicker
                label=""
                value={formData.start_date ? new Date(formData.start_date) : null}
                onChange={(date) => setFormData({ ...formData, start_date: date ? date.toISOString().slice(0, 10) : '' })}
                minDate={null}
                maxDate={formData.end_date ? new Date(formData.end_date) : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <PremiumDatePicker
                label=""
                value={formData.end_date ? new Date(formData.end_date) : null}
                onChange={(date) => setFormData({ ...formData, end_date: date ? date.toISOString().slice(0, 10) : '' })}
                minDate={formData.start_date ? new Date(formData.start_date) : undefined}
                maxDate={null}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : campaign ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
