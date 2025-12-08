"use client";

import Settings from "@/page-components/admin/Settings";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Settings />
    </AdminRoute>
  );
}

