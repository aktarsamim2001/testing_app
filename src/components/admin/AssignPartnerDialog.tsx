import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
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
  const [errors, setErrors] = useState<{ partner?: string; compensation?: string }>({});
  const { toast } = useToast();

  const dispatch = useDispatch();
  useEffect(() => {
    if (open) {
      setSelectedPartnerId('');
      setCompensation('');
      setStatus('pending');
      setNotes('');
      setErrors({});
      dispatch<any>(fetchPartners(1, 100));
    }
  }, [open, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { partner?: string; compensation?: string } = {};
    if (!selectedPartnerId) {
      newErrors.partner = 'Please select a partner.';
    }
    if (compensation) {
      const compValue = Number(compensation);
      if (isNaN(compValue) || compValue < 0) {
        newErrors.compensation = 'Compensation must be a non-negative number.';
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
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
    toast({
      title: "Partner assigned!",
      description: "Partner has been successfully assigned to the campaign.",
      variant: "success",
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Partner to Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Select a partner and set their compensation details
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner">Partner <span className="text-red-500">*</span></Label>
            <Select value={selectedPartnerId} onValueChange={(v) => { setSelectedPartnerId(v); if (errors.partner) setErrors(e => ({ ...e, partner: undefined })); }} disabled={partnersLoading}>
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
            {errors.partner && <div className="text-red-500 text-xs mt-1">{errors.partner}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation">Compensation ($)</Label>
            <Input
              id="compensation"
              type="number"
              step="0.01"
              value={compensation}
              onChange={(e) => {
                setCompensation(e.target.value);
                if (errors.compensation) setErrors(e => ({ ...e, compensation: undefined }));
              }}
              placeholder="0.00"
            />
            {errors.compensation && <div className="text-red-500 text-xs mt-1">{errors.compensation}</div>}
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

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Partner'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
