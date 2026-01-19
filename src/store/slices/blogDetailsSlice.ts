import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { frontBlogDetails } from '../../services/_api_service';

export const getBlogDetails = createAsyncThunk(
  'blogDetails/getBlogDetails',
  async (slug: string) => {
    const response = await frontBlogDetails(slug);
    return response.data.data;
  }
);

const blogDetailsSlice = createSlice({
  name: 'blogDetails',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBlogDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getBlogDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(getBlogDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default blogDetailsSlice.reducer;
