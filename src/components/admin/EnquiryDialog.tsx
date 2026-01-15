
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { getEnquiryDetails, clearEnquiryDetails } from "@/store/slices/enquiryDetails";
import { Skeleton } from "@/components/ui/skeleton";

interface EnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiryId: string | null;
}

export default function EnquiryDialog({ open, onOpenChange, enquiryId }: EnquiryDialogProps) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state: any) => state.enquiryDetails);

  useEffect(() => {
    if (open && enquiryId) {
      dispatch(getEnquiryDetails(enquiryId) as any);
    }
    if (!open) {
      dispatch(clearEnquiryDetails());
    }
  }, [open, enquiryId, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enquiry Details</DialogTitle>
          {/* <DialogDescription>Read-only details of the enquiry</DialogDescription> */}
        </DialogHeader>
        {loading || !data ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Name</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.name || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Email</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.email || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Company</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.company || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Website</span>
              <span className="rounded bg-gray-100 px-3 py-2  text-sm shadow-sm break-all">
                {data.website ? <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{data.website}</a> : '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Service Interest</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.service_interest || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Monthly Budget</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.monthly_budget || '-'}</span>
            </div>
            <div className="flex flex-col ">
              <span className="text-xs text-gray-500 font-medium mb-1">Description</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm whitespace-pre-line min-h-[40px]">{data.description || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Source</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.source || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium mb-1">Created At</span>
              <span className="rounded bg-gray-100 px-3 py-2 text-gray-800 text-sm shadow-sm">{data.created_at ? new Date(data.created_at).toLocaleString() : '-'}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
