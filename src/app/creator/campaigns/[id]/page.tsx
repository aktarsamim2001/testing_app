"use client";

import { Suspense } from "react";
import { CreatorCampaignDetail } from "@/page-components/creator/CampaignDetail";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <CreatorCampaignDetail />
    </Suspense>
  );
}
