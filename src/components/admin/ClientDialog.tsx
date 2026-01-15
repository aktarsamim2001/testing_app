import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AppDispatch, RootState } from '@/store';
import { createClientThunk, updateClientThunk, fetchClientDetailsThunk, selectSelectedClient, selectSelectedClientLoading, fetchClients } from '@/store/slices/clients';
import { useDispatch, useSelector } from 'react-redux';

interface Client {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  status: number;
  notes: string | null;
}

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (result: boolean | { error?: string; success?: string }) => void;
  client?: Client | null;
}

export default function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const selectedClient = useSelector((state: RootState) => selectSelectedClient(state));
  const selectedClientLoading = useSelector((state: RootState) => selectSelectedClientLoading(state));
  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    status: 2,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    company_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    notes?: string;
  }>({});

  useEffect(() => {
    setErrors({});
    
    // If dialog is open and in edit mode (client has id), fetch full details
    if (open && client?.id) {
      dispatch(fetchClientDetailsThunk(client.id));
    } else if (open) {
      // Create mode - reset form
      setFormData({
        company_name: '',
        name: '',
        email: '',
        phone: '',
        website: '',
        status: 2,
        notes: '',
      });
    }
  }, [client?.id, open, dispatch]);

  // Populate form from selectedClient when details are fetched
  useEffect(() => {
    if (selectedClient && client?.id) {
      setFormData({
        company_name: selectedClient.company_name || '',
        name: selectedClient.name || '',
        email: selectedClient.email || '',
        phone: selectedClient.phone || '',
        website: selectedClient.website || '',
        status: selectedClient.status ?? 2,
        notes: selectedClient.notes || '',
      });
    }
  }, [selectedClient, client?.id]);

  const validatePhoneNumber = (phone: string, countryData: any): { valid: boolean; error?: string } => {
    if (!phone || !phone.trim()) {
      return { valid: true }; // Optional field
    }

    // Remove country code and get only digits
    const phoneWithoutCode = phone.substring(countryData.dialCode.length);
    const digitsOnly = phoneWithoutCode.replace(/\D/g, '');

    // Country-specific validation rules
    const validationRules: { [key: string]: { min: number; max: number; name: string } } = {
      'us': { min: 10, max: 10, name: 'US' },
      'ca': { min: 10, max: 10, name: 'Canada' },
      'gb': { min: 10, max: 10, name: 'UK' },
      'in': { min: 10, max: 10, name: 'India' },
      'cn': { min: 11, max: 11, name: 'China' },
      'jp': { min: 10, max: 10, name: 'Japan' },
      'de': { min: 10, max: 11, name: 'Germany' },
      'fr': { min: 9, max: 9, name: 'France' },
      'au': { min: 9, max: 9, name: 'Australia' },
      'br': { min: 10, max: 11, name: 'Brazil' },
      'ru': { min: 10, max: 10, name: 'Russia' },
      'ae': { min: 9, max: 9, name: 'UAE' },
      'sa': { min: 9, max: 9, name: 'Saudi Arabia' },
      'pk': { min: 10, max: 10, name: 'Pakistan' },
      'bd': { min: 10, max: 10, name: 'Bangladesh' },
      'sg': { min: 8, max: 8, name: 'Singapore' },
      'my': { min: 9, max: 10, name: 'Malaysia' },
      'lk': { min: 9, max: 9, name: 'Sri Lanka' },
      'np': { min: 10, max: 10, name: 'Nepal' },
    };

    const rule = validationRules[countryData.countryCode];
    if (!rule) {
      // Generic validation for unsupported countries
      if (digitsOnly.length < 8) {
        return { valid: false, error: 'Phone number is too short' };
      }
      if (digitsOnly.length > 15) {
        return { valid: false, error: 'Phone number is too long' };
      }
      return { valid: true };
    }

    if (digitsOnly.length < rule.min) {
      return { 
        valid: false, 
        error: `${rule.name} requires at least ${rule.min} digits` 
      };
    }

    if (digitsOnly.length > rule.max) {
      return { 
        valid: false, 
        error: `${rule.name} allows maximum ${rule.max} digits` 
      };
    }

    // India-specific validation: must start with 6, 7, 8, or 9
    if (countryData.countryCode === 'in' && digitsOnly.length > 0) {
      const firstDigit = digitsOnly.charAt(0);
      if (!['6', '7', '8', '9'].includes(firstDigit)) {
        return { 
          valid: false, 
          error: 'Indian mobile numbers must start with 6, 7, 8, or 9' 
        };
      }
    }

    return { valid: true };
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required.';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    
    // Phone validation will be handled by isValid prop in PhoneInput
    // But we can add additional checks here if needed
    
    if (formData.website && formData.website.trim()) {
      if (!/^https?:\/\/.+\..+/.test(formData.website.trim())) {
        newErrors.website = 'Enter a valid URL (must start with http:// or https://).';
      }
    }
    
    if (formData.notes && !formData.notes.trim()) {
      newErrors.notes = 'Notes cannot be only spaces.';
    }

    // Phone validation: ensure invalid phone prevents form submission
    if (formData.phone && formData.phone.trim()) {
      const raw = formData.phone;
      const digitsOnly = raw.replace(/\D/g, '');

      // India-specific detection: handles values starting with +91 or 91
      if (/^(\+?91)/.test(raw)) {
        // remove leading country code if present
        const after = digitsOnly.replace(/^91/, '');
        if (after.length < 10) {
          newErrors.phone = 'India requires at least 10 digits';
        } else if (after.length > 10) {
          newErrors.phone = 'India allows maximum 10 digits';
        } else if (!['6', '7', '8', '9'].includes(after.charAt(0))) {
          newErrors.phone = 'Indian mobile numbers must start with 6, 7, 8, or 9';
        }
      } else {
        // Generic fallback validation for other countries
        if (digitsOnly.length < 8) {
          newErrors.phone = 'Phone number is too short';
        } else if (digitsOnly.length > 15) {
          newErrors.phone = 'Phone number is too long';
        }
      }
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
      let result;
      // Prepare phone number - PhoneInput already includes +, so don't add it again
      const phoneValue = formData.phone ? (formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`) : null;
      
      if (client?.id) {
        result = await dispatch(updateClientThunk({
          id: client.id,
          ...formData,
          phone: phoneValue,
        }));
        
        // Close dialog and refresh list after successful update
        if (result?.success) {
          onOpenChange(false);
        }
      } else {
        result = await dispatch(createClientThunk({
          ...formData,
          phone: phoneValue,
        }));
        
        // Close dialog and refresh list after successful create
        if (result?.success) {
          onOpenChange(false);
        }
      }
      // If there's an error, the Redux thunk will show a toast and dialog stays open
    } catch (error: any) {
      console.error('Error submitting client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {client ? (selectedClientLoading ? 'Loading client details...' : 'Update client information') : 'Add a new SAAS company client'}
          </DialogDescription>
        </DialogHeader>
        <style>{`
          .phone-input-container .react-tel-input {
            font-family: inherit;
          }
          
          .phone-input-container .react-tel-input .form-control {
            width: 100%;
            height: 40px;
            border-radius: 0.375rem;
            border: 1px solid hsl(var(--input));
            background-color: transparent;
            padding: 0.5rem 0.75rem 0.5rem 48px;
            font-size: 0.875rem;
            line-height: 1.25rem;
            transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .phone-input-container .react-tel-input .form-control:focus {
            outline: none;
            border-color: hsl(var(--ring));
          }
          
          .phone-input-container .react-tel-input .flag-dropdown {
            border: none;
            background-color: transparent;
            border-right: 1px solid hsl(var(--input));
          }
          
          .phone-input-container .react-tel-input .flag-dropdown:hover,
          .phone-input-container .react-tel-input .flag-dropdown.open {
            background-color: transparent;
          }
          
          .phone-input-container .react-tel-input .selected-flag {
            padding: 0 0 0 8px;
            width: 40px;
          }
          
          .phone-input-container .react-tel-input .selected-flag:hover,
          .phone-input-container .react-tel-input .selected-flag:focus {
            background-color: transparent;
          }

          .phone-input-container .react-tel-input .country-list {
            width: 300px;
            max-height: 200px;
            border: 1px solid hsl(var(--border));
            border-radius: 0.375rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          }

          .phone-input-container .react-tel-input .country-list .country.highlight {
            background-color: hsl(var(--accent));
          }
        `}</style>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name <span className="text-red-500">*</span></Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => {
                  setFormData({ ...formData, company_name: e.target.value });
                  if (errors.company_name) setErrors(prev => ({ ...prev, company_name: undefined }));
                }}
                aria-invalid={!!errors.company_name}
              />
              {errors.company_name && (
                <div className="text-red-500 text-xs mt-1">{errors.company_name}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <div className="text-red-500 text-xs mt-1">{errors.name}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <div className={`phone-input-container ${errors.phone ? 'error' : ''}`}>
                <PhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={(phone, countryData: any) => {
                    setFormData({ ...formData, phone });
                    
                    // Clear error when typing
                    if (errors.phone) {
                      setErrors(prev => ({ ...prev, phone: undefined }));
                    }
                    
                    // Validate on change
                    if (phone) {
                      const validation = validatePhoneNumber(phone, countryData);
                      if (!validation.valid) {
                        setErrors(prev => ({ ...prev, phone: validation.error }));
                      }
                    }
                  }}
                  isValid={(inputNumber, country: any, countries) => {
                    if (!inputNumber) return true;
                    
                    const validation = validatePhoneNumber(inputNumber, country);
                    return validation.valid;
                  }}
                  countryCodeEditable={false}
                  enableSearch={true}
                  disableSearchIcon={false}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <div className="text-red-500 text-xs mt-1">{errors.phone}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status.toString()} 
                onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Prospect</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="text"
                value={formData.website}
                onChange={(e) => {
                  setFormData({ ...formData, website: e.target.value });
                  if (errors.website) setErrors(prev => ({ ...prev, website: undefined }));
                }}
                placeholder="https://example.com"
                aria-invalid={!!errors.website}
              />
              {errors.website && (
                <div className="text-red-500 text-xs mt-1">{errors.website}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) setErrors(prev => ({ ...prev, notes: undefined }));
              }}
              rows={3}
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <div className="text-red-500 text-xs mt-1">{errors.notes}</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Saving...' : client ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}