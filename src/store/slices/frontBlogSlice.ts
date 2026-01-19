import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFrontBlogList } from '../../services/_api_service';

export interface FrontBlogListParams {
  page?: number;
  limit?: number;
  category_id?: string;
}

export const getFrontBlogList = createAsyncThunk<
  any, // Replace with actual response type if known
  FrontBlogListParams | void
>(
  'frontBlog/list',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchFrontBlogList(params || {});
      // Only return the actual blog data object
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const frontBlogSlice = createSlice({
  name: 'frontBlog',
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFrontBlogList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFrontBlogList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getFrontBlogList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch blog list';
      });
  },
});

export default frontBlogSlice.reducer;
