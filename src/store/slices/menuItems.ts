import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { service } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";
import { toast } from "@/hooks/use-toast";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface MenuItem {
  id: string | number;
  menu_id: string | number;
  type: string;
  title: string;
  slug?: string;
  url?: string;
  target_set?: string;
  status: number;
}

interface MenuItemsState {
  data: MenuItem[];
  status: Status;
  error: string | null;
  currentMenuId: string | number | null;
}

const initialState: MenuItemsState = {
  data: [],
  status: "idle",
  error: null,
  currentMenuId: null,
};

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
}

interface MenuItemsStateWithPagination extends MenuItemsState {
  pagination: PaginationState;
}

const defaultPagination: PaginationState = {
  currentPage: 1,
  perPage: 10,
  totalPages: 1,
  totalRecords: 0,
};

const initialStateWithPagination: MenuItemsStateWithPagination = {
  ...initialState,
  pagination: defaultPagination,
};

const menuItemsSlice = createSlice({
  name: "menuItems",
  initialState: initialStateWithPagination as any,
  reducers: {
    setMenuItems(state, action: PayloadAction<{ items: MenuItem[]; pagination: PaginationState }>) {
      state.data = action.payload.items;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setMenuItemsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setMenuItemsError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setCurrentMenuId(state, action: PayloadAction<string | number | null>) {
      state.currentMenuId = action.payload;
    },
    setMenuItemsPageNumber(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setMenuItemsPerPage(state, action: PayloadAction<number>) {
      state.pagination.perPage = action.payload;
    },
    reorderMenuItems(state, action: PayloadAction<MenuItem[]>) {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle menuItemDetails state using addMatcher for string action types
    builder.addMatcher(
      (action): action is { type: string; payload: any } => action.type === 'menuItemDetails/setMenuItemDetails',
      (state: any, action) => {
        if (!state.menuItemDetails) {
          state.menuItemDetails = { data: null, status: 'idle', error: null };
        }
        state.menuItemDetails.data = action.payload;
        state.menuItemDetails.status = 'succeeded';
      }
    );
    builder.addMatcher(
      (action): action is { type: string; payload: any } => action.type === 'menuItemDetails/setMenuItemDetailsLoading',
      (state: any, action) => {
        if (!state.menuItemDetails) {
          state.menuItemDetails = { data: null, status: 'idle', error: null };
        }
        state.menuItemDetails.status = action.payload ? 'loading' : 'idle';
      }
    );
    builder.addMatcher(
      (action): action is { type: string; payload: any } => action.type === 'menuItemDetails/setMenuItemDetailsError',
      (state: any, action) => {
        if (!state.menuItemDetails) {
          state.menuItemDetails = { data: null, status: 'idle', error: null };
        }
        state.menuItemDetails.error = action.payload;
        state.menuItemDetails.status = 'failed';
      }
    );
  },
});

export const { setMenuItems, setMenuItemsLoading, setMenuItemsError, setCurrentMenuId, setMenuItemsPageNumber, setMenuItemsPerPage, reorderMenuItems: reorderMenuItemsAction } = menuItemsSlice.actions;

// Action creators for menu item details (manually created since they're in extraReducers)
export const setMenuItemDetails = (data: any) => ({ type: 'menuItemDetails/setMenuItemDetails', payload: data });
export const setMenuItemDetailsLoading = (loading: boolean) => ({ type: 'menuItemDetails/setMenuItemDetailsLoading', payload: loading });
export const setMenuItemDetailsError = (error: string | null) => ({ type: 'menuItemDetails/setMenuItemDetailsError', payload: error });

export default menuItemsSlice.reducer;

// Thunk to fetch menu items by menu_id
export const fetchMenuItems = (menuId: string | number, page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenuItemsLoading(true));
  dispatch(setCurrentMenuId(menuId));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchMenuItems(menuId, page, limit, token, search);
    const body = response.data;
    // API may return pagination meta; map to our shape
    const pagination: PaginationState = {
      currentPage: body?.pagination?.current_page ?? page,
      perPage: body?.pagination?.per_page ?? limit,
      totalPages: body?.pagination?.total_pages ?? 1,
      totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
    };
    dispatch(setMenuItems({ items: body?.data ?? [], pagination }));
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load menu items";
    dispatch(setMenuItemsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenuItemsLoading(false));
  }
};

// Thunk to create menu item
export const createMenuItemThunk = (payload: { menu_id: string | number; type: string; title: string; slug?: string; url?: string; target_set?: string; status: string | number }) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenuItemsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createMenuItem(payload, token);
    const body = response.data;
    // refresh list
    const currentMenuId = getState().menuItems.currentMenuId;
    if (currentMenuId) {
      dispatch(fetchMenuItems(currentMenuId));
    }
    if (body?.message) {
      toast({ title: 'Success', description: body.message, variant: 'success' });
    }
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create menu item";
    dispatch(setMenuItemsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenuItemsLoading(false));
  }
};

// Thunk to update menu item
export const updateMenuItemThunk = (payload: { id: string | number; type?: string; title?: string; slug?: string; url?: string; target_set?: string; status?: string | number }) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenuItemsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateMenuItem(payload, token);
    const body = response.data;
    // refresh list
    const currentMenuId = getState().menuItems.currentMenuId;
    if (currentMenuId) {
      dispatch(fetchMenuItems(currentMenuId));
    }
    if (body?.message) {
      toast({ title: 'Success', description: body.message, variant: 'success' });
    }
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update menu item";
    dispatch(setMenuItemsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenuItemsLoading(false));
  }
};

// Thunk to delete menu item
export const deleteMenuItemThunk = (id: string | number) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenuItemsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteMenuItem(id, token);
    const body = response.data;
    // refresh list
    const currentMenuId = getState().menuItems.currentMenuId;
    if (currentMenuId) {
      dispatch(fetchMenuItems(currentMenuId));
    }
    if (body?.message) {
      toast({ title: 'Success', description: body.message, variant: 'success' });
    }
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete menu item";
    dispatch(setMenuItemsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenuItemsLoading(false));
  }
};

// Thunk to reorder menu items
export const reorderMenuItemsThunk = (itemIds: Array<string | number>) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const token = getState().auth.authToken;
  const currentState = getState().menuItems;
  const currentItems = currentState.data;
  
  try {
    // Create reordered items array based on the new order of IDs
    const reorderedItems = itemIds
      .map((id) => currentItems.find((item: MenuItem) => item.id === id))
      .filter((item): item is MenuItem => item !== undefined);

    // Immediately update local state with new order (optimistic update)
    dispatch(reorderMenuItemsAction(reorderedItems));

    console.log('Sending reorder with item_id:', itemIds);

    // Call API with simple item_id array format
    // The array order itself represents the new position: [2, 1] means item 2 is first, item 1 is second
    const response = await service.reorderMenuItems({ item_id: itemIds }, token);
    const body = response.data;

    if (body?.message) {
      toast({ title: 'Success', description: body.message, variant: 'success' });
    }
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to reorder menu items";
    dispatch(setMenuItemsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    // Refresh list to show previous valid state on error
    const currentMenuId = getState().menuItems.currentMenuId;
    if (currentMenuId) {
      dispatch(fetchMenuItems(currentMenuId));
    }
    return { error: message };
  }
};

// Selectors
export const selectMenuItems = (state: RootState) => state.menuItems.data;
export const selectMenuItemsLoading = (state: RootState) => state.menuItems.status === "loading";
export const selectCurrentMenuId = (state: RootState) => state.menuItems.currentMenuId;
export const selectMenuItemsPagination = (state: RootState) => (state.menuItems as any).pagination as PaginationState;

// Thunk to fetch menu item details
export const fetchMenuItemDetailsThunk = (id: string | number) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setMenuItemDetailsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchMenuItemDetails(id, token);
    const body = response.data;
    
    // Handle the response data - API returns data object or the item directly
    const itemData = body?.data || body;
    
    dispatch(setMenuItemDetails(itemData));
    return { success: true, data: itemData };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load menu item details";
    dispatch(setMenuItemDetailsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setMenuItemDetailsLoading(false));
  }
};

// Details Selectors
export const selectMenuItemDetails = (state: RootState) => (state as any).menuItemDetails?.data ?? null;
export const selectMenuItemDetailsLoading = (state: RootState) => (state as any).menuItemDetails?.status === "loading";
export const selectMenuItemDetailsError = (state: RootState) => (state as any).menuItemDetails?.error;