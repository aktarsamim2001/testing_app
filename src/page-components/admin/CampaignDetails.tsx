"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaignById } from "@/store/slices/campaigns";
import {
  assignPartnerToCampaign,
  removePartnerFromCampaign,
} from "@/store/slices/campaignPartners";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import AssignPartnerDialog from "@/components/admin/AssignPartnerDialog";
import { decryptId } from "@/helpers/crypto";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  clients: { company_name: string } | null;
}

export default function CampaignDetails() {
  const params = useParams();
  const encryptedId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  // Decrypt the id param
  const id = encryptedId ? decryptId(encryptedId) : undefined;
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [partnerToRemove, setPartnerToRemove] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await dispatch<any>(fetchCampaignById(id));
      setCampaign(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line
  }, [id]);

  const handleRemovePartner = (partnerId: string) => {
    setPartnerToRemove(partnerId);
    setRemoveDialogOpen(true);
  };

  const confirmRemovePartner = async () => {
    if (!partnerToRemove || !id) return;
    setLoading(true);
    try {
      const result = await dispatch<any>(
        removePartnerFromCampaign({ id: partnerToRemove, campaignId: id })
      );
      if (result?.success) {
        await fetchCampaign();
      }
      // Redux slice handles toast notifications
    } catch (error: any) {
      // Redux slice already handles error toast
      console.error("Error removing partner:", error);
    } finally {
      setLoading(false);
      setRemoveDialogOpen(false);
      setPartnerToRemove(null);
    }
  };

  const handleDialogClose = async () => {
    setDialogOpen(false);
    await fetchCampaign();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!campaign) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="">
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <p className="text-muted-foreground">
            {campaign.clients?.company_name}
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/admin/campaigns")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.budget}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{campaign.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Partners Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.assigned_partners?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Partners</CardTitle>
                <CardDescription>
                  Manage partners working on this campaign
                </CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Partner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : !campaign.assigned_partners ||
              campaign.assigned_partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partners assigned yet. Click "Assign Partner" to add one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SL</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Compensation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.assigned_partners.map((cp: any, idx: number) => (
                    <TableRow key={cp.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        {cp.partner_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cp.partner_channel_type?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{cp.partner_email}</TableCell>
                      <TableCell>{cp.compensation}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cp.status === "active" ? "default" : "secondary"
                          }
                        >
                          {cp.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePartner(cp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {/* Remove Partner Alert Dialog */}
                        <AlertDialog
                          open={removeDialogOpen}
                          onOpenChange={setRemoveDialogOpen}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Partner
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this partner
                                from the campaign?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => setRemoveDialogOpen(false)}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  onClick={confirmRemovePartner}
                                  disabled={loading}
                                >
                                  {loading ? "Removing..." : "Remove"}
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AssignPartnerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          campaignId={id || ""}
        />
      </div>
    </AdminLayout>
  );
}
