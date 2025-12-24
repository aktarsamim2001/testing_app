"use client";

import { useMemo } from "react";
import { useProfileData, useIsAuthInitialized } from "@/hooks/useRedux";

type AppRole = "admin" | "brand" | "creator" | "moderator" | "user";

export function useUserRole() {
  const profile = useProfileData();
  const isInitialized = useIsAuthInitialized();

  const roles: AppRole[] = useMemo(() => {
    if (!profile) return [];

    // Prefer explicit roles array if present
    const explicitRoles = Array.isArray((profile as any).roles)
      ? ((profile as any).roles as string[])
      : [];
    if (explicitRoles.length > 0) {
      return explicitRoles.map((r) => r.toLowerCase() as AppRole);
    }

    // Fallback to user_type/role fields (normalize to lowercase)
    const ut = ((profile as any).user_type || (profile as any).role) as string | undefined;
    const normalized = ut?.toLowerCase();
    if (normalized === "admin" || normalized === "brand" || normalized === "creator") {
      return [normalized as AppRole];
    }

    return [];
  }, [profile]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator");

  // loading stays true until auth initialization completes
  return { roles, hasRole, isAdmin, isModerator, loading: !isInitialized };
}
