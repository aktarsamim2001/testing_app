import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDispatch, useSelector } from 'react-redux';
import { assignPartnerToCampaign } from '@/store/slices/campaignPartners';
import { fetchPartners, selectPartners, selectPartnersLoading } from '@/store/slices/partners';
import { useToast } from '@/hooks/use-toast';

interface AssignPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

interface Partner {
  id: string;
  name: string;
  channel_type: string;
}

export default function AssignPartnerDialog({ open, onOpenChange, campaignId }: AssignPartnerDialogProps) {
  const partners = useSelector(selectPartners);
  const partnersLoading = useSelector(selectPartnersLoading);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [compensation, setCompensation] = useState('');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const dispatch = useDispatch();
  useEffect(() => {
    if (open) {
      setSelectedPartnerId('');
      setCompensation('');
      setStatus('pending');
      setNotes('');
      dispatch<any>(fetchPartners(1, 100));
    }
  }, [open, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) {
      toast({ title: 'Error', description: 'Please select a partner', variant: 'destructive' });
      return;
    }
    setLoading(true);
    // Ensure compensation is sent as a string and status is capitalized
    const formattedCompensation = compensation ? compensation.toString() : "";
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    await dispatch<any>(assignPartnerToCampaign({
      campaign_id: campaignId,
      partner_id: selectedPartnerId,
      compensation: formattedCompensation,
      status: formattedStatus,
      notes: notes || null
    }));
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Partner to Campaign</DialogTitle>
          <DialogDescription>
            Select a partner and set their compensation details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner">Partner *</Label>
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId} disabled={partnersLoading}>
              <SelectTrigger>
                <SelectValue placeholder={partnersLoading ? "Loading..." : "Select a partner"} />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name} ({partner.channel_type.replace(/_/g, ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation">Compensation ($)</Label>
            <Input
              id="compensation"
              type="number"
              step="0.01"
              value={compensation}
              onChange={(e) => setCompensation(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes about this partnership..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Partner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
