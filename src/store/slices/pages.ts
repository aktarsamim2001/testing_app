import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { service } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";

// Types
export interface PageContentSection {
  [key: string]: any;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  meta_title?: string;
  meta_author?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_feature_image?: string;
  content: PageContentSection[];
  template?: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface PageCreatePayload {
  template: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_author: string;
  meta_keywords: string;
  meta_description: string;
  meta_feature_image?: string;
  data: any[];
  status: string | number;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface PagesState {
  data: Page[];
  pagination: PaginationState;
  status: Status;
  error: string | null;
}

const initialState: PagesState = {
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

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    setPages(state, action: PayloadAction<{ pages: Page[]; pagination: PaginationState }>) {
      state.data = action.payload.pages;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setPagesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setPagesError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setPageNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setPages, setPagesLoading, setPagesError, setPageNumber } = pagesSlice.actions;

export default pagesSlice.reducer;

// Thunk to fetch pages list
export const fetchPages = (page = 1, limit = 10) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setPagesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.getAdminPagesList(page, limit, token);
    const body = response.data;
    dispatch(
      setPages({
        pages: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load pages";
    dispatch(setPagesError(message));
    toast.error(message);
  } finally {
    dispatch(setPagesLoading(false));
  }
};

// Thunk: create page
export const createPageThunk = createAsyncThunk<
  any, // Return type
  PageCreatePayload, // Argument type
  { state: RootState; rejectValue: string }
>(
  'pages/createPage',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.createPage(payload, token);
      toast.success("Page created successfully");
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to create page";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Thunk: update page
export const updatePageThunk = createAsyncThunk<
  any,
  PageCreatePayload,
  { state: RootState; rejectValue: string }
>(
  'pages/updatePage',
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.updatePage(payload, token);
      toast.success("Page updated successfully");
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update page";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Thunk: delete page
export const deletePageThunk = createAsyncThunk<
  any,
  string,
  { state: RootState; rejectValue: string }
>(
  'pages/deletePage',
  async (id, { getState, rejectWithValue }) => {
    const token = getState().auth.authToken;
    try {
      const response = await service.deletePage(id, token);
      toast.success("Page deleted successfully");
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to delete page";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Add extra reducers for async thunks
// This will handle loading states automatically
export const pagesSliceWithAsyncReducers = createSlice({
  name: "pages",
  initialState,
  reducers: {
    setPages(state, action: PayloadAction<{ pages: Page[]; pagination: PaginationState }>) {
      state.data = action.payload.pages;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setPagesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setPagesError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setPageNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Page
    builder.addCase(createPageThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(createPageThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(createPageThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to create page";
    });

    // Update Page
    builder.addCase(updatePageThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(updatePageThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(updatePageThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to update page";
    });

    // Delete Page
    builder.addCase(deletePageThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(deletePageThunk.fulfilled, (state) => {
      state.status = "succeeded";
    });
    builder.addCase(deletePageThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Failed to delete page";
    });
  },
});

// Selectors
export const selectPages = (state: RootState) => state.pages.data;
export const selectPagesPagination = (state: RootState) => state.pages.pagination;
export const selectPagesLoading = (state: RootState) => state.pages.status === "loading";
export const selectPagesError = (state: RootState) => state.pages.error;