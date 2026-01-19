import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAdminEnquiriesList } from '@/services/_api_service';

export const getEnquiries = createAsyncThunk(
  'enquiries/getEnquiries',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params || {};
      const response = await getAdminEnquiriesList(page, limit, search);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState: {
    data: [],
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEnquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        // Try to extract pagination from action.payload.pagination if present
        const pag = action.payload.pagination || {};
        state.currentPage = pag.current_page || action.payload.currentPage || action.payload.page || 1;
        state.totalPages = pag.total_pages || action.payload.totalPages || action.payload.last_page || 1;
        state.totalResults = pag.total_records || action.payload.total || (action.payload.data ? action.payload.data.length : 0);
        state.total = state.totalResults;
      })
      .addCase(getEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });
  },
});

export default enquiriesSlice.reducer;
