"use client"

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import MenuForm from '@/page-components/admin/MenuForm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const menuId = parseInt(id, 10);

  // initial menu data (would be fetched from API)
  const menuName = menuId === 1 ? 'Header Menu' : menuId === 2 ? 'Footer Menu' : 'New Menu';
  const initialVisibility = 'Active';

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader className="flex items-center justify-between">
            <div className="w-1/2">
              <label className="block text-sm font-medium">Menu Name</label>
              <Input value={menuName} readOnly className="mt-1" />
            </div>
            <div className="w-1/2 flex justify-end">
              <div className="w-48">
                <label className="block text-sm font-medium">Status</label>
                <Select defaultValue={initialVisibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <MenuForm mode="edit" menuId={menuId} hideVisibility />
      </div>
    </AdminLayout>
  );
}
