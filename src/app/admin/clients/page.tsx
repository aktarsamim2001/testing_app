"use client";

import Clients from "@/page-components/admin/Clients";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Clients />
    </AdminRoute>
  );
}

