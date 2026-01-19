import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { service } from '@/services/_api_service';

export interface FooterSocialIcon {
  name: string;
  url: string;
  icon: string;
}

export interface SettingsData {
  id: string;
  logo: string;
  fav_icon: string;
  phone: string;
  email: string;
  head_scripts: string;
  body_scripts: string;
  footer_scripts: string;
  footer_description: string;
  copy_right: string;
  footer_social_icon: FooterSocialIcon[];
}

interface SettingsState {
  data: SettingsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await service.fetchSettings();
      if (response.status !== 1) throw new Error(response.message || 'Failed to fetch settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (payload: SettingsData, { rejectWithValue }) => {
    try {
      const response = await service.updateSettings(payload);
      if (response.status !== 1) throw new Error(response.message || 'Failed to update settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const settingsReducer = settingsSlice.reducer;
export default settingsSlice.reducer;
