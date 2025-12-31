"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

const initialMenus = [
  {
    id: 1,
    name: 'Header Menu',
    locations: ['Header'],
    items: 4,
    visible: true,
  },
  {
    id: 2,
    name: 'Footer Menu',
    locations: ['Footer'],
    items: 11,
    visible: true,
  },
];

export default function MenuManagementPage() {
  const [menus] = useState(initialMenus);
  const [search, setSearch] = useState("");

  // Filter menus by search
  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Menus</h1>
            <p className="text-muted-foreground">View and manage navigation menus</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {}}>
            + New Menu
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Menus</CardTitle>
                <CardDescription>View and manage navigation menus</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  id="menu-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Enter Menu Name"
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.map((menu) => (
                  <TableRow key={menu.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium text-foreground">{menu.name}</TableCell>
                    <TableCell>
                      {menu.locations.map((loc) => (
                        <Badge key={loc} className=" px-2 py-0.5 rounded-full text-xs font-semibold mr-1">
                          {loc}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{menu.items}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          menu.visible
                            ? "bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold"
                            : "text-gray-300 bg-gray-700 px-4 py-1 rounded-full text-xs font-semibold"
                        }
                      >
                        {menu.visible ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination UI matching BlogCategories */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end px-4 py-3 text-sm text-muted-foreground gap-2">
              <div className="mb-2 sm:mb-0">
                <span className="text-xs text-muted-foreground">Page 1 of 2</span>
              </div>
              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition disabled:opacity-50" disabled>{'<'}</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold shadow" style={{background:'#FF7600'}} tabIndex={0}>1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition">{'>'}</button>
                </nav>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}