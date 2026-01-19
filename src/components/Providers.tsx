"use client";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { Suspense, useState, useEffect } from "react";
import { AuthInitializer } from "@/components/AuthInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ReduxProvider store={store}>
      <AuthInitializer />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
              {isMounted && children}
            </Suspense>
            {isMounted && <Toaster />}
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
