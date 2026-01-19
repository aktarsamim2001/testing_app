"use client";

import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function MenuEdit({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit Menu</h1>
            <p className="text-sm text-muted-foreground">Edit menu and its items</p>
          </div>
          <Link href="/admin/menu-management">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Menu</CardTitle>
            <CardDescription>Modify menu details and items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Menu Name</label>
                <Input defaultValue={`Footer Menu ${params?.id ?? ''}`} />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Visibility Status</label>
                <Input defaultValue="Active" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.back()}>Save changes</Button>
                <Link href="/admin/menu-management">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
