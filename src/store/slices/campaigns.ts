
"use strict";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "..";
import { service, Campaign } from "@/services/_api_service";
import { toast } from '@/hooks/use-toast';

interface CampaignsState {
  data: Campaign[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
    totalResults: number;
  };
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: CampaignsState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
    totalResults: 0,
  },
  status: "idle",
  error: null,
};

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    setCampaigns(state, action: PayloadAction<{ campaigns: Campaign[]; pagination: any }>) {
      state.data = action.payload.campaigns;
      state.pagination = action.payload.pagination;
      state.status = "idle";
    },
    setCampaignsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setCampaignsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setCampaigns, setCampaignsLoading, setCampaignsError, setPage } = campaignsSlice.actions;

export default campaignsSlice.reducer;

// Thunk to fetch campaigns list
export const fetchCampaigns = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCampaignsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchCampaigns(page, limit, token, search);
    const body = response.data;

    dispatch(
      setCampaigns({
        campaigns: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
          totalResults: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    console.error('[campaigns] fetchCampaigns error', error);
    const message = error?.response?.data?.message || error?.message || "Failed to load campaigns";
    dispatch(setCampaignsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    console.log('[campaigns] fetchCampaigns end');
    dispatch(setCampaignsLoading(false));
  }
};

// Thunk: create campaign
export const createCampaignThunk = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCampaignsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createCampaign(payload, token);
    const apiMessage = response?.data?.message || "Campaign created successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().campaigns.pagination;
    dispatch(fetchCampaigns(currentPage, perPage));
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create campaign";
    dispatch(setCampaignsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCampaignsLoading(false));
  }
};

// Thunk: update campaign
export const updateCampaignThunk = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCampaignsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateCampaign(payload, token);
    const apiMessage = response?.data?.message || "Campaign updated successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().campaigns.pagination;
    dispatch(fetchCampaigns(currentPage, perPage));
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update campaign";
    dispatch(setCampaignsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCampaignsLoading(false));
  }
};

// Thunk: delete campaign
export const deleteCampaignThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCampaignsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteCampaign(id, token);
    const apiMessage = response?.data?.message || "Campaign deleted successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().campaigns.pagination;
    dispatch(fetchCampaigns(currentPage, perPage));
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete campaign";
    dispatch(setCampaignsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCampaignsLoading(false));
  }
};

// Thunk: fetch single campaign by id
export const fetchCampaignById = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCampaignsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.campaignView(id, token);
    const body = response.data;
    // Optionally, you can dispatch to store this campaign in state if needed
    // For now, just return the data
    return body.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load campaign";
    dispatch(setCampaignsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    throw error;
  } finally {
    dispatch(setCampaignsLoading(false));
  }
};

// Selectors
export const selectCampaigns = (state: RootState) => state.campaigns.data;
export const selectCampaignsPagination = (state: RootState) => state.campaigns.pagination;
export const selectCampaignsLoading = (state: RootState) => state.campaigns.status === "loading";
export const selectCampaignsError = (state: RootState) => state.campaigns.error;
