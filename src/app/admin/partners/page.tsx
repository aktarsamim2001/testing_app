"use client";

import Partners from "@/page-components/admin/Partners";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <Partners />
    </AdminRoute>
  );
}

