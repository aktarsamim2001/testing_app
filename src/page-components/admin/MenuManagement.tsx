"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMenus, selectMenus, selectMenusLoading } from '@/store/slices/menus';
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
import { useRouter } from 'next/navigation';

export default function MenuManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const menus = useAppSelector(selectMenus);
  const menusLoading = useAppSelector(selectMenusLoading);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchMenus());
  }, [dispatch]);

  // Filter menus by search
  const filteredMenus = (menus ?? []).filter((menu: any) =>
    String(menu.menu_name || menu.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Menus</h1>
            <p className="text-muted-foreground">View and manage navigation menus</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Menus</CardTitle>
                <CardDescription>View and manage navigation menus</CardDescription>
              </div>
                {/* <Input
                  id="menu-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search"
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                /> */}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Menu Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.map((menu: any) => (
                  <TableRow key={menu.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium text-foreground">{menu.id}</TableCell>
                    <TableCell>
                      {/* API doesn't provide locations in screenshot; show id as badge */}
                      <Badge className=" px-2 py-0.5 rounded-full text-xs font-semibold mr-1">{menu.menu_name}</Badge>
                    </TableCell>
                    {/* <TableCell className="text-muted-foreground text-sm">{menu.items ?? 0}</TableCell> */}
                    <TableCell>
                      <Badge
                        className={
                          (menu.status === 1)
                            ? "bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold"
                            : "text-gray-300 bg-gray-700 px-4 py-1 rounded-full text-xs font-semibold"
                        }
                      >
                        {(menu.status === 1) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/menu-management/${menu.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Responsive Pagination UI */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 text-sm text-muted-foreground gap-2">
              <div className="mb-2 sm:mb-0 w-full sm:w-auto text-center sm:text-left">
                <span className="text-xs text-muted-foreground">Page 1 of 2</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition disabled:opacity-50" disabled>{'<'}</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold shadow" style={{background:'#FF7600'}} tabIndex={0}>1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition">{'>'}</button>
                </nav>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}