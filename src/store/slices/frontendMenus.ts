import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "@/store";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface FrontendMenuItem {
  id: string;
  order: number;
  title: string;
  url: string;
  target_set: string;
  page: null | string;
}

export interface FrontendMenu {
  id: string;
  menu_name: string;
  status: number;
  items: FrontendMenuItem[];
}

interface FrontendMenusState {
  headerMenu: FrontendMenu | null;
  footerMenu: FrontendMenu | null;
  status: Status;
  error: string | null;
}

const initialState: FrontendMenusState = {
  headerMenu: null,
  footerMenu: null,
  status: "idle",
  error: null,
};

const frontendMenusSlice = createSlice({
  name: "frontendMenus",
  initialState,
  reducers: {
    setFrontendMenus(state, action: PayloadAction<FrontendMenu[]>) {
      const menus = action.payload;
      const headerMenu = menus.find((m) => m.menu_name === "Header Menu");
      const footerMenu = menus.find((m) => m.menu_name === "Footer Menu");

      state.headerMenu = headerMenu || null;
      state.footerMenu = footerMenu || null;
      state.status = "succeeded";
      state.error = null;
    },
    setFrontendMenusLoading(state) {
      state.status = "loading";
    },
    setFrontendMenusError(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setFrontendMenus, setFrontendMenusLoading, setFrontendMenusError } =
  frontendMenusSlice.actions;

export default frontendMenusSlice.reducer;

// Thunk to fetch frontend menus
export const fetchFrontendMenus = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setFrontendMenusLoading());
    const { fetchFrontendMenuList } = await import("@/services/_api_service");
    const response = await fetchFrontendMenuList();
    
    if (response.data && response.data.data) {
      dispatch(setFrontendMenus(response.data.data));
    }
  } catch (error: any) {
    dispatch(
      setFrontendMenusError(
        error.response?.data?.message || error.message || "Failed to fetch menus"
      )
    );
  }
};
