import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactSelect, { OptionType } from '@/components/ui/ReactSelect';
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
  const [errors, setErrors] = useState<{ partner?: string; compensation?: string; notes?: string }>({});
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

  const validate = () => {
    const newErrors: { partner?: string; compensation?: string; notes?: string } = {};
    
    // Partner validation
    if (!selectedPartnerId || !selectedPartnerId.trim()) {
      newErrors.partner = 'Please select a partner.';
    }
    
    // Compensation validation
    if (compensation && compensation.trim()) {
      const compValue = Number(compensation);
      if (isNaN(compValue)) {
        newErrors.compensation = 'Compensation must be a valid number.';
      } else if (compValue < 0) {
        newErrors.compensation = 'Compensation cannot be negative.';
      }
    }
    
    // Notes validation: if not empty, must not be only spaces
    if (notes && !notes.trim()) {
      newErrors.notes = 'Notes cannot be only spaces.';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Ensure compensation is sent as a string and status is capitalized
      const formattedCompensation = compensation ? compensation.toString() : "";
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      
      const result = await dispatch<any>(assignPartnerToCampaign({
        campaign_id: campaignId,
        partner_id: selectedPartnerId,
        compensation: formattedCompensation,
        status: formattedStatus,
        notes: notes.trim() || null
      }));
      
      // Only close dialog on success, keep open if there's an error
      if (result?.success) {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error assigning partner:", error);
    } finally {
      setLoading(false);
    }
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner">Partner <span className="text-red-500">*</span></Label>
            <ReactSelect
              options={partners.map((partner) => ({
                value: partner.id,
                label: `${partner.name} (${partner.email.replace(/_/g, ' ')})`,
              }))}
              value={
                selectedPartnerId
                  ? partners
                      .filter((p) => p.id === selectedPartnerId)
                      .map((partner) => ({
                        value: partner.id,
                        label: `${partner.name} (${partner.email.replace(/_/g, ' ')})`,
                      }))[0]
                  : null
              }
              onChange={(option: OptionType | null) => {
                setSelectedPartnerId(option ? option.value : '');
                if (errors.partner) setErrors(e => ({ ...e, partner: undefined }));
              }}
              isClearable
              placeholder={partnersLoading ? 'Loading...' : 'Select a partner'}
              isDisabled={partnersLoading}
            />
            {errors.partner && <div className="text-red-500 text-xs mt-1">{errors.partner}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compensation">Compensation ($)</Label>
            <Input
              id="compensation"
              type="text"
              value={compensation}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                const parts = value.split('.');
                if (parts.length > 2) return;
                setCompensation(value);
                if (errors.compensation) setErrors(e => ({ ...e, compensation: undefined }));
              }}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, arrows, decimal point
                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'];
                const allowedChars = /[0-9]/;
                
                if (!allowedKeys.includes(e.key) && !allowedChars.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="0.00"
              className={errors.compensation ? "border-red-500" : ""}
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
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) setErrors(e => ({ ...e, notes: undefined }));
              }}
              rows={3}
              placeholder="Additional notes about this partnership..."
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" disabled={loading} onClick={handleSubmit}>
                {loading ? 'Assigning...' : 'Assign Partner'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}