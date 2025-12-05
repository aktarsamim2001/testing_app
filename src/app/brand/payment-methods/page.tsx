"use client";

import { lazy, Suspense } from "react";

const PaymentMethods = lazy(() => import("@/pages/brand/PaymentMethods"));

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <PaymentMethods />
    </Suspense>
  );
}
