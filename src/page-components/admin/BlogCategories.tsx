"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchBlogCategories,
  deleteBlogCategoryThunk,
  createBlogCategoryThunk,
  updateBlogCategoryThunk,
  selectBlogCategories,
  selectBlogCategoriesLoading,
  selectBlogCategoriesPagination,
} from "@/store/slices/blog-categories";

interface BlogCategory {
  id: string;
  name: string;
  status: number;
}

export default function BlogCategoriesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  const blogCategories = useSelector(selectBlogCategories);
  const dataLoading = useSelector(selectBlogCategoriesLoading);
  const pagination = useSelector(selectBlogCategoriesPagination);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<BlogCategory | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState("1");

  const loadBlogCategories = useCallback(
    (page = 1, limit = 10, search = "") => {
      dispatch(fetchBlogCategories(page, limit, search));
    },
    [dispatch]
  );

  const validateForm = (): boolean => {
    const newErrors: typeof formErrors = {};

    if (!formName.trim()) {
      newErrors.name = "Category name is required.";
    } else if (formName.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters.";
    } else if (formName.trim().length > 100) {
      newErrors.name = "Category name must not exceed 100 characters.";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search]);

  useEffect(() => {
    if (user && isAdmin) {
      loadBlogCategories(page, perPage, debouncedSearch);
    }
  }, [user, isAdmin, loadBlogCategories, page, perPage, debouncedSearch]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [user, isAdmin, loading, router]);

  const handleDelete = useCallback(async () => {
    if (deletingCategory) {
      setIsDeleting(true);
      try {
        await dispatch(deleteBlogCategoryThunk(deletingCategory.id));
        setDeleteDialogOpen(false);
        setDeletingCategory(null);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [dispatch, deletingCategory]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update
        await dispatch(
          updateBlogCategoryThunk({
            id: editingCategory.id,
            name: formName,
            status: formStatus,
          })
        );
      } else {
        // Create
        await dispatch(
          createBlogCategoryThunk({
            name: formName,
            status: formStatus,
          })
        );
      }

      setFormName("");
      setFormStatus("1");
      setFormErrors({});
      setEditingCategory(null);
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, editingCategory, formName, formStatus]);

  const openDeleteDialog = useCallback((category: BlogCategory) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  }, []);

  const handleEdit = useCallback((category: BlogCategory) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormStatus(String(category.status));
    setDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingCategory(null);
    setFormName("");
    setFormStatus("1");
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormName("");
    setFormStatus("1");
    setFormErrors({});
  }, []);

  // Pagination handler


  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500";
      case 0:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 0:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader />
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog Categories</h1>
            <p className="text-muted-foreground">
              Manage your blog categories
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Blog Categories</CardTitle>
                <CardDescription>
                  View and manage blog categories
                </CardDescription>
              </div>
              <Input
                id="blog-category-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : blogCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No blog categories yet. Click "Add Category" to get started.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogCategories.map((category, idx) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {(pagination.currentPage - 1) * perPage + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(category.status)}>
                            {getStatusLabel(category.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(category)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Improved Pagination Controls */}
                {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-4">
                  {(() => {
                    const start = (pagination.currentPage - 1) * perPage + 1;
                    const end = start + blogCategories.length - 1;
                    const total =
                      typeof pagination.totalResults === "number" &&
                      pagination.totalResults >= 0
                        ? pagination.totalResults
                        : blogCategories.length;
                    return (
                      <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                        Showing {start} to {end} of {total} results
                      </span>
                    );
                  })()}
                  <nav
                    className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {(() => {
                      const pages = [];
                      const total = pagination.totalPages;
                      const current = pagination.currentPage;
                      if (total <= 5) {
                        for (let i = 1; i <= total; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (current <= 3) {
                          pages.push(1, 2, 3, 4, "...", total);
                        } else if (current >= total - 2) {
                          pages.push(
                            1,
                            "...",
                            total - 3,
                            total - 2,
                            total - 1,
                            total
                          );
                        } else {
                          pages.push(
                            1,
                            "...",
                            current - 1,
                            current,
                            current + 1,
                            "...",
                            total
                          );
                        }
                      }
                      return pages.map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={"ellipsis-" + idx}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === current ? "default" : "outline"}
                            size="sm"
                            className={
                              p === current ? "bg-orange-500 text-white" : ""
                            }
                            onClick={() => setPage(Number(p))}
                            aria-current={p === current ? "page" : undefined}
                          >
                            {p}
                          </Button>
                        )
                      );
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(pagination.totalPages, prev + 1)
                        )
                      }
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
                </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Blog Category" : "Create Blog Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">
                  Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Enter category name"
                  className="focus:ring-2 focus:ring-orange-500 mt-1"
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>
                )}
              </div>
              <div>
                <Label htmlFor="category-status">
                  Status<span className="text-red-500">*</span>
                </Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger
                    id="category-status"
                    className="focus:ring-2 focus:ring-orange-500 mt-1"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDialogClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingCategory ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingCategory ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Blog Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{deletingCategory?.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2 pt-4">
              <AlertDialogCancel asChild>
                <Button variant="outline" size="sm" onClick={closeDeleteDialog} disabled={isDeleting}>
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

