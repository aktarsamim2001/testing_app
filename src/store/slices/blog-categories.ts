import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { service, BlogCategory } from "@/services/_api_service";
import type { AppDispatch, RootState } from "@/store";
import { toast } from '@/hooks/use-toast';

type Status = "idle" | "loading" | "succeeded" | "failed";

interface PaginationState {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
  totalResults: number;
}

interface BlogCategoriesState {
  data: BlogCategory[];
  pagination: PaginationState;
  status: Status;
  error: string | null;
}

const initialState: BlogCategoriesState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
    totalRecords: 0,
    totalResults: 0,
  },
  status: "idle",
  error: null,
};

const blogCategoriesSlice = createSlice({
  name: "blogCategories",
  initialState,
  reducers: {
    setBlogCategories(state, action: PayloadAction<{ blogCategories: BlogCategory[]; pagination: PaginationState }>) {
      state.data = action.payload.blogCategories;
      state.pagination = action.payload.pagination;
      state.status = "succeeded";
      state.error = null;
    },
    setBlogCategoriesLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setBlogCategoriesError(state, action: PayloadAction<string | null>) {
      state.status = "failed";
      state.error = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
  },
});

export const { setBlogCategories, setBlogCategoriesLoading, setBlogCategoriesError, setPage } = blogCategoriesSlice.actions;

export default blogCategoriesSlice.reducer;

// Thunk to fetch blog categories list
export const fetchBlogCategories = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchBlogCategories(page, limit, token, search);
    const body = response.data;
    dispatch(
      setBlogCategories({
        blogCategories: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
          totalResults: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
    return { success: body?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load blog categories";
    dispatch(setBlogCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setBlogCategoriesLoading(false));
  }
};

// Thunk: create blog category
export const createBlogCategoryThunk = (payload: {
  name: string;
  status?: number | string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createBlogCategory({
      name: payload.name,
      status: payload.status ?? 1,
    }, token);
    const { currentPage, perPage } = getState().blogCategories.pagination;
    dispatch(fetchBlogCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create blog category";
    dispatch(setBlogCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setBlogCategoriesLoading(false));
  }
};

// Thunk: update blog category
export const updateBlogCategoryThunk = (payload: {
  id: string;
  name: string;
  status?: number | string;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateBlogCategory({
      id: payload.id,
      name: payload.name,
      status: payload.status ?? 1,
    }, token);
    const { currentPage, perPage } = getState().blogCategories.pagination;
    dispatch(fetchBlogCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update blog category";
    dispatch(setBlogCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setBlogCategoriesLoading(false));
  }
};

// Thunk: delete blog category
export const deleteBlogCategoryThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogCategoriesLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteBlogCategory(id, token);
    const { currentPage, perPage } = getState().blogCategories.pagination;
    dispatch(fetchBlogCategories(currentPage, perPage));
    if (response?.data?.message) {
      toast({ title: 'Success', description: response.data.message, variant: 'success' });
    }
    return { success: response?.data?.message };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete blog category";
    dispatch(setBlogCategoriesError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setBlogCategoriesLoading(false));
  }
};

// Selectors
export const selectBlogCategories = (state: RootState) => state.blogCategories.data;
export const selectBlogCategoriesPagination = (state: RootState) => state.blogCategories.pagination;
export const selectBlogCategoriesLoading = (state: RootState) => state.blogCategories.status === "loading";
export const selectBlogCategoriesError = (state: RootState) => state.blogCategories.error;
