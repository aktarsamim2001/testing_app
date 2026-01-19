"use client";

import AdminDashboard from "@/page-components/admin/Dashboard";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}

