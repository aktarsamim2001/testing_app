"use client";

import BlogPosts from "@/page-components/admin/BlogPosts";
import AdminRoute from "@/components/AdminRoute";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <AdminRoute>
      <BlogPosts />
    </AdminRoute>
  );
}

