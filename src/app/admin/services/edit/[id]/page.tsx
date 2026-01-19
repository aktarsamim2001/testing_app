"use client";

import { use } from 'react';
import ServiceBuilder from '@/page-components/admin/ServiceBuilder';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditService({ params }: Props) {
  const { id } = use(params);
  return <ServiceBuilder pageId={id} />;
}
