import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { service } from "@/services/_api_service";

// API response data structure matching the CMS format
export interface CMSPageData {
  id: string;
  title: string;
  slug: string;
  template: string;
  meta: {
    meta_title: string;
    meta_author: string;
    meta_description: string;
    meta_keywords: string;
    meta_feature_image: string;
  };
  content: Array<{
    section1?: Array<any>;
    section2?: Array<any>;
    section3?: Array<any>;
    section4?: Array<any>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface CMSPageState {
  data: CMSPageData | null;
  isLoading: boolean;
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: CMSPageState = {
  data: null,
  isLoading: false,
  error: null,
  status: "idle",
};

// Async thunk to fetch page details from API
export const fetchCMSPage = createAsyncThunk(
  "cmsPage/fetchCMSPage",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await service.fetchPageDetails(slug);
      
      if (!response?.data?.data || response?.data?.status < 1) {
        return rejectWithValue("Invalid page data");
      }

      const pageData = response.data.data;
      return pageData;
    } catch (error: any) {
      console.error("[fetchCMSPage] Error:", error.message);
      return rejectWithValue(error.message || "Failed to fetch page");
    }
  }
);

const cmsPageSlice = createSlice({
  name: "cmsPage",
  initialState,
  reducers: {
    clearCMSPage: (state) => {
      state.data = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchCMSPage.pending, (state) => {
        state.isLoading = true;
        state.status = "loading";
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchCMSPage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
      })
      // Rejected
      .addCase(fetchCMSPage.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "failed";
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearCMSPage } = cmsPageSlice.actions;
export default cmsPageSlice.reducer;
