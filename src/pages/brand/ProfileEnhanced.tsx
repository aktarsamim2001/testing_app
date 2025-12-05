"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Building2, Globe, Users, Mail, Phone, FileText, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BrandSidebar } from "@/components/brand/BrandSidebar";

export default function BrandProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientData, setClientData] = useState<any>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    notes: "",
  });

  useEffect(() => {
    fetchClientData();
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setClientData(data);
        setFormData({
          company_name: data.company_name || "",
          contact_name: data.contact_name || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          website: data.website || "",
          notes: data.notes || "",
        });
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', clientData.id);

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
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <BrandSidebar />
          <div className="flex-1">
            <header className="h-16 border-b flex items-center px-6">
              <SidebarTrigger />
            </header>
            <div className="p-6">
              <Skeleton className="h-8 w-64 mb-8" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BrandSidebar />
        
        <div className="flex-1">
          <header className="h-16 border-b flex items-center px-6">
            <SidebarTrigger />
            <h2 className="ml-4 text-xl font-semibold">Company Profile</h2>
          </header>

          <main className="p-6 max-w-4xl">
            <Tabs defaultValue="company" className="space-y-6">
              <TabsList>
                <TabsTrigger value="company">
                  <Building2 className="w-4 h-4 mr-2" />
                  Company Info
                </TabsTrigger>
                <TabsTrigger value="account">
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Manage your company details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_name" className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Company Name *
                          </Label>
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            required
                            placeholder="Your Company Ltd."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact_name" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Contact Name *
                          </Label>
                          <Input
                            id="contact_name"
                            value={formData.contact_name}
                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            required
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact_email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Contact Email *
                          </Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            required
                            placeholder="john@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact_phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Phone
                          </Label>
                          <Input
                            id="contact_phone"
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="website" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Website
                          </Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="notes" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            About Your Company
                          </Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={5}
                            placeholder="Tell us about your company, your target audience, and what you're looking for in creator partnerships..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={saving} className="flex-1">
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push('/brand')}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Company Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Statistics</CardTitle>
                    <CardDescription>
                      Overview of your activity on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {clientData?.status === 'active' ? 'Active' : 'Prospect'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Account Status</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">
                          {new Date(clientData?.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Member Since</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-xs text-muted-foreground mt-1">Total Campaigns</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-xs text-muted-foreground mt-1">Active Partners</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Address</h4>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">••••••••</p>
                        </div>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive updates about campaigns</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h4 className="font-medium mb-4 text-destructive">Danger Zone</h4>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        This action cannot be undone. All your data will be permanently deleted.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
