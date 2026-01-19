"use client";

import Analytics from "@/page-components/admin/Analytics";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Analytics />
    </AdminRoute>
  );
}

