import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/store";
import { service } from "@/services/_api_service";
import toast from "react-hot-toast";

export interface CampaignAssignablePartner {
  id: string;
  name: string;
  channel_type: string;
}

interface CampaignAssignablePartnersState {
  data: CampaignAssignablePartner[];
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: CampaignAssignablePartnersState = {
  data: [],
  status: "idle",
  error: null,
};

const campaignAssignablePartnersSlice = createSlice({
  name: "campaignAssignablePartners",
  initialState,
  reducers: {
    setCampaignAssignablePartners(state, action: PayloadAction<CampaignAssignablePartner[]>) {
      state.data = action.payload;
      state.status = "idle";
    },
    setCampaignAssignablePartnersLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setCampaignAssignablePartnersError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
  },
});

export const {
  setCampaignAssignablePartners,
  setCampaignAssignablePartnersLoading,
  setCampaignAssignablePartnersError,
} = campaignAssignablePartnersSlice.actions;
export default campaignAssignablePartnersSlice.reducer;

// Thunk to fetch assignable partners for a campaign
export const fetchCampaignAssignablePartners = (page = 1, limit = 100) => async (dispatch: AppDispatch) => {
  dispatch(setCampaignAssignablePartnersLoading(true));
  try {
    const response = await service.fetchCampaignPartnerListAPI(page, limit);
    dispatch(setCampaignAssignablePartners(response.data.data || []));
  } catch (error: any) {
    dispatch(setCampaignAssignablePartnersError(error?.message || "Failed to load partners"));
    toast.error(error?.message || "Failed to load partners");
  } finally {
    dispatch(setCampaignAssignablePartnersLoading(false));
  }
};

export const selectCampaignAssignablePartners = (state: RootState) => state.campaignAssignablePartners.data;
export const selectCampaignAssignablePartnersLoading = (state: RootState) => state.campaignAssignablePartners.status === 'loading';
export const selectCampaignAssignablePartnersError = (state: RootState) => state.campaignAssignablePartners.error;
