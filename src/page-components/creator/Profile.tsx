"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    channel_type: "blogger" as "blogger" | "linkedin" | "youtube",
    platform_handle: "",
    follower_count: "",
    engagement_rate: "",
    category: [] as string[],
    notes: "",
  });

  useEffect(() => {
    fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPartnerData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          channel_type: (data.channel_type || "blogger") as "blogger" | "linkedin" | "youtube",
          platform_handle: data.platform_handle || "",
          follower_count: data.follower_count?.toString() || "",
          engagement_rate: data.engagement_rate?.toString() || "",
          category: data.category || [],
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('partners')
        .update({
          name: formData.name,
          email: formData.email,
          channel_type: formData.channel_type,
          platform_handle: formData.platform_handle,
          follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
          engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
          category: formData.category,
          notes: formData.notes,
        })
        .eq('id', partnerData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your creator profile and portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="channel_type">Channel Type *</Label>
                    <Select
                      value={formData.channel_type}
                      onValueChange={(value: any) => setFormData({ ...formData, channel_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blogger">Blogger</SelectItem>
                        <SelectItem value="linkedin">LinkedIn Influencer</SelectItem>
                        <SelectItem value="youtube">YouTuber</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform_handle">Platform Handle</Label>
                    <Input
                      id="platform_handle"
                      value={formData.platform_handle}
                      onChange={(e) => setFormData({ ...formData, platform_handle: e.target.value })}
                      placeholder="@username"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="follower_count">Follower Count</Label>
                      <Input
                        id="follower_count"
                        type="number"
                        min="0"
                        value={formData.follower_count}
                        onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="engagement_rate">Engagement Rate (%)</Label>
                      <Input
                        id="engagement_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.engagement_rate}
                        onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Bio / Portfolio</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      placeholder="Tell brands about your content, audience, and experience..."
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
    </div>
  );
}
