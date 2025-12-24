"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAuthToken, useProfileData, useIsAuthenticated, useIsAuthInitialized } from "@/hooks/useRedux";
import { loginUser, logout } from "@/store/slices/auth";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: "brand" | "creator" | "admin";
  companyName?: string;
  phone?: string;
  channelType?: "blogger" | "linkedin" | "youtube";
  platformHandle?: string;
}

interface AuthContextType {
  user: any | null;
  session: { access_token: string | null } | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string, userType?: "admin" | "brand" | "creator") => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authToken = useAuthToken();
  const profile = useProfileData();
  const isAuth = useIsAuthenticated();
  const isInitialized = useIsAuthInitialized();

  // Derive user/session synchronously from Redux to avoid null flashes
  const session = useMemo(() => ({ access_token: authToken }), [authToken]);
  const user = useMemo(
    () =>
      profile
        ? {
            id: (profile as any).id ?? undefined,
            email:
              (profile as any).email ??
              (profile as any).user?.email ??
              (profile as any).user_email ??
              undefined,
            name:
              (profile as any).name ??
              (profile as any).full_name ??
              (profile as any).user?.name ??
              undefined,
            user_type: (profile as any).user_type ?? (profile as any).role ?? undefined,
          }
        : null,
    [profile]
  );

  const signUp = async (_data: SignUpData) => {
    // Sign-up is handled directly via Redux in Auth page; keep placeholder.
    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string,
    userType: "admin" | "brand" | "creator" = "admin"
  ) => {
    try {
      await dispatch(
        loginUser({ email, password, user_type: userType })
      ).unwrap();
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    try {
      dispatch(logout());
    } finally {
      router.push("/auth");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading: !isInitialized, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe default instead of throwing during build
    // This prevents SSR/build-time errors in dynamic routes
    return {
      user: null,
      session: null,
      loading: false,
      signUp: async () => ({ error: new Error('AuthProvider not found') }),
      signIn: async () => ({ error: new Error('AuthProvider not found') }),
      signOut: async () => {},
    } as AuthContextType;
  }
  return context;
}
