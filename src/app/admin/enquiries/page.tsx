"use client";

import EnquiriesPage from "@/page-components/admin/Enquiry";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <EnquiriesPage />
    </AdminRoute>
  );
}
