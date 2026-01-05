"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import PartnerDialog from "@/components/admin/PartnerDialog";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchPartners,
  deletePartnerThunk,
  selectPartners,
  selectPartnersLoading,
  selectPartnersPagination,
} from "@/store/slices/partners";

// Use the Partner type from the store to ensure consistency
import type { Partner } from "@/store/slices/partners";

export default function Partners() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  const partners = useSelector(selectPartners);
  const dataLoading = useSelector(selectPartnersLoading);
  const pagination = useSelector(selectPartnersPagination);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadPartners = useCallback(
    (page = 1, limit = 10, search = "") => {
      dispatch(fetchPartners(page, limit, search));
    },
    [dispatch]
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

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
      loadPartners(page, perPage, debouncedSearch);
    }
  }, [user, isAdmin, loadPartners, page, perPage, debouncedSearch]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [user, isAdmin, loading, router]);

  const handleDelete = useCallback(async () => {
    if (deletingPartner) {
      await dispatch(deletePartnerThunk(deletingPartner.id));
      setDeleteDialogOpen(false);
      setDeletingPartner(null);
    }
  }, [dispatch, deletingPartner]);

  const openDeleteDialog = useCallback((partner: Partner) => {
    setDeletingPartner(partner);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeletingPartner(null);
  }, []);

  const handleEdit = useCallback((partner: Partner) => {
    setEditingPartner(partner);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingPartner(null);
  }, []);

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "blogger":
        return "bg-purple-500";
      case "linkedin":
        return "bg-blue-500";
      case "youtube":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    return num.toLocaleString();
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
            <h1 className="text-3xl font-bold">Partners & Influencers</h1>
            <p className="text-muted-foreground">
              Manage your influencer network
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Partners</CardTitle>
                <CardDescription>
                  View and manage influencer partnerships
                </CardDescription>
              </div>
              <Input
                id="partner-search"
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
            ) : partners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No partners yet. Click "Add Partner" to get started.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner, idx) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          {(pagination.currentPage - 1) * perPage + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {partner.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getChannelColor(partner.channel_type)}
                          >
                            {partner.channel_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {partner.platform_handle || "N/A"}
                        </TableCell>
                        <TableCell>
                          {formatNumber(partner.follower_count)}
                        </TableCell>
                        <TableCell>
                          {partner.engagement_rate
                            ? `${partner.engagement_rate}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(partner)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(partner)}
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
                    const end = start + partners.length - 1;
                    const total =
                      typeof pagination.totalRecords === "number" &&
                      pagination.totalRecords >= 0
                        ? pagination.totalRecords
                        : partners.length;
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

        <PartnerDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          partner={editingPartner}
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
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{deletingPartner?.name}</span>? This
              action cannot be undone.
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
