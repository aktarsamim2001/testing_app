"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEnquiries } from "@/store/slices/enquiries";
import AdminLayout from "@/components/admin/AdminLayout";
import EnquiryDialog from "@/components/admin/EnquiryDialog";

export default function EnquiriesPage() {
  const dispatch = useDispatch();
  const { data, loading, total, currentPage, totalPages, totalResults } =
    useSelector((state: any) => state.enquiries);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(
    null
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
    dispatch(
      getEnquiries({ page, limit: perPage, search: debouncedSearch }) as any
    );
  }, [dispatch, page, perPage, debouncedSearch]);



  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Enquiries</h1>
            <p className="text-muted-foreground">Manage all user enquiries</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Enquiries</CardTitle>
                <CardDescription>
                  View and manage user enquiries
                </CardDescription>
              </div>
              <Input
                id="enquiry-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                className="focus:ring-2 focus:ring-orange-500 sm:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No enquiries found.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Monthly Budget</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item: any, idx: number) => (
                      <TableRow key={item.id || idx}>
                        <TableCell>{(page - 1) * perPage + idx + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell>{item.monthly_budget}</TableCell>
                        <TableCell>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEnquiryId(item.id);
                              setDialogOpen(true);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-4">
                  {(() => {
                    const start = (page - 1) * perPage + 1;
                    const end = start + data.length - 1;
                    const totalCount =
                      typeof totalResults === "number" && totalResults >= 0
                        ? totalResults
                        : data.length;
                    return (
                      <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                        Showing {start} to {end} of {totalCount} results
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
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {(() => {
                      const pages = [];
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (page <= 3) {
                          pages.push(1, 2, 3, 4, "...", totalPages);
                        } else if (page >= totalPages - 2) {
                          pages.push(
                            1,
                            "...",
                            totalPages - 3,
                            totalPages - 2,
                            totalPages - 1,
                            totalPages
                          );
                        } else {
                          pages.push(
                            1,
                            "...",
                            page - 1,
                            page,
                            page + 1,
                            "...",
                            totalPages
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
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            className={
                              p === page ? "bg-orange-500 text-white" : ""
                            }
                            onClick={() => setPage(Number(p))}
                            aria-current={p === page ? "page" : undefined}
                          >
                            {p}
                          </Button>
                        )
                      );
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
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
        <EnquiryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          enquiryId={selectedEnquiryId}
        />
      </div>
    </AdminLayout>
  );
}
