"use client";

import CampaignDetails from "@/page-components/admin/CampaignDetails";
import AdminRoute from "@/components/AdminRoute";

export default function Page() {
  return (
    <AdminRoute>
      <CampaignDetails />
    </AdminRoute>
  );
}
