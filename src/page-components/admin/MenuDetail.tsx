"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchMenuItems,
  selectMenuItems,
  selectMenuItemsLoading,
  selectMenuItemsPagination,
  createMenuItemThunk,
  updateMenuItemThunk,
  deleteMenuItemThunk,
  reorderMenuItemsThunk,
  setMenuItemsPageNumber,
} from "@/store/slices/menuItems";
import { fetchMenus, selectMenus, updateMenuThunk } from "@/store/slices/menus";
import { fetchPages, selectPages } from "@/store/slices/pages";

interface MenuDetailPageProps {
  menuId?: number;
}

export default function MenuDetailPage({ menuId }: MenuDetailPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxMenuItems = useAppSelector(selectMenuItems);
  const itemsLoading = useAppSelector(selectMenuItemsLoading);
  const reduxMenus = useAppSelector(selectMenus);
  const reduxPages = useAppSelector(selectPages);

  // Local state
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menu, setMenu] = useState<any>({
    id: menuId,
    menu_name: "",
    status: 1,
  });
  const [editingMenuName, setEditingMenuName] = useState<string>("");

  // Dialog states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("page");
  const [newTarget, setNewTarget] = useState("_self");
  const [newPageId, setNewPageId] = useState("");
  const [newStatus, setNewStatus] = useState("1");
  const [newCustomValue, setNewCustomValue] = useState("");
  
  const [editType, setEditType] = useState("page");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editPageId, setEditPageId] = useState("");
  const [editStatus, setEditStatus] = useState("1");
  const [editCustomValue, setEditCustomValue] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search + pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pagination = useAppSelector(selectMenuItemsPagination);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Fetch menus on mount
  useEffect(() => {
    if (menuId) {
      dispatch(fetchMenus());
    }
  }, [menuId, dispatch]);

  // Update menu state
  useEffect(() => {
    if (reduxMenus && reduxMenus.length > 0) {
      const foundMenu = reduxMenus.find(
        (m: any) => String(m.id) === String(menuId)
      );
      if (foundMenu) {
        setMenu(foundMenu);
        setEditingMenuName(foundMenu.menu_name);
      }
    }
  }, [reduxMenus, menuId]);

  // Sync with Redux
  useEffect(() => {
    setMenuItems((reduxMenuItems as any[]) || []);
  }, [reduxMenuItems]);

  // Debounce search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      dispatch(setMenuItemsPageNumber(1));
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm, dispatch]);

  // Fetch menu items
  useEffect(() => {
    if (menuId) {
      const page = pagination?.currentPage ?? 1;
      const perPage = pagination?.perPage ?? 10;
      dispatch(fetchMenuItems(menuId, page, perPage, debouncedSearch) as any);
    }
  }, [menuId, dispatch, pagination?.currentPage, pagination?.perPage, debouncedSearch]);

  const handleCreateSave = async () => {
    // Validate form before submitting
    if (!validateDialogForm()) return false;

    const payload: any = {
      menu_id: String(menuId || 1),
      type: newType,
      title: newTitle.trim(),
      target_set: newTarget,
      status: newStatus,
    };

    if (newType === "page" && newPageId) {
      payload.slug = String(newPageId);
    }

    await dispatch(createMenuItemThunk(payload) as any);

    // Reset
    setNewTitle("");
    setNewType("page");
    setNewTarget("_self");
    setNewPageId("");
    setNewStatus("1");
    setNewCustomValue("");
    setErrors({});
    return true;
  };

  const handleDeleteItem = (id: string | number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete == null) return;
    await dispatch(deleteMenuItemThunk(itemToDelete) as any);
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditTarget(item.target_set || "_self");
    setEditType(item.type || "page");
    setEditPageId(item.slug || "");
    setEditStatus(item.status === 0 || item.status === "0" ? "0" : "1");
    setEditCustomValue(item.custom_value || "");
    dispatch(fetchPages(1, 100) as any);
    setDialogMode("edit");
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!validateDialogForm()) return false;

    const payload: any = {
      id: editingItem.id,
      menu_id: String(editingItem.menu_id || menuId || 1),
      title: editTitle.trim(),
      target_set: editTarget,
      type: editType,
      status: editStatus,
    };

    if (editType === "page" && editPageId) {
      payload.slug = String(editPageId);
    }

    await dispatch(updateMenuItemThunk(payload) as any);
    setEditingItem(null);
    setErrors({});
    return true;
  };

  const validateDialogForm = () => {
    const errs: Record<string, string> = {};
    const type = dialogMode === "create" ? newType : editType;
    const title = dialogMode === "create" ? newTitle.trim() : editTitle.trim();

    const target = dialogMode === "create" ? newTarget : editTarget;
    const status = dialogMode === "create" ? newStatus : editStatus;

    if (!title) errs.title = "Title is required";

    if (!type) errs.type = "Type is required";

    if (!target) errs.target = "Target is required";
    if (!status) errs.status = "Status is required";

    if (type === "page") {
      const pageId = dialogMode === "create" ? newPageId : editPageId;
      if (!pageId) errs.page = "Please select a page";
    } else {
      const custom = dialogMode === "create" ? newCustomValue.trim() : editCustomValue.trim();
      if (!custom) errs.custom = "URL is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const dragIndex = menuItems.findIndex((item) => item.id === draggedItem.id);
    if (dragIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...menuItems];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    setMenuItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

const handleSaveOrder = async () => {
    // Pass just the ordered array of IDs
    const orderedIds = menuItems.map((item) => item.id);
    await dispatch(reorderMenuItemsThunk(orderedIds) as any);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {menu.menu_name || menu.name || "Menu"}
            </h1>
            <p className="text-muted-foreground">
              Manage menu items for {menu.menu_name || menu.name || "Menu"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Drag & Drop Reorder Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Items Configuration</CardTitle>
              <CardDescription>Drag to reorder menu items</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={handleSaveOrder}
            >
              Save
            </Button>
          </CardHeader>
          <CardContent>
            {menuItems && menuItems.length > 0 ? (
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-move transition-all ${
                      dragOverIndex === index ? "border-blue-500 border-2" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No menu items to reorder. Create items first.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Menu Name</label>
                <Input
                  value={editingMenuName}
                  onChange={(e) => setEditingMenuName(e.target.value)}
                  placeholder="Enter menu name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={menu.status === 1 ? "Active" : "Inactive"}
                  onValueChange={(v) => {
                    setMenu({ ...menu, status: v === "Active" ? 1 : 0 });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 ">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 text-white"
                onClick={async () => {
                  if (editingMenuName.trim()) {
                    await dispatch(
                      updateMenuThunk({
                        id: menu.id,
                        menu_name: editingMenuName.trim(),
                        status: menu.status,
                      }) as any
                    );
                    setMenu({ ...menu, menu_name: editingMenuName.trim() });
                  }
                }}
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Menu Items</h2>
            <Button
              className="bg-orange-500 text-white"
              onClick={() => {
                setDialogMode("create");
                setNewPageId("");
                setNewCustomValue("");
                setNewTitle("");
                setNewType("page");
                setNewTarget("_self");
                dispatch(fetchPages(1, 10) as any);
                setErrors({});
                setDialogOpen(true);
              }}
            >
              + Create
            </Button>
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
              <div>
                <CardTitle>Lists</CardTitle>
                <CardDescription>View and manage menu items</CardDescription>
              </div>
              <Input
                type="text"
                placeholder="Search menu items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
              />
            </div>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sl No</TableHead>
                    <TableHead>Menu Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems && menuItems.length > 0 ? (
                    menuItems.map((mi, idx) => (
                      <TableRow key={mi.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{mi.title}</TableCell>
                        <TableCell>{mi.type}</TableCell>
                        <TableCell>{mi.target_set || "--"}</TableCell>
                        <TableCell>
                          <Badge className={mi.status === 1 ? "bg-green-600" : "bg-gray-600"}>
                            {mi.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEditItem(mi)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(mi.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {itemsLoading ? "Loading..." : "No menu items yet. Click '+ Create' to add one."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-2 sm:gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.totalRecords || 0)} of{" "}
                {pagination.totalRecords || 0} results
              </span>
              <nav className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => dispatch(setMenuItemsPageNumber(pagination.currentPage - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {/* Page numbers logic here */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => dispatch(setMenuItemsPageNumber(pagination.currentPage + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Add Menu Items" : "Edit Menu Item"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "Select existing pages or create a new menu item." : "Modify title and target"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Title <span className="text-red-600">*</span></label>
                <Input
                  value={dialogMode === "create" ? newTitle : editTitle}
                  onChange={(e) => {
                    (dialogMode === "create" ? setNewTitle(e.target.value) : setEditTitle(e.target.value));
                    setErrors({});
                  }}
                  placeholder="Write here"
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Type <span className="text-red-600">*</span></label>
                <Select
                  value={dialogMode === "create" ? newType : editType}
                  onValueChange={(v) => {
                    if (dialogMode === "create") setNewType(v);
                    else setEditType(v);
                    setErrors({});
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{(dialogMode === "create" ? newType : editType) === "page" ? "Page" : "Custom url"} <span className="text-red-600">*</span></label>
                {(dialogMode === "create" ? newType : editType) === "page" ? (
                  <Select
                    value={dialogMode === "create" ? newPageId : editPageId}
                    onValueChange={(v) => {
                      (dialogMode === "create" ? setNewPageId(v) : setEditPageId(v));
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.page;
                        return newErrors;
                      });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                    <SelectContent>
                      {reduxPages && reduxPages.length > 0 ? (
                        reduxPages.map((page: any) => (
                          <SelectItem key={page.id} value={String(page.id)}>
                            {page.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No pages available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  ) : (
                  <Input
                    value={dialogMode === "create" ? newCustomValue : editCustomValue}
                    onChange={(e) => {
                      (dialogMode === "create" ? setNewCustomValue(e.target.value) : setEditCustomValue(e.target.value));
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.custom;
                        return newErrors;
                      });
                    }}
                    placeholder="Enter URL"
                  />
                )}
                {errors.page && <p className="text-sm text-red-600 mt-1">{errors.page}</p>}
                {errors.custom && <p className="text-sm text-red-600 mt-1">{errors.custom}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Target <span className="text-red-600">*</span></label>
                <Select
                  value={dialogMode === "create" ? newTarget : editTarget}
                  onValueChange={(v) => {
                    if (dialogMode === "create") setNewTarget(v);
                    else setEditTarget(v);
                    setErrors({});
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">_self</SelectItem>
                    <SelectItem value="_blank">_blank</SelectItem>
                  </SelectContent>
                </Select>
                {errors.target && <p className="text-sm text-red-600 mt-1">{errors.target}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Status <span className="text-red-600">*</span></label>
                <Select
                  value={dialogMode === "create" ? newStatus : editStatus}
                  onValueChange={(v) => {
                    if (dialogMode === "create") setNewStatus(v);
                    else setEditStatus(v);
                    setErrors({});
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                let success = false;
                if (dialogMode === "create") {
                  success = await handleCreateSave();
                } else {
                  success = await handleSaveEdit();
                }

                if (success) setDialogOpen(false);
              }}
            >
              {dialogMode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => { setItemToDelete(null); setDeleteConfirmOpen(false); }}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmDelete}>Delete</Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}