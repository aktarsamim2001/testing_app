import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from '@/hooks/use-toast';
import { service } from "@/services/_api_service";
import type { SubscriptionCreatePayload, SubscriptionUpdatePayload, SubscriptionListItem } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";

// Types
export interface Subscription extends SubscriptionListItem {
  partnerships?: string;
  features?: Array<{ title: string }>;
  popular?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPayload extends SubscriptionCreatePayload {}

export interface SubscriptionUpdateRequest {
  id: string;
  data: SubscriptionPayload;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface SubscriptionsState {
  data: Subscription[];
  pagination: PaginationState;
  status: Status;
  error: string | null;
}

const initialState: SubscriptionsState = {
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

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setSubscriptions(state, action: PayloadAction<{ subscriptions: Subscription[]; pagination: PaginationState }>) {
      state.data = action.payload.subscriptions;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setSubscriptionsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setSubscriptionsError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setSubscriptionNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setSubscriptions, setSubscriptionsLoading, setSubscriptionsError, setSubscriptionNumber } = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;

// Thunk to fetch subscriptions list
export const fetchSubscriptions = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setSubscriptionsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchSubscriptions(page, limit, token, search);
    const body = response.data;
    dispatch(
      setSubscriptions({
        subscriptions: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load subscriptions";
    dispatch(setSubscriptionsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setSubscriptionsLoading(false));
  }
};

// Thunk: create subscription
export const createSubscriptionThunk = createAsyncThunk<
  any,
  SubscriptionPayload,
  { state: RootState; rejectValue: string }
>(
  'subscriptions/createSubscription',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      console.log('Creating subscription with payload:', payload);
      const response = await service.createSubscription(payload, token);
      console.log('Subscription creation response:', response);
      toast({ title: 'Success', description: 'Subscription created successfully', variant: 'success' });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to create subscription";
      console.error('Subscription creation error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Thunk: update subscription
export const updateSubscriptionThunk = createAsyncThunk<
  any,
  SubscriptionUpdateRequest,
  { state: RootState; rejectValue: string }
>(
  'subscriptions/updateSubscription',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.updateSubscription({ id: payload.id, ...payload.data } as any, token);
      toast({ title: 'Success', description: 'Subscription updated successfully', variant: 'success' });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update subscription";
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Thunk: delete subscription
export const deleteSubscriptionThunk = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  'subscriptions/deleteSubscription',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.deleteSubscription(id, token);
      toast({ title: 'Success', description: 'Subscription deleted successfully', variant: 'success' });
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete subscription";
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return rejectWithValue(message);
    }
  }
);

// Add extra reducers for async thunks
export const subscriptionsSliceWithAsyncReducers = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setSubscriptions(state, action: PayloadAction<{ subscriptions: Subscription[]; pagination: PaginationState }>) {
      state.data = action.payload.subscriptions;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setSubscriptionsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setSubscriptionsError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setSubscriptionNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Subscription
    builder.addCase(createSubscriptionThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(createSubscriptionThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(createSubscriptionThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to create subscription";
    });

    // Update Subscription
    builder.addCase(updateSubscriptionThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(updateSubscriptionThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(updateSubscriptionThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to update subscription";
    });

    // Delete Subscription
    builder.addCase(deleteSubscriptionThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(deleteSubscriptionThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(deleteSubscriptionThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to delete subscription";
    });
  },
});

// Selectors
export const selectSubscriptions = (state: RootState) => state.subscriptions.data;
export const selectSubscriptionsPagination = (state: RootState) => state.subscriptions.pagination;
export const selectSubscriptionsLoading = (state: RootState) => state.subscriptions.status === "loading";
export const selectSubscriptionsError = (state: RootState) => state.subscriptions.error;
