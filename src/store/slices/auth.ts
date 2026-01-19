

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from '@/hooks/use-toast';
import { service } from "@/services/_api_service";

// ==================== Type Definitions ====================

interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  user_type?: "brand" | "creator";
  [key: string]: any;
}

interface AuthState {
  loadingStatus: boolean;
  authToken: string | null;
  isAuthentication: boolean;
  profileData: ProfileData | null;
  userData: Partial<ProfileData>;
  error: string | null;
  isInitialized: boolean;
}

interface LoginPayload {
  user_type: "admin" | "brand" | "creator";
  email: string;
  password: string;
}

interface RegisterPayload {
  user_type: "brand" | "creator";
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  password: string;
  channel_type?: string;
  platform_handle?: string;
}

// ==================== Helper Functions ====================

// Helper function to safely access localStorage
const getLocalStorageItem = (
  key: string,
  defaultValue: string | null = null
): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) ?? defaultValue;
  }
  return defaultValue;
};

// ==================== Initial State ====================

// Create initial state without trying to access localStorage on server
const initialState: AuthState = {
  loadingStatus: false,
  authToken: null,
  isAuthentication: false,
  profileData: null,
  userData: {},
  error: null,
  isInitialized: false,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await service.register(payload);
      console.log("Register API Response:", response.data);
      
      const { token, data, message } = response.data;

      // API returned success - show success message
      toast({ title: 'Success', description: message || 'Registration successful', variant: 'success' });

      // If we have a token, store auth data
      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
          localStorage.setItem("profileData", JSON.stringify(data || {}));
          document.cookie = `token=${token}; path=/;`;
          console.log("Token stored:", token);
        }
        return { token, profile: data || {}, needsVerification: false };
      }

      // No token but API success - user might need to verify email
      return { token: null, profile: null, needsVerification: true, message };
    } catch (error: any) {
      // Use API error message if available
      const errorMessage = error?.response?.data?.message || error?.message || "Registration failed";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      console.error("Register error:", error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Login user
 * POST: /api/auth/login
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await service.login(payload);
      
      const { token, data, message } = response.data;

      // API returned success - show success message
      toast({ title: 'Success', description: message || 'Login successful', variant: 'success' });

      // If we have a token, store auth data
      if (token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
          localStorage.setItem("profileData", JSON.stringify(data || {}));
          document.cookie = `token=${token}; path=/;`;
          console.log("Token stored:", token);
        }
        return { token, profile: data || {}, needsVerification: false };
      }

      // No token but API success - user might need to verify email
      return { token: null, profile: null, needsVerification: true, message };
    } catch (error: any) {
      console.error("Login error details:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== Auth Slice ====================

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set loading status
     */
    setLoadingStatus: (state, action) => {
      state.loadingStatus = action.payload;
    },

    /**
     * Initialize auth from localStorage (called on app mount)
     */
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        const profileData = localStorage.getItem("profileData");
        
        if (token) {
          state.authToken = token;
          state.isAuthentication = true;
          if (profileData) {
            try {
              state.profileData = JSON.parse(profileData);
            } catch (e) {
              console.error("Failed to parse profileData:", e);
            }
          }
        }
      }
      state.isInitialized = true;
    },

    /**
     * Set auth data from external source
     */
    setAuthData: (state, action) => {
      const { token, profile } = action.payload;
      state.authToken = token;
      state.isAuthentication = true;
      state.profileData = profile;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        localStorage.setItem("profileData", JSON.stringify(profile));
        document.cookie = `token=${token}; path=/;`;
      }
    },

    /**
     * Set user data
     */
    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Logout user and clear all data
     */
    logout: (state) => {
      if (typeof window !== "undefined") {
        localStorage.clear();
        // Clear auth cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      }
      state.authToken = null;
      state.isAuthentication = false;
      state.profileData = null;
      state.userData = {};
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // Register User
    builder
      .addCase(registerUser.pending, (state) => {
        state.loadingStatus = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loadingStatus = false;
        state.authToken = action.payload.token;
        state.isAuthentication = true;
        state.profileData = action.payload.profile;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loadingStatus = false;
        state.error = action.payload as string;
      });

    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.loadingStatus = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingStatus = false;
        state.authToken = action.payload.token;
        state.isAuthentication = true;
        state.profileData = action.payload.profile;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingStatus = false;
        state.error = action.payload as string;
      });
  },
});

// ==================== Exports ====================

export const {
  setLoadingStatus,
  initializeAuth,
  setAuthData,
  setUserData,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
