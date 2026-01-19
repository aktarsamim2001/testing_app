import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { service } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";
import { toast } from "@/hooks/use-toast";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface MenuItem {
  id: string | number;
  menu_name: string;
  status: number;
}

interface MenusState {
  data: MenuItem[];
  status: Status;
  error: string | null;
}

const initialState: MenusState = {
  data: [],
  status: "idle",
  error: null,
};

const menusSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    setMenus(state, action: PayloadAction<MenuItem[]>) {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    setMenusLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setMenusError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setMenus, setMenusLoading, setMenusError } = menusSlice.actions;

export default menusSlice.reducer;

// Thunk to fetch menus
export const fetchMenus = (page = 1, limit = 100) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenusLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchMenuList(page, limit, token);
    const body = response.data;
    // API returns { status, message, data: [...] }
    dispatch(setMenus(body?.data ?? []));
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load menus";
    dispatch(setMenusError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenusLoading(false));
  }
};

// Thunk to update menu
export const updateMenuThunk = (payload: { id: string | number; menu_name?: string; status?: string | number }) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenusLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateMenu(payload, token);
    const body = response.data;
    // refresh list
    dispatch(fetchMenus());
    if (body?.message) {
      toast({ title: 'Success', description: body.message, variant: 'success' });
    }
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update menu";
    dispatch(setMenusError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenusLoading(false));
  }
};

// Selectors
export const selectMenus = (state: RootState) => state.menus.data;
export const selectMenusLoading = (state: RootState) => state.menus.status === "loading";
