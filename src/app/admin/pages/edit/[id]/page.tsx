"use client";
import { useParams } from "next/navigation";
import PageBuilder from "@/page-components/admin/PageBuilder";

export default function EditPagePage() {
  const params = useParams();
  const pageId = Array.isArray(params.id) ? params.id[0] : params.id;
  return <PageBuilder pageId={pageId} />;
}
