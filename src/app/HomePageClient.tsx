"use client";


import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { fetchCMSPage } from "@/store/slices/cmsPage";

// Import page components
import Home from "@/page-components/Home";
import NotFound from "./not-found";

const HomePageClient = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, status } = useSelector(
    (state: RootState) => state.cmsPage
  );

  // Fetch home page data on mount
  useEffect(() => {
    dispatch(fetchCMSPage("home"));
  }, [dispatch]);

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state - show NotFound
  if (error || status === "failed") {
    return <NotFound />;
  }

  // No data - show fallback instead of NotFound
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Page Data</h1>
          <p className="text-muted-foreground">The page data could not be retrieved</p>
        </div>
      </div>
    );
  }

  return <Home data={data} />;
};

export default HomePageClient;
