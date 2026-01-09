"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  X,
  Plus,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  createServiceThunk,
  updateServiceThunk,
  fetchServices,
  selectServicesLoading,
  selectServices,
} from "@/store/slices/services";
import type { ServicePayload, ServiceUpdateRequest } from "@/store/slices/services";
import CategoriesInput from "@/components/ui/CategoriesInput";

interface Props {
  pageId?: string;
}

export default function ServiceBuilder({ pageId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectServicesLoading);
  const allServices = useAppSelector((state) =>
    typeof selectServices === "function" ? selectServices(state) : []
  );

  const isEditMode = !!pageId;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) dispatch(fetchServices(1, 100) as any);
  }, [isEditMode, dispatch]);

  const editingService =
    isEditMode && pageId
      ? allServices.find((s: any) => String(s.id) === String(pageId))
      : null;

  const [form, setForm] = useState({
    flag: "Service",
    name: "",
    image: "",
    short_description: "",
    description: "",
    price: "",
    discount_price: "",
    service_ids: "",
    status: "1",
  });

  const [whatIncluded, setWhatIncluded] = useState<string[]>([]);
  const [keyBenefits, setKeyBenefits] = useState<string[]>([]);
  const [additionalBenefits, setAdditionalBenefits] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && editingService) {
      // Service data directly from API (not wrapped in content array)
      const data = editingService;
      
      setForm({
        flag: data.flag || "Service",
        name: data.name || "",
        image: data.image || "",
        short_description: data.short_description || "",
        description: data.description || "",
        price: String(data.price || ""),
        discount_price: data.discount_price || "",
        service_ids: data.service_ids || "",
        status: String(data.status ?? 1),
      });
      setWhatIncluded(
        Array.isArray(data.what_included)
          ? data.what_included.map((i: any) => i.title || i)
          : []
      );
      setKeyBenefits(
        Array.isArray(data.key_benefits)
          ? data.key_benefits.map((i: any) => i.title || i)
          : []
      );
      setAdditionalBenefits(
        Array.isArray(data.additional_benefits)
          ? data.additional_benefits.map((i: any) => i.title || i)
          : []
      );
      
      // Parse service_ids string into selectedServiceIds array
      if (data.service_ids) {
        const ids = data.service_ids.split(",").map((id: string) => id.trim());
        setSelectedServiceIds(ids);
      }
    }
  }, [isEditMode, editingService]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    value: string
  ) => {
    setter((s) => s.map((v, i) => (i === idx ? value : v)));
    setHasUnsavedChanges(true);
  };

  const addArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((s) => [...s, ""]);
    setHasUnsavedChanges(true);
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number
  ) => {
    setter((s) => s.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isService = form.flag === "Service";
    const isFullService = form.flag === "Full_Service";

    if (!form.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (form.price && isNaN(Number(form.price))) {
      newErrors.price = "Price must be a valid number";
    }

    if (isFullService) {
      if (form.discount_price && isNaN(Number(form.discount_price))) {
        newErrors.discount_price = "Discount price must be a valid number";
      }

      if (
        form.discount_price &&
        form.price &&
        Number(form.discount_price) >= Number(form.price)
      ) {
        newErrors.discount_price =
          "Discount price must be less than regular price";
      }
    }

    if (isService && !form.image.trim()) {
      newErrors.image = "Image is required for Service type";
    }

    if (isService && !form.description.trim()) {
      newErrors.description = "Description is required for Service type";
    }

    if (isFullService && selectedServiceIds.length === 0) {
      newErrors.service_ids =
        "Service IDs are required for Full Service Package";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): ServicePayload => {
    const isService = form.flag === "Service";

    const payload: ServicePayload = {
      flag: form.flag as "Service" | "Full_Service",
      name: form.name,
      short_description: form.short_description,
      price: form.price,
      status: Number(form.status),
    };

    if (isService) {
      payload.image = form.image;
      payload.description = form.description;
      payload.what_included = whatIncluded
        .filter((t) => t.trim())
        .map((t) => ({ title: t }));
      payload.key_benefits = keyBenefits
        .filter((t) => t.trim())
        .map((t) => ({ title: t }));
    } else {
      payload.discount_price = form.discount_price;
      payload.service_ids = selectedServiceIds.join(",");
      payload.additional_benefits = additionalBenefits
        .filter((t) => t.trim())
        .map((t) => ({ title: t }));
    }

    console.log('Service payload:', payload);
    console.log('Image size (chars):', form.image?.length || 0);
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = buildPayload();
    try {
      let resultAction;
      if (isEditMode && pageId) {
        const updatePayload: ServiceUpdateRequest = {
          id: pageId,
          data: payload,
        };
        resultAction = await dispatch(updateServiceThunk(updatePayload));
      } else {
        resultAction = await dispatch(createServiceThunk(payload));
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: isEditMode
          ? "Service updated successfully"
          : "Service created successfully",
        variant: "success",
      });

      router.push("/admin/services");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    router.push("/admin/services");
  };

  const isService = form.flag === "Service";
  const isFullService = form.flag === "Full_Service";

  return (
    <AdminLayout>
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Service" : "Create New Service"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update your service details below"
                : "Add a new service to your offerings"}
            </p>
          </div>
          <Button variant={"ghost"} onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="flag">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.flag}
                    onValueChange={(value) => handleFormChange("flag", value)}
                  >
                    <SelectTrigger id="flag" aria-invalid={!!errors.flag}>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Full_Service">Full Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Service Name"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* <div className="md:col-span-2 space-y-2">
                 <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => handleFormChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div> */}

                <div className="md:col-span-2 space-y-2">
                  <Label>Short Description</Label>
                  <Input
                    value={form.short_description}
                    onChange={(e) =>
                      handleFormChange("short_description", e.target.value)
                    }
                    placeholder="Short Description"
                  />
                </div>

                {/* Description - Only for Service */}
                {isService && (
                  <div className="md:col-span-2 space-y-2">
                    <Label>
                      Full Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      placeholder="Detailed description of the service"
                      rows={5}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full">
              {/* Left column: Price */}
              <CardContent>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    placeholder="Price"
                    type="number"
                    step="0.01"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>
              </CardContent>

              {/* Right column: Upload Image (for Service) OR Services (for Full_Service) */}
              {isService ? (
                <CardContent>
                  <div className="space-y-2">
                    <Label>
                      Upload Image <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFormChange("image", file.name);
                        }
                      }}
                    />
                    {errors.image && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        {errors.image}
                      </p>
                    )}
                  </div>
                </CardContent>
              ) : isFullService ? (
                <CardContent>
                  <div className="space-y-2 mt-2.5">
                    <Label className="flex items-center gap-2">
                      Services <span className="text-red-500">*</span>
                    </Label>
                    <CategoriesInput
                      value={selectedServiceIds}
                      onChange={setSelectedServiceIds}
                      availableCategories={allServices
                        .filter((s: any) => s.flag === "Service")
                        .map((s: any) => ({
                          id: String(s.id),
                          name: s.name,
                        }))}
                      placeholder="Search and add services..."
                    />
                    {errors.service_ids && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        {errors.service_ids}
                      </p>
                    )}
                  </div>
                </CardContent>
              ) : (
                <div />
              )}
            </div>

            {/* What's Included Card - Only for Service */}
            {isService && (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between w-full gap-4">
                    <div>
                      <CardTitle>What's Included</CardTitle>
                      <CardDescription>
                        List all features and deliverables
                      </CardDescription>
                    </div>
                    {whatIncluded.length > 0 && (
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          onClick={() => addArrayItem(setWhatIncluded)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {whatIncluded.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="mb-2">No items added yet</p>
                        <Button
                          type="button"
                          onClick={() => addArrayItem(setWhatIncluded)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ) : (
                      whatIncluded.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <Input
                            value={item}
                            onChange={(e) =>
                              handleArrayChange(
                                setWhatIncluded,
                                idx,
                                e.target.value
                              )
                            }
                            placeholder={`Targeted blogger identification & vetting`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeArrayItem(setWhatIncluded, idx)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Key Benefits Card - Only for Service */}
            {isService && (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between w-full gap-4">
                    <div>
                      <CardTitle>Key Benefits</CardTitle>
                      <CardDescription>
                        Highlight the main advantages
                      </CardDescription>
                    </div>
                    {keyBenefits.length > 0 && (
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          onClick={() => addArrayItem(setKeyBenefits)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Benefit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keyBenefits.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="mb-2">No benefits added yet</p>
                        <Button
                          type="button"
                          onClick={() => addArrayItem(setKeyBenefits)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ) : (
                      keyBenefits.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <Input
                            value={item}
                            onChange={(e) =>
                              handleArrayChange(
                                setKeyBenefits,
                                idx,
                                e.target.value
                              )
                            }
                            placeholder={`Boost domain authority`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem(setKeyBenefits, idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Additional Benefits Card - Only for Full_Service */}
            {isFullService && (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between w-full gap-4">
                    <div>
                      <CardTitle>Additional Benefits</CardTitle>
                      <CardDescription>
                        Extra perks for full service package
                      </CardDescription>
                    </div>
                    {additionalBenefits.length > 0 && (
                      <Button
                        type="button"
                        onClick={() => addArrayItem(setAdditionalBenefits)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Benefit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {additionalBenefits.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="mb-2">No additional benefits added yet</p>
                        <Button
                          type="button"
                          onClick={() => addArrayItem(setAdditionalBenefits)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ) : (
                      additionalBenefits.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <Input
                            value={item}
                            onChange={(e) =>
                              handleArrayChange(
                                setAdditionalBenefits,
                                idx,
                                e.target.value
                              )
                            }
                            placeholder={`Unified reporting dashboard`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeArrayItem(setAdditionalBenefits, idx)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Form Actions */}
            <>
              <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                  <div className="col-span-1 md:col-span-2 space-y-2 w-full md:w-52">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        handleFormChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.name && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[120px]"
                    >
                      {loading
                        ? isEditMode
                          ? "Saving..."
                          : "Creating..."
                        : isEditMode
                        ? "Save Changes"
                        : "Create Service"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
