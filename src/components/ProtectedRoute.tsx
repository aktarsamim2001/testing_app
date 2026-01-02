"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated, useAuthToken, useIsAuthInitialized } from '@/hooks/useRedux';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'brand' | 'creator';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const authToken = useAuthToken();
  const isInitialized = useIsAuthInitialized();
  const { hasRole } = useUserRole();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;
    
    const authed = isAuthenticated && !!authToken;
    const roleOk = requiredRole ? hasRole(requiredRole) : true;
    if (!authed) {
      router.push('/admin/login');
      return;
    }
    if (!roleOk) {
      // If logged in but lacks role, send to home
      router.push('/');
    }
  }, [isAuthenticated, authToken, requiredRole, hasRole, isInitialized, router]);

  const authed = isAuthenticated && !!authToken;
  const roleOk = requiredRole ? hasRole(requiredRole) : true;
  
  // Show loading while initializing or checking auth
  if (!isInitialized || !authed || !roleOk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
