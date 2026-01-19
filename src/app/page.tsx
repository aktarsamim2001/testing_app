import HomePageClient from "@/app/HomePageClient";
import { service } from "@/services/_api_service";

// Dynamic SEO: fetch home page metadata from API
export async function generateMetadata() {
  try {
    const res = await service.fetchPageDetails("home");
    if (!res?.data?.data || res?.data?.status < 1) {
      return {
        title: "Home | Brand Influencer",
        description: "Welcome to our platform. Discover top brand influencers and creators.",
      };
    }
    const pageData = res.data.data;
    const meta = pageData.meta || {};
    return {
      title: meta.meta_title || pageData.title || "Home | Brand Influencer",
      description: meta.meta_description || "Discover top brand influencers and creators.",
      keywords: meta.meta_keywords || "brand, influencer, creator, campaigns",
      authors: [{ name: meta.meta_author || "Brand Influencer" }],
      openGraph: {
        title: meta.meta_title || pageData.title || "Home | Brand Influencer",
        description: meta.meta_description || "Discover top brand influencers and creators.",
        images: [meta.meta_feature_image || ""],
        url: "https://yourdomain.com/",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: meta.meta_title || pageData.title || "Home | Brand Influencer",
        description: meta.meta_description || "Discover top brand influencers and creators.",
        images: [meta.meta_feature_image || ""],
      },
    };
  } catch (error) {
    console.error("Home page metadata error:", error);
    return {
      title: "Home | Brand Influencer",
      description: "Welcome to our platform. Discover top brand influencers and creators.",
    };
  }
}

export default function Page() {
  return <HomePageClient />;
}

