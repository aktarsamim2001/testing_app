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
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  createSubscriptionThunk,
  updateSubscriptionThunk,
  selectSubscriptionsLoading,
} from "@/store/slices/subscriptions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  subscriptionId?: string;
  editData?: any;
}

export default function SubscriptionBuilder({ subscriptionId, editData }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSubscriptionsLoading);

  const isEditMode = !!subscriptionId || !!editData;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    flag: "Normal",
    name: "",
    partnerships: "",
    price: "",
    description: "",
    popular: "0",
    status: "1",
  });

  const [features, setFeatures] = useState<string[]>([]);

useEffect(() => {
  if (isEditMode && editData) {
    setForm({
      flag: editData.flag || "Normal",
      name: editData.name || "",
      partnerships: editData.partnerships || "",
      price: editData.price || "",
      description: editData.description || "",
      popular: String(editData.popular ?? "0"),
      status: String(editData.status ?? 1),
    });
    
    // Fix: Extract the title from feature objects
    setFeatures(
      Array.isArray(editData.features)
        ? editData.features.map((feature: any) => 
            typeof feature === 'string' ? feature : feature.title || ''
          )
        : []
    );
  }
}, [isEditMode, editData]);

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

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayChange = (idx: number, value: string) => {
    setFeatures((s) => s.map((v, i) => (i === idx ? value : v)));
    setHasUnsavedChanges(true);
  };

  const addFeature = () => {
    setFeatures((s) => [...s, ""]);
    setHasUnsavedChanges(true);
  };

  const removeFeature = (idx: number) => {
    setFeatures((s) => s.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.flag) {
      newErrors.flag = "Subscription type is required";
    }

    if (!form.name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    if (!form.price || isNaN(Number(form.price))) {
      newErrors.price = "Price must be a valid number";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      flag: form.flag as "Normal" | "AddOn",
      name: form.name,
      price: Number(form.price),
      partnerships: form.partnerships,
      description: form.description,
      features: features.filter((f) => f.trim()).map((f) => ({ title: f })),
      popular: Number(form.popular),
      status: Number(form.status),
    };
    console.log('Subscription payload:', payload);
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = buildPayload();
    try {
      if (isEditMode && editData?.id) {
        await dispatch(updateSubscriptionThunk({ id: editData.id, data: payload }) as any);
        toast({
          title: "Success",
          description: "Subscription updated successfully",
          variant: "success",
        });
      } else {
        await dispatch(createSubscriptionThunk(payload) as any);
        toast({
          title: "Success",
          description: "Subscription created successfully",
          variant: "success",
        });
      }

      setHasUnsavedChanges(false);
      router.push("/admin/subscriptions");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save subscription",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/admin/subscriptions");
  };

  const isNormal = form.flag === "Normal";
  const isAddOn = form.flag === "AddOn";

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Subscription" : "Create New Subscription"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update subscription plan details"
                : "Create a new subscription plan"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details of the subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flag">Subscription Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={form.flag}
                      onValueChange={(value) =>
                        handleFormChange("flag", value)
                      }
                    >
                      <SelectTrigger id="flag" className={errors.flag ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="AddOn">Add-On</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.flag && (
                      <p className="text-sm text-red-500">{errors.flag}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Subscription Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Subscription Name "
                      value={form.name}
                      onChange={(e) =>
                        handleFormChange("name", e.target.value)
                      }
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className={`grid ${isNormal ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="price"
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        handleFormChange("price", e.target.value)
                      }
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  {/* Partnerships - Only for Normal */}
                  {isNormal && (
                    <div className="space-y-2">
                      <Label htmlFor="partnerships">Partnerships</Label>
                      <Input
                        id="partnerships"
                        placeholder="Partnerships"
                        value={form.partnerships}
                        onChange={(e) =>
                          handleFormChange("partnerships", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a detailed description of this subscription plan..."
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Features - Only for Normal */}
                {isNormal && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between w-full gap-4">
                        <div>
                          <CardTitle>Features</CardTitle>
                          <CardDescription>
                            List all features included in this subscription plan
                          </CardDescription>
                        </div>
                        {features.length > 0 && (
                          <div className="flex-shrink-0">
                            <Button
                              type="button"
                              onClick={addFeature}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Feature
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* {errors.features && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errors.features}</AlertDescription>
                        </Alert>
                      )} */}

                      <div className="space-y-3">
                        {features.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="mb-2">No features added yet</p>
                            <Button
                              type="button"
                              onClick={addFeature}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Feature
                            </Button>
                          </div>
                        ) : (
                          features.map((feature, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <Input
                                value={feature}
                                onChange={(e) =>
                                  handleArrayChange(idx, e.target.value)
                                }
                                placeholder={`Basic performance reporting`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFeature(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className={`grid ${isNormal ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4`}>
                  {/* Popular - Only for Normal */}
                  {isNormal && (
                    <div className="space-y-2">
                      <Label htmlFor="popular">Mark as Popular</Label>
                      <Select
                        value={form.popular}
                        onValueChange={(value) =>
                          handleFormChange("popular", value)
                        }
                      >
                        <SelectTrigger id="popular">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        handleFormChange("status", value)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
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
                className="bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Subscription"
                  : "Create Subscription"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
