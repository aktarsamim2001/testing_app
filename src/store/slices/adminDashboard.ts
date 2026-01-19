import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { service } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";
import { toast } from "@/hooks/use-toast";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface AdminDashboardState {
  totalClients: number;
  totalPartners: number;
  totalCampaigns: number;
  status: Status;
  error: string | null;
}

const initialState: AdminDashboardState = {
  totalClients: 0,
  totalPartners: 0,
  totalCampaigns: 0,
  status: "idle",
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    setDashboard(state, action: PayloadAction<{ totalClients: number; totalPartners: number; totalCampaigns: number }>) {
      state.totalClients = action.payload.totalClients;
      state.totalPartners = action.payload.totalPartners;
      state.totalCampaigns = action.payload.totalCampaigns;
      state.status = "succeeded";
      state.error = null;
    },
    setDashboardLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setDashboardError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setDashboard, setDashboardLoading, setDashboardError } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

// Thunk to fetch dashboard
export const fetchAdminDashboard = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setDashboardLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchAdminDashboard(token);
    const body = response.data;
    dispatch(
      setDashboard({
        totalClients: body?.data?.totalClients ?? 0,
        totalPartners: body?.data?.totalPartners ?? 0,
        totalCampaigns: body?.data?.totalCampaigns ?? 0,
      })
    );
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load dashboard";
    dispatch(setDashboardError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setDashboardLoading(false));
  }
};

// Selectors
export const selectAdminDashboard = (state: RootState) => ({
  totalClients: state.adminDashboard.totalClients,
  totalPartners: state.adminDashboard.totalPartners,
  totalCampaigns: state.adminDashboard.totalCampaigns,
});
export const selectAdminDashboardLoading = (state: RootState) => state.adminDashboard.status === "loading";
