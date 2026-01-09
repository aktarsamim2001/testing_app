import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from '@/hooks/use-toast';
import { service } from "@/services/_api_service";
import type { ServiceCreatePayload, ServiceUpdatePayload, ServiceListItem } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";

// Types
export interface Service extends ServiceListItem {
  slug?: string;
  meta_title?: string;
  meta_author?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_feature_image?: string;
  content?: any[];
  template?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServicePayload extends ServiceCreatePayload {
  slug?: string;
  meta_title?: string;
  meta_author?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_feature_image?: string;
  data?: any[];
  template?: string;
}

export interface ServiceUpdateRequest {
  id: string;
  data: ServicePayload;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ServicesState {
  data: Service[];
  pagination: PaginationState;
  status: Status;
  error: string | null;
}

const initialState: ServicesState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
    totalRecords: 0,
  },
  status: "idle",
  error: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices(state, action: PayloadAction<{ services: Service[]; pagination: PaginationState }>) {
      state.data = action.payload.services;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setServicesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setServicesError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setServiceNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setServices, setServicesLoading, setServicesError, setServiceNumber } = servicesSlice.actions;

export default servicesSlice.reducer;

// Thunk to fetch services list
export const fetchServices = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setServicesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchServices(page, limit, token, search);
    const body = response.data;
    dispatch(
      setServices({
        services: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load services";
    dispatch(setServicesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setServicesLoading(false));
  }
};

// Thunk: create service
export const createServiceThunk = createAsyncThunk<
  any, // Return type
  ServicePayload, // Argument type
  { state: RootState; rejectValue: string }
>(
  'services/createService',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      console.log('Creating service with payload:', payload);
      const response = await service.createService(payload, token);
      if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to create service";
      console.error('Service creation error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Thunk: update service
export const updateServiceThunk = createAsyncThunk<
  any,
  ServiceUpdateRequest,
  { state: RootState; rejectValue: string }
>(
  'services/updateService',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.updateService({ id: payload.id, ...payload.data } as any, token);
      if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update service";
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Thunk: delete service
export const deleteServiceThunk = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  'services/deleteService',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.deleteService(id, token);
      if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete service";
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Add extra reducers for async thunks
export const servicesSliceWithAsyncReducers = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices(state, action: PayloadAction<{ services: Service[]; pagination: PaginationState }>) {
      state.data = action.payload.services;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setServicesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setServicesError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setServiceNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Service
    builder.addCase(createServiceThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(createServiceThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(createServiceThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to create service";
    });

    // Update Service
    builder.addCase(updateServiceThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(updateServiceThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(updateServiceThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to update service";
    });

    // Delete Service
    builder.addCase(deleteServiceThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(deleteServiceThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(deleteServiceThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to delete service";
    });
  },
});

// Selectors
export const selectServices = (state: RootState) => state.services.data;
export const selectServicesPagination = (state: RootState) => state.services.pagination;
export const selectServicesLoading = (state: RootState) => state.services.status === "loading";
export const selectServicesError = (state: RootState) => state.services.error;
