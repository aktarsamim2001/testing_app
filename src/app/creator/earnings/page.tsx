"use client";

import { lazy, Suspense } from "react";

const CreatorEarnings = lazy(() => import("@/page-components/creator/Earnings"));

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <CreatorEarnings />
    </Suspense>
  );
}

