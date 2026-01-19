"use client";

import Campaigns from "@/page-components/admin/Campaigns";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Campaigns />
    </AdminRoute>
  );
}

