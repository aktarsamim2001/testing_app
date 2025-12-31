import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/store";
import { service } from "@/services/_api_service";
import { toast } from '@/hooks/use-toast';

export interface CampaignPartner {
  id: string;
  partner_id: string;
  compensation: number | null;
  status: string | null;
  notes: string | null;
  partner_name: string;
  partner_channel_type: string;
  partner_email: string;
}


// Assignable Partner type
export interface AssignablePartner {
  id: string;
  name: string;
  email: string;
  channel_type: string;
}

interface AssignablePartnersState {
  data: AssignablePartner[];
  total: number;
  page: number;
  limit: number;
  status: "idle" | "loading" | "error";
  error: string | null;
}

interface CampaignPartnersState {
  data: CampaignPartner[];
  status: "idle" | "loading" | "error";
  error: string | null;
  assignable: AssignablePartnersState;
}

const initialState: CampaignPartnersState = {
  data: [],
  status: "idle",
  error: null,
  assignable: {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    status: "idle",
    error: null,
  },
};


const campaignPartnersSlice = createSlice({
  name: "campaignPartners",
  initialState,
  reducers: {
    setCampaignPartners(state, action: PayloadAction<CampaignPartner[]>) {
      state.data = action.payload;
      state.status = "idle";
    },
    setCampaignPartnersLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setCampaignPartnersError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },

    // Assignable partners reducers
    setAssignablePartners(state, action: PayloadAction<{ data: AssignablePartner[]; total: number; page: number; limit: number }>) {
      state.assignable.data = action.payload.data;
      state.assignable.total = action.payload.total;
      state.assignable.page = action.payload.page;
      state.assignable.limit = action.payload.limit;
      state.assignable.status = "idle";
    },
    setAssignablePartnersLoading(state, action: PayloadAction<boolean>) {
      state.assignable.status = action.payload ? "loading" : "idle";
    },
    setAssignablePartnersError(state, action: PayloadAction<string>) {
      state.assignable.error = action.payload;
      state.assignable.status = "error";
    },
  },
});

export const {
  setCampaignPartners,
  setCampaignPartnersLoading,
  setCampaignPartnersError,
  setAssignablePartners,
  setAssignablePartnersLoading,
  setAssignablePartnersError,
} = campaignPartnersSlice.actions;

export default campaignPartnersSlice.reducer;



// ...existing code...

// Thunk to fetch assignable partners (paginated, not assigned to this campaign)
export const fetchCampaignAssignablePartners = (page = 1, limit = 10) => async (dispatch: AppDispatch) => {
  dispatch(setAssignablePartnersLoading(true));
  try {
    const response = await service.fetchCampaignPartnerListAPI(page, limit);
    const body = response.data;
    dispatch(setAssignablePartners({
      data: body?.data ?? [],
      total: body?.total ?? 0,
      page,
      limit,
    }));
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to load assignable partners';
    dispatch(setAssignablePartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setAssignablePartnersLoading(false));
  }
};

// Thunk to assign a partner to a campaign
export const assignPartnerToCampaign = (payload: {
  campaign_id: string;
  partner_id: string;
  compensation?: string | number;
  notes?: string;
  status?: string;
}) => async (dispatch: AppDispatch) => {
  dispatch(setCampaignPartnersLoading(true));
  try {
    const response = await service.assignPartnerToCampaignAPI(payload);
    const apiMessage = response?.data?.message || 'Partner assigned to campaign';
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    dispatch(fetchCampaignAssignablePartners());
    dispatch(setCampaignPartners([])); // Clear assigned partners list (or trigger UI refresh)
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to assign partner';
    dispatch(setCampaignPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCampaignPartnersLoading(false));
  }
};

// Thunk to remove a partner from a campaign
export const removePartnerFromCampaign = (payload: { id: string; campaignId: string }) => async (dispatch: AppDispatch) => {
  dispatch(setCampaignPartnersLoading(true));
  try {
    const response = await service.removePartnerFromCampaignAPI(payload.id);
    const apiMessage = response?.data?.message || 'Partner removed from campaign';
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    dispatch(fetchCampaignAssignablePartners());
    dispatch(setCampaignPartners([])); // Clear assigned partners list (or trigger UI refresh)
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to remove partner';
    dispatch(setCampaignPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCampaignPartnersLoading(false));
  }
};


// Selectors
export const selectCampaignPartners = (state: RootState) => state.campaignPartners.data;
export const selectCampaignPartnersLoading = (state: RootState) => state.campaignPartners.status === 'loading';
export const selectCampaignPartnersError = (state: RootState) => state.campaignPartners.error;

// Assignable partners selectors
export const selectAssignablePartners = (state: RootState) => state.campaignPartners.assignable.data;
export const selectAssignablePartnersTotal = (state: RootState) => state.campaignPartners.assignable.total;
export const selectAssignablePartnersPage = (state: RootState) => state.campaignPartners.assignable.page;
export const selectAssignablePartnersLimit = (state: RootState) => state.campaignPartners.assignable.limit;
export const selectAssignablePartnersLoading = (state: RootState) => state.campaignPartners.assignable.status === 'loading';
export const selectAssignablePartnersError = (state: RootState) => state.campaignPartners.assignable.error;
