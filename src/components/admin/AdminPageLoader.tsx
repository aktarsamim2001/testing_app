"use client";

import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPageLoader() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
