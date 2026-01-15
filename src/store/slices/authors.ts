import { toast } from '@/hooks/use-toast';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "..";
import { service } from "@/services/_api_service";


export interface Author {
  id: string;
  name: string;
  image: string;
  about: string | null;
  status?: number;
}

interface AuthorsState {
  data: Author[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
  status: "idle" | "loading" | "error";
  error: string | null;
  selectedAuthor: Author | null;
  selectedAuthorLoading: boolean;
}

const initialState: AuthorsState = {
  data: [],
  pagination: {
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  status: "idle",
  error: null,
  selectedAuthor: null,
  selectedAuthorLoading: false,
};

const authorsSlice = createSlice({
  name: "authors",
  initialState,
  reducers: {
    setAuthors(state, action: PayloadAction<{ authors: Author[]; pagination: any }>) {
      state.data = action.payload.authors;
      state.pagination = action.payload.pagination;
      state.status = "idle";
    },
    setAuthorsLoading(state, action: PayloadAction<boolean>) {
      state.status = action.payload ? "loading" : "idle";
    },
    setAuthorsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "error";
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setSelectedAuthor(state, action: PayloadAction<Author | null>) {
      state.selectedAuthor = action.payload;
    },
    setSelectedAuthorLoading(state, action: PayloadAction<boolean>) {
      state.selectedAuthorLoading = action.payload;
    },
  },
});

export const { setAuthors, setAuthorsLoading, setAuthorsError, setPage, setSelectedAuthor, setSelectedAuthorLoading } = authorsSlice.actions;

export default authorsSlice.reducer;

// Thunk to fetch authors list
export const fetchAuthors = (page = 1, limit = 10, search="") => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setAuthorsLoading(true));
  const token = getState().auth.authToken;

  try {
    const response = await service.fetchAuthors(page, limit, token, search);
    const body = response.data;

    dispatch(
      setAuthors({
        authors: body?.data ?? [],
        pagination: {
          currentPage: body?.pagination?.current_page ?? page,
          perPage: body?.pagination?.per_page ?? limit,
          totalPages: body?.pagination?.total_pages ?? 1,
          totalRecords: body?.pagination?.total_records ?? body?.data?.length ?? 0,
        },
      })
    );
  } catch (error: any) {
    console.error('[authors] fetchAuthors error', error);
    const message = error?.response?.data?.message || error?.message || "Failed to load authors";
    dispatch(setAuthorsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setAuthorsLoading(false));
  }
};

// Thunk: create author
export const createAuthorThunk = (payload: { 
  name: string; 
  image: string;  // S3 URL
  about?: string | null;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setAuthorsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.createAuthor(payload, token);
    const apiMessage = response?.data?.message || "Author created successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().authors.pagination;
    dispatch(fetchAuthors(currentPage, perPage));
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to create author";
    dispatch(setAuthorsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setAuthorsLoading(false));
  }
};

// Thunk: update author
export const updateAuthorThunk = (payload: {
  id: string;
  name: string;
  image?: string;  // S3 URL (optional for update)
  about?: string | null;
}) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setAuthorsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.updateAuthor(payload, token);
    const apiMessage = response?.data?.message || "Author updated successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().authors.pagination;
    dispatch(fetchAuthors(currentPage, perPage));
    return { success: apiMessage };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to update author";
    dispatch(setAuthorsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setAuthorsLoading(false));
  }
};

// Thunk: delete author
export const deleteAuthorThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setAuthorsLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.deleteAuthor(id, token);
    const apiMessage = response?.data?.message || "Author deleted successfully";
    toast({ title: 'Success', description: apiMessage, variant: 'success' });
    const { currentPage, perPage } = getState().authors.pagination;
    dispatch(fetchAuthors(currentPage, perPage));
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to delete author";
    dispatch(setAuthorsError(message));
    toast({ title: 'Error', description: message, variant: 'destructive' });
  } finally {
    dispatch(setAuthorsLoading(false));
  }
};

// Thunk to fetch single author details
export const fetchAuthorDetailsThunk = (id: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setSelectedAuthorLoading(true));
  const token = getState().auth.authToken;
  try {
    const response = await service.fetchAuthorDetails(id, token);
    const body = response.data;
    dispatch(setSelectedAuthor(body?.data ?? null));
    return { success: body?.message, data: body?.data };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to load author details";
    toast({ title: 'Error', description: message, variant: 'destructive' });
    return { error: message };
  } finally {
    dispatch(setSelectedAuthorLoading(false));
  }
};

// Selectors
export const selectAuthors = (state: RootState) => state.authors.data;
export const selectAuthorsPagination = (state: RootState) => state.authors.pagination;
export const selectAuthorsLoading = (state: RootState) => state.authors.status === "loading";
export const selectAuthorsError = (state: RootState) => state.authors.error;
export const selectSelectedAuthor = (state: RootState) => state.authors.selectedAuthor;
export const selectSelectedAuthorLoading = (state: RootState) => state.authors.selectedAuthorLoading;
