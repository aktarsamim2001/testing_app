"use client";

import CreatorDashboard from "@/page-components/creator/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <ProtectedRoute requiredRole="creator">
      <CreatorDashboard />
    </ProtectedRoute>
  );
}

