
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "..";
import { service } from "@/services/_api_service";
import { toast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  status: number;
}

interface CategoryState {
  data: Category[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
  status: "idle" | "loading" | "error";
  error: string | null;
  selectedCategory: Category | null;
  selectedCategoryLoading: boolean;
}

const initialState: CategoryState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  status: "idle",
  error: null,
  selectedCategory: null,
  selectedCategoryLoading: false,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<{ categories: Category[]; pagination: any }>) {
      state.data = action.payload.categories;
      state.pagination = action.payload.pagination;
      state.status = "idle";
    },
    setCategoriesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setCategoriesError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    setCategoryPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<Category | null>) {
      state.selectedCategory = action.payload;
    },
    setSelectedCategoryLoading(state, action: PayloadAction<boolean>) {
      state.selectedCategoryLoading = action.payload;
    },
  },
});

export const { setCategories, setCategoriesLoading, setCategoriesError, setCategoryPage, setSelectedCategory, setSelectedCategoryLoading } = categorySlice.actions;

export default categorySlice.reducer;

// Thunk to fetch categories list
export const fetchCategories = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchCategories(page, limit, token, search);
    const body = response.data;
    dispatch(
      setCategories({
        categories: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load categories";
    dispatch(setCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCategoriesLoading(false));
  }
};

// Thunk to fetch single category details
export const fetchCategoryDetailsThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setSelectedCategoryLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchCategoryDetails(id, token);
    const body = response.data;
    dispatch(setSelectedCategory(body?.data ?? null));
    return { success: body?.message, data: body?.data };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load category details";
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setSelectedCategoryLoading(false));
  }
};

// Thunk: create category
export const createCategoryThunk = (payload: { name: string; status: string | number }) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createCategory(payload, token);
    const { currentPage, perPage } = getState().categories.pagination;
    dispatch(fetchCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create category";
    dispatch(setCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCategoriesLoading(false));
  }
};

// Thunk: update category
export const updateCategoryThunk = (payload: { id: string; name: string; status: string | number }) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateCategory(payload, token);
    const { currentPage, perPage } = getState().categories.pagination;
    dispatch(fetchCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update category";
    dispatch(setCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCategoriesLoading(false));
  }
};

// Thunk: delete category
export const deleteCategoryThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteCategory(id, token);
    const { currentPage, perPage } = getState().categories.pagination;
    dispatch(fetchCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete category";
    dispatch(setCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setCategoriesLoading(false));
  }
};

// Selectors
export const selectCategories = (state: RootState) => state.categories.data;
export const selectCategoriesPagination = (state: RootState) => state.categories.pagination;
export const selectCategoriesLoading = (state: RootState) => state.categories.status === "loading";
export const selectCategoriesError = (state: RootState) => state.categories.error;
export const selectSelectedCategory = (state: RootState) => state.categories.selectedCategory;
export const selectSelectedCategoryLoading = (state: RootState) => state.categories.selectedCategoryLoading;
