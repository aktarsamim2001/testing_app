/**
 * Redux Provider Component
 * Wraps the application with Redux store provider
 * Use this at the root layout
 */

"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
