"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAuthState } from '@/hooks/useRedux';
import { initializeAuth } from '@/store/slices/auth';

export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const authState = useAuthState();

  useEffect(() => {
    console.log('AuthInitializer: dispatch initializeAuth');
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    console.log('Auth state after init', authState);
  }, [authState]);

  return null;
}
