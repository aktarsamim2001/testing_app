import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/store";
import { service } from "@/services/_api_service";
import toast from "react-hot-toast";

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

interface CampaignPartnersState {
  data: CampaignPartner[];
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: CampaignPartnersState = {
  data: [],
  status: "idle",
  error: null,
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
  },
});

export const { setCampaignPartners, setCampaignPartnersLoading, setCampaignPartnersError } = campaignPartnersSlice.actions;
export default campaignPartnersSlice.reducer;


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
    await service.assignPartnerToCampaignAPI(payload);
    toast.success('Partner assigned to campaign');
    dispatch(fetchCampaignPartners(payload.campaign_id));
  } catch (error: any) {
    dispatch(setCampaignPartnersError(error?.message || 'Failed to assign partner'));
    toast.error(error?.message || 'Failed to assign partner');
  } finally {
    dispatch(setCampaignPartnersLoading(false));
  }
};

// Thunk to remove a partner from a campaign
export const removePartnerFromCampaign = (payload: { id: string; campaignId: string }) => async (dispatch: AppDispatch) => {
  dispatch(setCampaignPartnersLoading(true));
  try {
    await service.removePartnerFromCampaignAPI(payload.id);
    toast.success('Partner removed from campaign');
    dispatch(fetchCampaignPartners(payload.campaignId));
  } catch (error: any) {
    dispatch(setCampaignPartnersError(error?.message || 'Failed to remove partner'));
    toast.error(error?.message || 'Failed to remove partner');
  } finally {
    dispatch(setCampaignPartnersLoading(false));
  }
};

// Selectors
export const selectCampaignPartners = (state: RootState) => state.campaignPartners.data;
export const selectCampaignPartnersLoading = (state: RootState) => state.campaignPartners.status === 'loading';
export const selectCampaignPartnersError = (state: RootState) => state.campaignPartners.error;
