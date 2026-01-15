"use client";

import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchServices,
  deleteServiceThunk,
  selectServices,
  selectServicesLoading,
  selectServicesPagination,
  setServiceNumber,
} from '@/store/slices/services';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const ServiceList: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const services = useAppSelector(selectServices);
  const loading = useAppSelector(selectServicesLoading);
  const pagination = useAppSelector(selectServicesPagination);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(
      fetchServices(
        pagination.currentPage,
        pagination.perPage,
        debouncedSearch
      ) as any
    );
  }, [dispatch, pagination.currentPage, pagination.perPage, debouncedSearch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    dispatch(setServiceNumber(1));
  };

  // Debounce search input and reset page to 1 when a new search is started
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">
              View and manage service entries
            </p>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => router.push("/admin/services/create")}
          >
            + New Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Services</CardTitle>
                <CardDescription>
                  View and manage service entries
                </CardDescription>
              </div>
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                   className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[...Array(4)].map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center p-6 text-gray-400">
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((svc: any, idx: number) => {
                    const name = svc.name || "-";
                    const type = svc.flag || "-";
                    const price = svc.price || svc.discount_price || "-";
                    return (
                      <TableRow
                        key={svc.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell>
                          {(pagination.currentPage - 1) * pagination.perPage +
                            idx +
                            1}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {name}
                        </TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{price ? `$${price}` : "-"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              svc.status === 1
                                ? "bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-semibold"
                                : "text-gray-300 bg-gray-700 px-4 py-1 rounded-full text-xs font-semibold"
                            }
                          >
                            {svc.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/services/edit/${svc.id}`)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(svc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-2 sm:gap-4">
            {(() => {
              const start = (pagination.currentPage - 1) * pagination.perPage + 1;
              const end = Math.min(start + services.length - 1, pagination.totalRecords || (start + services.length - 1));
              const total = typeof pagination.totalRecords === 'number' && pagination.totalRecords >= 0 ? pagination.totalRecords : services.length;
              return (
                <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                  Showing {start} to {end} of {total} results
                </span>
              );
            })()}

            <nav className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => dispatch(setServiceNumber(Math.max(1, pagination.currentPage - 1)))}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {(() => {
                const pages: Array<number | string> = [];
                const total = pagination.totalPages;
                const current = pagination.currentPage;
                if (total <= 5) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  if (current <= 3) {
                    pages.push(1, 2, 3, 4, '...', total);
                  } else if (current >= total - 2) {
                    pages.push(1, '...', total - 3, total - 2, total - 1, total);
                  } else {
                    pages.push(1, '...', current - 1, current, current + 1, '...', total);
                  }
                }
                return pages.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === current ? 'default' : 'outline'}
                      size="sm"
                      className={p === current ? 'bg-orange-500 text-white' : ''}
                      onClick={() => dispatch(setServiceNumber(Number(p)))}
                      aria-current={p === current ? 'page' : undefined}
                    >
                      {p}
                    </Button>
                  )
                );
              })()}

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => dispatch(setServiceNumber(Math.min(pagination.totalPages, pagination.currentPage + 1)))}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => {
            if (!open) setConfirmDeleteId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this service? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (confirmDeleteId) {
                    await dispatch(deleteServiceThunk(confirmDeleteId));
                    dispatch(
                      fetchServices(
                        pagination.currentPage,
                        pagination.perPage,
                        searchTerm
                      ) as any
                    );
                    setConfirmDeleteId(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ServiceList;
// import ServiceBuilder from './ServiceBuilder';

// export default function ServiceList() {
//   return <ServiceBuilder />;
// }
