"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function BlogCategoriesPage() {

  const [categories, setCategories] = useState([
    { id: 1, title: "Tech", status: "active" },
    { id: 2, title: "Lifestyle", status: "inactive" },
    { id: 3, title: "Business", status: "active" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleCreate = () => {
    if (newTitle.trim()) {
      setCategories([
        ...categories,
        { id: categories.length + 1, title: newTitle, status: newStatus },
      ]);
      setNewTitle("");
      setNewStatus("active");
      setOpen(false);
    }
  };

  const handleCreateAndAnother = () => {
    if (newTitle.trim()) {
      setCategories([
        ...categories,
        { id: categories.length + 1, title: newTitle, status: newStatus },
      ]);
      setNewTitle("");
      setNewStatus("active");
    }
  };

  // Filter categories by search
  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">View and manage blog categories</p>
          </div>
          <Button 
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>View and manage blog categories</CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  id="category-title"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Enter Category Name"
                  className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                />
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Blog Category</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                      <Label htmlFor="category-title-dialog" className="mb-1">
                        Title<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="category-title-dialog"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Enter category title"
                        className="focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="py-2">
                      <Label htmlFor="category-status-dialog" className="mb-1">
                        Status<span className="text-red-500">*</span>
                      </Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="category-status-dialog" className="w-full focus:ring-2 focus:ring-orange-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter className="mt-4 flex-row gap-2 justify-start">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreate}>Create</Button>

                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium text-foreground">{cat.title}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          cat.status === "active"
                            ? "bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold"
                            : "text-gray-300 bg-gray-700 px-4 py-1 rounded-full text-xs font-semibold"
                        }
                      >
                        {cat.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">2025-08-11 09:25:05</TableCell>
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
            {/* Pagination UI matching screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end px-4 py-3 text-sm text-muted-foreground gap-2">
              <div className="mb-2 sm:mb-0">
                <span className="text-xs text-muted-foreground">Page 1 of 2 </span>
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
