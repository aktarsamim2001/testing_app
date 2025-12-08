"use client";

import Authors from "@/page-components/admin/Authors";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Authors />
    </AdminRoute>
  );
}
