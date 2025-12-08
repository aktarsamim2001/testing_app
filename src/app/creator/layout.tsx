import CreatorLayout from '@/components/creator/CreatorLayout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <CreatorLayout>{children}</CreatorLayout>;
}

