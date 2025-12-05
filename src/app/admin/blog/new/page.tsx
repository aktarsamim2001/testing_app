import BlogPostWizard from "@/pages/admin/BlogPostWizard";
import AdminRoute from "@/components/AdminRoute";

export default function Page() {
  return (
    <AdminRoute>
      <BlogPostWizard />
    </AdminRoute>
  );
}
