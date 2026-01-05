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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import ClientDialog from "@/components/admin/ClientDialog";
import type { AppDispatch, RootState } from "@/store";
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
  fetchClients,
  deleteClientThunk,
  selectClients,
  selectClientsLoading,
  selectClientsPagination,
} from "@/store/slices/clients";

interface Client {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  status: number;
  notes: string | null;
}

export default function Clients() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  const clients = useSelector(selectClients);
  const dataLoading = useSelector(selectClientsLoading);
  const pagination = useSelector(selectClientsPagination);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const loadClients = useCallback(
    (page = 1, limit = 10, search = "") => {
      dispatch(fetchClients(page, limit, search));
    },
    [dispatch]
  );

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
      loadClients(page, perPage, debouncedSearch);
    }
  }, [user, isAdmin, loadClients, page, perPage, debouncedSearch]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [user, isAdmin, loading, router]);

  const handleDelete = useCallback(async () => {
    if (deletingClient) {
      await dispatch(deleteClientThunk(deletingClient.id));
      setDeleteDialogOpen(false);
      setDeletingClient(null);
      // Toast logic removed
    }
  }, [dispatch, deletingClient]);

  const openDeleteDialog = useCallback((client: Client) => {
    setDeletingClient(client);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingClient(null);
  }, []);

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  }, []);

  // Custom close handler to reload clients and show toast if error
  const handleDialogClose = useCallback(
    (result?: boolean | { error?: string; success?: string }) => {
      setDialogOpen(false);
      setEditingClient(null);
      // Toast logic removed
      // loadClients();
    },
    [loadClients]
  );

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500";
      case 0:
        return "bg-gray-500";
      case 2:
        return "bg-blue-500";
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
      case 2:
        return "Prospect";
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
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Manage your SAAS company clients
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Clients</CardTitle>
                <CardDescription>
                  View and manage client accounts
                </CardDescription>
              </div>
              <Input
                id="client-search"
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
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No clients yet. Click "Add Client" to get started.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client, idx) => (
                      <TableRow key={client.id}>
                        <TableCell>{(pagination.currentPage - 1) * perPage + idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {client.company_name}
                        </TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(client.status)}>
                            {getStatusLabel(client.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(client)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Improved Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-4">
                  {(() => {
                    const start = (pagination.currentPage - 1) * perPage + 1;
                    const end = start + clients.length - 1;
                    const total =
                      typeof pagination.totalResults === "number" &&
                      pagination.totalResults >= 0
                        ? pagination.totalResults
                        : clients.length;
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
              </>
            )}
          </CardContent>
        </Card>

        <ClientDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          client={editingClient}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
        >
          <AlertDialogTrigger asChild />
          <AlertDialogContent>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{deletingClient?.company_name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
