import DynamicPageClient from "./DynamicPage";
import { service } from "@/services/_api_service";
import { notFound } from "next/navigation";

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await service.fetchPageDetails(slug);

    // If API returns error or no data
    if (!res?.data?.data || res?.data?.status < 1) {
      return {
        title: "Page Not Found",
        description: "The page you're looking for doesn't exist",
      };
    }

    const pageData = res.data.data;
    const meta = pageData.meta || {};

    return {
      title: meta.meta_title || pageData.title || "Page",
      description: meta.meta_description || "Page description",
      keywords: meta.meta_keywords || "",
      authors: [{ name: meta.meta_author || "Author" }],
      openGraph: {
        images: [meta.meta_feature_image || ""],
        title: meta.meta_title || pageData.title || "",
        description: meta.meta_description || "",
      },
      twitter: {
        card: "summary_large_image",
        title: meta.meta_title || pageData.title || "",
        description: meta.meta_description || "",
        images: [meta.meta_feature_image || ""],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist",
    };
  }
}

// Validate slug on server before rendering client component
async function validateSlug(slug: string): Promise<boolean> {
  try {
    const res = await service.fetchPageDetails(slug);

    // If API returns error or no data
    if (!res?.data?.data || res?.data?.status < 1) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("📄 [validateSlug] Error validating slug:", slug, error);
    return false;
  }
}

// Dynamic page route: [slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Validate slug server-side before rendering
  const isValid = await validateSlug(slug);

  if (!isValid) {
    // Show 404 page for invalid slug
    notFound();
  }

  return <DynamicPageClient />;
}
