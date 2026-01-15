import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { getEnquiryDetails, clearEnquiryDetails } from "@/store/slices/enquiryDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Building2, Globe, DollarSign, FileText, Calendar, Tag, User } from "lucide-react";

interface EnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enquiryId: string | null;
}

const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
      <div className="group relative">
    <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all duration-200">
      <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 text-orange-600 group-hover:from-orange-100 group-hover:to-red-100 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
        {isLink && value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-orange-500 hover:underline break-all font-medium"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900 break-words font-medium whitespace-pre-line">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
        )}
      </div>
    </div>
  </div>
);

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold ">
            Enquiry Details
          </DialogTitle>
        </DialogHeader>
        
        {loading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem icon={User} label="Full Name" value={data.name} />
              <DetailItem icon={Mail} label="Email Address" value={data.email} />
              <DetailItem icon={Building2} label="Company" value={data.company} />
              <DetailItem icon={Tag} label="Source" value={data.source} />
              <DetailItem icon={Tag} label="Service Interest" value={data.service_interest} />
              <DetailItem icon={DollarSign} label="Monthly Budget" value={data.monthly_budget} />
              <div className="md:col-span-2">
                <DetailItem icon={Globe} label="Website" value={data.website} isLink={true} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="group relative">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-500 hover:shadow-md transition-all duration-200">
                  <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 text-orange-500 group-hover:from-orange-100 group-hover:to-red-100 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line font-medium min-h-[60px]">
                      {data.description || <span className="text-gray-400">No description provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}