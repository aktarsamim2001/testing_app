"use client";

import { use, useEffect } from 'react';
import SubscriptionBuilder from '@/page-components/admin/SubscriptionBuilder';
import { fetchSubscriptionDetailsThunk, selectSelectedSubscription, selectSelectedSubscriptionLoading } from '@/store/slices/subscriptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditSubscription({ params }: Props) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const editData = useAppSelector(selectSelectedSubscription);
  const isLoading = useAppSelector(selectSelectedSubscriptionLoading);

  useEffect(() => {
    dispatch(fetchSubscriptionDetailsThunk(id) as any);
  }, [dispatch, id]);

  return <SubscriptionBuilder subscriptionId={id} editData={editData} />;
}
