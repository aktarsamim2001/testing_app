import BrandLayout from '@/components/brand/BrandLayout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <BrandLayout>{children}</BrandLayout>;
}

