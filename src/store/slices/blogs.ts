import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "..";
import { service } from "@/services/_api_service";
import { toast } from '@/hooks/use-toast';

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  category_id?: string;
  image: string;
  description: string;
  estimated_reading_time: string;
  tags: string;
  faq: BlogFaq[];
  meta_author: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  status: "Draft" | "Published";
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

interface BlogsState {
  data: Blog[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
  status: "idle" | "loading" | "error";
  error: string | null;
  selectedBlog: Blog | null;
  selectedBlogLoading: boolean;
}

const initialState: BlogsState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  status: "idle",
  error: null,
  selectedBlog: null,
  selectedBlogLoading: false,
};

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setBlogs(state, action: PayloadAction<{ blogs: Blog[]; pagination: any }>) {
      state.data = action.payload.blogs;
      state.pagination = action.payload.pagination;
      state.status = "idle";
    },
    setBlogsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setBlogsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setSelectedBlog(state, action: PayloadAction<Blog | null>) {
      state.selectedBlog = action.payload;
    },
    setSelectedBlogLoading(state, action: PayloadAction<boolean>) {
      state.selectedBlogLoading = action.payload;
    },
  },
});

export const { setBlogs, setBlogsLoading, setBlogsError, setPage, setSelectedBlog, setSelectedBlogLoading } = blogsSlice.actions;

export default blogsSlice.reducer;

// Thunk to fetch blogs list
export const fetchBlogs = (page = 1, limit = 10, search = "") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogsLoading(true));
  const token = getState().auth.authToken;

  try {
    const response = await service.fetchBlogs(page, limit, token, search);
    const body = response.data;

    dispatch(
      setBlogs({
        blogs: body?.data ?? [],
          pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    console.error('[blogs] fetchBlogs error', error);
    const message = error?.response?.data?.message || error?.message || "Failed to load blogs";
    dispatch(setBlogsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    console.log('[blogs] fetchBlogs end');
    dispatch(setBlogsLoading(false));
  }
};

// Thunk: create blog
export const createBlogThunk = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogsLoading(true));
  const token = getState().auth.authToken;
  try {
    await service.createBlog(payload, token);
    toast({ title: 'Success', description: 'Blog created successfully', variant: 'success' });
    const { currentPage, perPage } = getState().blogs.pagination;
    dispatch(fetchBlogs(currentPage, perPage));
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create blog";
    dispatch(setBlogsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setBlogsLoading(false));
  }
};

// Thunk: update blog
export const updateBlogThunk = (payload: any) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogsLoading(true));
  const token = getState().auth.authToken;
  try {
    await service.updateBlog(payload, token);
    toast({ title: 'Success', description: 'Blog updated successfully', variant: 'success' });
    const { currentPage, perPage } = getState().blogs.pagination;
    dispatch(fetchBlogs(currentPage, perPage));
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update blog";
    dispatch(setBlogsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setBlogsLoading(false));
  }
};

// Thunk: delete blog
export const deleteBlogThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setBlogsLoading(true));
  const token = getState().auth.authToken;
  try {
    await service.deleteBlog(id, token);
    toast({ title: 'Success', description: 'Blog deleted successfully', variant: 'success' });
    const { currentPage, perPage } = getState().blogs.pagination;
    dispatch(fetchBlogs(currentPage, perPage));
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete blog";
    dispatch(setBlogsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setBlogsLoading(false));
  }
};

// Thunk: fetch blog details
export const fetchBlogDetailsThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setSelectedBlogLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchBlogDetails(id, token);
    const body = response.data;
    dispatch(setSelectedBlog(body?.data ?? null));
    return { success: body?.message, data: body?.data };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load blog details";
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setSelectedBlogLoading(false));
  }
};

// Selectors
export const selectBlogs = (state: RootState) => state.blogs.data;
export const selectBlogsPagination = (state: RootState) => state.blogs.pagination;
export const selectBlogsLoading = (state: RootState) => state.blogs.status === "loading";
export const selectBlogsError = (state: RootState) => state.blogs.error;
export const selectSelectedBlog = (state: RootState) => state.blogs.selectedBlog;
export const selectSelectedBlogLoading = (state: RootState) => state.blogs.selectedBlogLoading;
