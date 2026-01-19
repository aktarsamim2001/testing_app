import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFrontendMenus } from "@/store/slices/frontendMenus";
import type { RootState, AppDispatch } from "@/store";

export function useFrontendMenus() {
  const dispatch = useDispatch<AppDispatch>();
  const { headerMenu, footerMenu, status, error } = useSelector(
    (state: RootState) => state.frontendMenus
  );

  useEffect(() => {
    // Only fetch if menus are not already loaded
    if (status === "idle") {
      dispatch(fetchFrontendMenus());
    }
  }, [dispatch, status]);

  return {
    headerMenu,
    footerMenu,
    status,
    error,
    isLoading: status === "loading",
    isError: status === "failed",
  };
}
