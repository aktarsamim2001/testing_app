import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFrontSettings } from '../../services/_api_service';

export const getFrontSettings = createAsyncThunk('settings/getFrontSettings', async () => {
  const response = await fetchFrontSettings();
  // Only return the actual settings object
  return response.data.data;
});

const frontSettingsSlice = createSlice({
  name: 'frontSettings',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFrontSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getFrontSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(getFrontSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default frontSettingsSlice.reducer;
