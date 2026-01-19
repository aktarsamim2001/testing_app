"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface MenuFormProps {
  mode: 'create' | 'edit';
  menuId?: number;
  hideVisibility?: boolean;
}

export default function MenuForm({ mode, menuId, hideVisibility }: MenuFormProps) {
  const router = useRouter();

  // Menu data - in real app, this would come from API
  const existingMenu = menuId === 1 ? {
    id: 1,
    name: 'Header Menu',
    location: 'Header',
    visible: true,
  } : menuId === 2 ? {
    id: 2,
    name: 'Footer Menu',
    location: 'Footer',
    visible: true,
  } : null;

  const [menuName, setMenuName] = useState(existingMenu?.name || '');
  const [location, setLocation] = useState(existingMenu?.location || 'Header');
  const [visible, setVisible] = useState(existingMenu?.visible ? 'Active' : 'Inactive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - API call would go here
    console.log({ menuName, location, visible });
    router.push('/admin/menu-management');
  };

  const title = mode === 'create' ? 'Create Menu' : 'Edit Menu';
  const subtitle = mode === 'create' ? 'Create a new navigation menu' : 'Edit this navigation menu';

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Details</CardTitle>
            <CardDescription>Fill in the menu details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Menu Name</label>
                  <Input
                    placeholder="e.g., Header Menu, Footer Menu"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Header">Header</SelectItem>
                      <SelectItem value="Footer">Footer</SelectItem>
                      <SelectItem value="Sidebar">Sidebar</SelectItem>
                      <SelectItem value="Top">Top</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!hideVisibility && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Visibility Status</label>
                    <Select value={visible} onValueChange={setVisible}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {mode === 'create' ? 'Create Menu' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/menu-management')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
