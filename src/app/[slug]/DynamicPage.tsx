"use client";


import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import type { RootState, AppDispatch } from "@/store";

import { fetchCMSPage } from "@/store/slices/cmsPage";
import NotFound from "../not-found";

// Import page components
import ForCreators from "@/page-components/ForCreators";
import Services from "@/page-components/Services";
import HowItWorks from "@/page-components/HowItWorks";
import Pricing from "@/page-components/Pricing";
import About from "@/page-components/About";
import Blog from "@/page-components/Blog";
import Contact from "@/page-components/Contact";

const DynamicPageClient = () => {
  const params = useParams();
  const slug = params?.slug as string;
  
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, status } = useSelector(
    (state: RootState) => state.cmsPage
  );
//   console.log("🟢 [DynamicPageClient] Redux state:", { 
//     hasData: !!data,
//     template: data?.template,
//     isLoading, 
//     error, 
//     status 
//   });

  const template = data?.template;

  // Fetch page data when slug changes
  useEffect(() => {
    if (slug) {
      dispatch(fetchCMSPage(slug));
    }
  }, [dispatch, slug]);

  // Loading state
  // if (isLoading || status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading page...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Error state
  if (error || status === "failed") {
    return <NotFound />;
  }

  // No data
  // if (!data) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
  //         <p className="text-muted-foreground">The page you're looking for doesn't exist</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Render component based on template
  const renderPageComponent = () => {
    switch (template) {
      case "for-creators":
      case "creators":
        return <ForCreators data={data} />;
      case "services":
        return <Services data={data} />;
      case "how_it_works":
        return <HowItWorks data={data} />;
      case "pricing":
        return <Pricing data={data} />;
      case "about":
        return <About data={data} />;
      case "blog":
        return <Blog data={data} />;
      case "contact":
        return <Contact data={data} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              {/* <h1 className="text-2xl font-bold mb-4">Unknown Page Type</h1>
              <p className="text-muted-foreground">This page type is not supported</p> */}
            </div>
          </div>
        );
    }
  };

  return renderPageComponent();
};

export default DynamicPageClient;
