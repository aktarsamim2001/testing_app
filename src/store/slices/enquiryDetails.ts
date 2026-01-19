import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEnquiryDetails } from '@/services/_api_service';

export const getEnquiryDetails = createAsyncThunk(
  'enquiryDetails/getEnquiryDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetchEnquiryDetails(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const enquiryDetailsSlice = createSlice({
  name: 'enquiryDetails',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearEnquiryDetails(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEnquiryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnquiryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || null;
      })
      .addCase(getEnquiryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      });
  },
});

export const { clearEnquiryDetails } = enquiryDetailsSlice.actions;
export default enquiryDetailsSlice.reducer;
