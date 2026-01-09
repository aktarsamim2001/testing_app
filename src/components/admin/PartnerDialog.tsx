import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoriesInput from "@/components/ui/CategoriesInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppDispatch, RootState } from "@/store";
import { fetchCategories, createCategoryThunk } from "@/store/slices/categorySlice";
import {
  createPartnerThunk,
  updatePartnerThunk,
} from "@/store/slices/partners";

// Use the Partner type from the store to ensure consistency
import type { Partner } from "@/store/slices/partners";

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: Partner | null;
}

export default function PartnerDialog({
  open,
  onOpenChange,
  partner,
}: PartnerDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categoryList = useSelector((state: RootState) => state.categories.data);
  
  // Fetch categories on mount
  useEffect(() => {
    if (categoryList.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryList.length]);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    channel_type: string;
    platform_handle: string;
    follower_count: string;
    engagement_rate: string;
    categories: string[];
    notes: string;
    status: number;
  }>({
    name: "",
    email: "",
    channel_type: "blogger",
    platform_handle: "",
    follower_count: "",
    engagement_rate: "",
    categories: [],
    notes: "",
    status: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    channel_type?: string;
    platform_handle?: string;
    follower_count?: string;
    engagement_rate?: string;
    categories?: string;
    notes?: string;
  }>({});

  useEffect(() => {
    // Always clear errors when dialog opens or partner changes
    setErrors({});
    if (partner) {
      // Convert category IDs to names
      let categoryNames: string[] = [];
      if (partner.categories) {
        if (Array.isArray(partner.categories)) {
          // Categories is an array of objects
          categoryNames = partner.categories.map((c: any) =>
            typeof c === "string" ? c : c && c.name ? c.name : String(c.id ?? "")
          );
        } else if (typeof partner.categories === "string" && partner.categories) {
          // Categories is a comma-separated string of IDs
          const categoryIds = partner.categories.split(/,\s*/).filter(Boolean);
          categoryNames = categoryIds.map((id) => {
            const category = categoryList.find((c) => c.id === id);
            return category ? category.name : id;
          });
        }
      }

      setFormData({
        name: partner.name || "",
        email: partner.email || "",
        channel_type: partner.channel_type || "blogger",
        platform_handle: partner.platform_handle || "",
        follower_count: partner.follower_count?.toString() || "",
        engagement_rate: partner.engagement_rate?.toString() || "",
        categories: categoryNames,
        notes: partner.notes || "",
        status: partner.status ?? 0,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        channel_type: "blogger",
        platform_handle: "",
        follower_count: "",
        engagement_rate: "",
        categories: [],
        notes: "",
        status: 0,
      });
    }
  }, [partner, open]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.channel_type) {
      newErrors.channel_type = "Channel type is required.";
    }
    // Platform handle: allow empty, but if not empty, must not be only spaces
    if (formData.platform_handle && !formData.platform_handle.trim()) {
      newErrors.platform_handle = "Platform handle cannot be only spaces.";
    }
    // Follower count: allow empty, but if not empty, must be a positive integer
    if (formData.follower_count && !formData.follower_count.trim()) {
      newErrors.follower_count = "Follower count cannot be only spaces.";
    } else if (formData.follower_count) {
      const count = parseInt(formData.follower_count);
      if (isNaN(count) || count < 0) {
        newErrors.follower_count = "Follower count must be a positive number.";
      }
    }
    // Engagement rate: allow empty, but if not empty, must be a positive float
    if (formData.engagement_rate && !formData.engagement_rate.trim()) {
      newErrors.engagement_rate = "Engagement rate cannot be only spaces.";
    } else if (formData.engagement_rate) {
      const rate = parseFloat(formData.engagement_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.engagement_rate =
          "Engagement rate must be between 0 and 100.";
      }
    }
    // Categories: allow empty, but if not empty, must not be only spaces
    if (formData.categories && Array.isArray(formData.categories)) {
      if (formData.categories.some((cat) => !cat.trim())) {
        newErrors.categories = "Categories cannot be only spaces.";
      }
    }
    // Notes: allow empty, but if not empty, must not be only spaces
    if (formData.notes && !formData.notes.trim()) {
      newErrors.notes = "Notes cannot be only spaces.";
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
      // Separate new categories from existing ones
      let categoryIds: string | null = null;
      if (formData.categories && formData.categories.length > 0) {
        const existingCategoryIds: string[] = [];
        const newCategoryNames: string[] = [];

        for (const catName of formData.categories) {
          const found = categoryList.find((c) => c.name === catName);
          if (found) {
            existingCategoryIds.push(found.id);
          } else {
            newCategoryNames.push(catName);
          }
        }

        // Create new categories first
        for (const categoryName of newCategoryNames) {
          const result = await dispatch(
            createCategoryThunk({ name: categoryName, status: 1 })
          );
          // Refresh categories to get the new IDs
          await dispatch(fetchCategories(1, 100));
        }

        // After creating new categories, fetch the updated list and get all IDs
        const updatedCategoryList = await new Promise((resolve) => {
          setTimeout(() => {
            const state = (dispatch as any).getState?.() as RootState | undefined;
            resolve(state?.categories?.data ?? []);
          }, 100);
        }) as typeof categoryList;

        const allIds = formData.categories
          .map((catName) => {
            const found =
              updatedCategoryList.length > 0
                ? updatedCategoryList.find((c) => c.name === catName)
                : categoryList.find((c) => c.name === catName);
            return found ? found.id : null;
          })
          .filter(Boolean);
        categoryIds = allIds.length > 0 ? allIds.join(",") : null;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        channel_type: formData.channel_type,
        platform_handle: formData.platform_handle || null,
        follower_count: formData.follower_count
          ? parseInt(formData.follower_count)
          : null,
        engagement_rate: formData.engagement_rate
          ? parseFloat(formData.engagement_rate)
          : null,
        categories: categoryIds,
        notes: formData.notes || null,
        status: formData.status,
      };

      let result;
      if (partner) {
        result = await dispatch(
          updatePartnerThunk({
            id: partner.id,
            ...payload,
          })
        );
      } else {
        result = await dispatch(createPartnerThunk(payload));
      }
      
      // Only close dialog on success, keep it open on error
      if (result?.success) {
        onOpenChange(false);
      }
      // If there's an error, the Redux thunk will show a toast and dialog stays open
    } catch (error) {
      console.error("Error submitting partner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {partner ? "Edit Partner" : "Add New Partner"}
          </DialogTitle>
          <DialogDescription>
            {partner
              ? "Update partner information"
              : "Add a new influencer or content creator"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                aria-invalid={!!errors.name}
                // required removed for custom validation only
              />
              {errors.name && (
                <div className="text-red-500 text-xs mt-1">{errors.name}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
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
              <Label htmlFor="channel_type">
                Channel Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.channel_type}
                onValueChange={(value) => {
                  setFormData({ ...formData, channel_type: value });
                  if (errors.channel_type)
                    setErrors({ ...errors, channel_type: undefined });
                }}
              >
                <SelectTrigger aria-invalid={!!errors.channel_type}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blogger">Blogger</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              {errors.channel_type && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.channel_type}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform_handle">Platform Handle</Label>
              <Input
                id="platform_handle"
                placeholder="@username"
                value={formData.platform_handle}
                onChange={(e) => {
                  setFormData({ ...formData, platform_handle: e.target.value });
                  if (errors.platform_handle)
                    setErrors({ ...errors, platform_handle: undefined });
                }}
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
                onChange={(e) => {
                  setFormData({ ...formData, follower_count: e.target.value });
                  if (errors.follower_count)
                    setErrors({ ...errors, follower_count: undefined });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
              <Input
                id="engagement_rate"
                type="number"
                step="0.01"
                value={formData.engagement_rate}
                onChange={(e) => {
                  setFormData({ ...formData, engagement_rate: e.target.value });
                  if (errors.engagement_rate)
                    setErrors({ ...errors, engagement_rate: undefined });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <CategoriesInput
              value={formData.categories}
              onChange={(tags) => {
                setFormData({ ...formData, categories: tags });
                if (errors.categories) setErrors({ ...errors, categories: undefined });
              }}
              availableCategories={categoryList}
              placeholder="Search and add categories..."
            />
            {errors.categories && (
              <div className="text-red-500 text-xs mt-1">{errors.categories}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) setErrors({ ...errors, notes: undefined });
              }}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : partner ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
