import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { service, Client } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";
import { toast } from '@/hooks/use-toast';

type Status = "idle" | "loading" | "succeeded" | "failed";

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ClientsState {
  data: Client[];
  pagination: PaginationState;
  status: Status;
  error: string | null;
}

const initialState: ClientsState = {
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

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<{ clients: Client[]; pagination: PaginationState }>) {
      state.data = action.payload.clients;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setClientsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setClientsError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setClients, setClientsLoading, setClientsError, setPage } = clientsSlice.actions;

export default clientsSlice.reducer;

// Thunk to fetch clients list
export const fetchClients = (page = 1, limit = 10) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setClientsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchClients(page, limit, token);
    const body = response.data;
    dispatch(
      setClients({
        clients: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load clients";
    dispatch(setClientsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setClientsLoading(false));
  }
};

// Thunk: create client
export const createClientThunk = (payload: {
  company_name: string;
  name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  status?: number | string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setClientsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createClient(payload, token);
    const { currentPage, perPage } = getState().clients.pagination;
    dispatch(fetchClients(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'default' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create client";
    dispatch(setClientsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setClientsLoading(false));
  }
};

// Thunk: update client
export const updateClientThunk = (payload: {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  status?: number | string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setClientsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateClient(payload, token);
    const { currentPage, perPage } = getState().clients.pagination;
    dispatch(fetchClients(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'default' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update client";
    dispatch(setClientsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setClientsLoading(false));
  }
};

// Thunk: delete client
export const deleteClientThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setClientsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteClient(id, token);
    const { currentPage, perPage } = getState().clients.pagination;
    dispatch(fetchClients(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'default' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete client";
    dispatch(setClientsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setClientsLoading(false));
  }
};

// Selectors
export const selectClients = (state: RootState) => state.clients.data;
export const selectClientsPagination = (state: RootState) => state.clients.pagination;
export const selectClientsLoading = (state: RootState) => state.clients.status === "loading";
export const selectClientsError = (state: RootState) => state.clients.error;
