"use client";

import { BrandDashboardClient } from "@/components/brand/BrandDashboardClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <ProtectedRoute requiredRole="brand">
      <BrandDashboardClient />
    </ProtectedRoute>
  );
}

