import BlogPostWizard from "@/page-components/admin/BlogPostWizard";
import AdminRoute from "@/components/AdminRoute";

export default function Page() {
  return (
    <AdminRoute>
      <BlogPostWizard />
    </AdminRoute>
  );
}

