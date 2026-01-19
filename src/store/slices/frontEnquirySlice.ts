import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createFrontEnquiry } from '../../services/_api_service';

export interface FrontEnquiryPayload {
  source: string;
  name: string;
  email: string;
  company: string;
  website: string;
  service_interest: string;
  monthly_budget: string;
  description: string;
}

export const submitFrontEnquiry = createAsyncThunk<
  any, // Replace with actual response type if known
  FrontEnquiryPayload | void
>(
  'frontEnquiry/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createFrontEnquiry(payload as FrontEnquiryPayload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const frontEnquirySlice = createSlice({
  name: 'frontEnquiry',
  initialState: {
    loading: false,
    data: null,
    error: null,
    success: false,
  },
  reducers: {
    resetEnquiryState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFrontEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitFrontEnquiry.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.success = true;
      })
      .addCase(submitFrontEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Submission failed';
        state.success = false;
      });
  },
});

export const { resetEnquiryState } = frontEnquirySlice.actions;
export default frontEnquirySlice.reducer;
