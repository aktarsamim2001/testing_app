import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "..";
import { service } from "@/services/_api_service";
import { toast } from '@/hooks/use-toast';

export interface Partner {
  id: string;
  name: string;
  email: string;
  channel_type: string;
  platform_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  categories: string | null;
  notes: string | null;
  status: number;
}

interface PartnersState {
  data: Partner[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
  status: "idle" | "loading" | "error";
  error: string | null;
  selectedPartner: Partner | null;
  selectedPartnerLoading: boolean;
}

const initialState: PartnersState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  status: "idle",
  error: null,
  selectedPartner: null,
  selectedPartnerLoading: false,
};

const partnersSlice = createSlice({
  name: "partners",
  initialState,
  reducers: {
    setPartners(state, action: PayloadAction<{ partners: Partner[]; pagination: any }>) {
      state.data = action.payload.partners;
      state.pagination = action.payload.pagination;
      state.status = "idle";
    },
    setPartnersLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setPartnersError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setSelectedPartner(state, action: PayloadAction<Partner | null>) {
      state.selectedPartner = action.payload;
    },
    setSelectedPartnerLoading(state, action: PayloadAction<boolean>) {
      state.selectedPartnerLoading = action.payload;
    },
  },
});

export const { setPartners, setPartnersLoading, setPartnersError, setPage, setSelectedPartner, setSelectedPartnerLoading } = partnersSlice.actions;

export default partnersSlice.reducer;

// Thunk to fetch partners list
export const fetchPartners = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setPartnersLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchPartners(page, limit, token, search);
    const body = response.data;
    dispatch(
      setPartners({
        partners: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
          totalResults: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load partners";
    dispatch(setPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setPartnersLoading(false));
  }
};

// Thunk to fetch single partner details
export const fetchPartnerDetailsThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setSelectedPartnerLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchPartnerDetails(id, token);
    const body = response.data;
    dispatch(setSelectedPartner(body?.data ?? null));
    return { success: body?.message, data: body?.data };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load partner details";
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setSelectedPartnerLoading(false));
  }
};

// Thunk: create partner
export const createPartnerThunk = (payload: {
  name: string;
  email: string;
  channel_type: string;
  platform_handle?: string | null;
  follower_count?: number | null;
  engagement_rate?: number | null;
  categories?: string | null;
  notes?: string | null;
  status?: number;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setPartnersLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createPartner(payload, token);
    const { currentPage, perPage } = getState().partners.pagination;
    dispatch(fetchPartners(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create partner";
    dispatch(setPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setPartnersLoading(false));
  }
};

// Thunk: update partner
export const updatePartnerThunk = (payload: {
  id: string;
  name: string;
  email: string;
  channel_type: string;
  platform_handle?: string | null;
  follower_count?: number | null;
  engagement_rate?: number | null;
  categories?: string | null;
  notes?: string | null;
  status?: number;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setPartnersLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updatePartner(payload, token);
    const { currentPage, perPage } = getState().partners.pagination;
    dispatch(fetchPartners(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update partner";
    dispatch(setPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setPartnersLoading(false));
  }
};

// Thunk: delete partner
export const deletePartnerThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setPartnersLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deletePartner(id, token);
    const { currentPage, perPage } = getState().partners.pagination;
    dispatch(fetchPartners(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete partner";
    dispatch(setPartnersError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setPartnersLoading(false));
  }
};

// Selectors
export const selectPartners = (state: RootState) => state.partners.data;
export const selectPartnersPagination = (state: RootState) => state.partners.pagination;
export const selectPartnersLoading = (state: RootState) => state.partners.status === "loading";
export const selectPartnersError = (state: RootState) => state.partners.error;
export const selectSelectedPartner = (state: RootState) => state.partners.selectedPartner;
export const selectSelectedPartnerLoading = (state: RootState) => state.partners.selectedPartnerLoading;
