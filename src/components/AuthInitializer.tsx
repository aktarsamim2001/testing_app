"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAuthState } from '@/hooks/useRedux';
import { initializeAuth } from '@/store/slices/auth';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const authState = useAuthState();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
  }, [authState]);

  return null;
}
