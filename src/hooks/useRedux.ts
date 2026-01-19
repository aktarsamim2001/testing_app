
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthState = () => {
  return useAppSelector((state) => state.auth);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthentication);
};

/**
 * Hook to get current user profile data
 */
export const useProfileData = () => {
  return useAppSelector((state) => state.auth.profileData);
};

export const useAuthToken = () => {
  return useAppSelector((state) => state.auth.authToken);
};

export const useLoadingStatus = () => {
  return useAppSelector((state) => state.auth.loadingStatus);
};
export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

export const useIsAuthInitialized = () => {
  return useAppSelector((state) => state.auth.isInitialized);
};
