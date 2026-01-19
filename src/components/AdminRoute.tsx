"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useAuthToken, useIsAuthInitialized } from '@/hooks/useRedux';
import { useUserRole } from '@/hooks/useUserRole';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const authToken = useAuthToken();
  const isInitialized = useIsAuthInitialized();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) {
      console.log('AdminRoute: Waiting for auth initialization...');
      return;
    }
    
    console.log('AdminRoute check:', { 
      isInitialized, 
      isAuthenticated, 
      hasToken: !!authToken, 
      isAdmin 
    });
    
    if (!isAuthenticated || !authToken || !isAdmin) {
      console.warn('AdminRoute: Redirecting to /admin/login');
      router.push('/admin/login');
    }
  }, [isAuthenticated, authToken, isAdmin, isInitialized, router]);

  // Show loading while initializing
  if (!isInitialized || !isAuthenticated || !authToken || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
