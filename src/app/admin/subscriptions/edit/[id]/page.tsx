"use client";

import { use, useEffect, useState } from 'react';
import SubscriptionBuilder from '@/page-components/admin/SubscriptionBuilder';
import { fetchSubscriptions } from '@/store/slices/subscriptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { selectSubscriptions } from '@/store/slices/subscriptions';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditSubscription({ params }: Props) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const subscriptions = useAppSelector(selectSubscriptions);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchSubscriptions(1, 100, '') as any);
  }, [dispatch]);

  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions.find((sub: any) => String(sub.id) === String(id));
      setEditData(subscription || null);
    }
  }, [subscriptions, id]);

  return <SubscriptionBuilder subscriptionId={id} editData={editData} />;
}
