"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";
import BrandHeader from "@/components/brand/BrandHeader";
import BrandFooter from "@/components/brand/BrandFooter";
import CreatorHeader from "@/components/creator/CreatorHeader";
import CreatorFooter from "@/components/creator/CreatorFooter";
import { Providers } from "@/components/Providers";
import "@/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const isBrandPage = pathname?.startsWith("/brand");
  const isCreatorPage = pathname?.startsWith("/creator");

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {isAdminPage && <AdminHeader />}
            {isBrandPage && <BrandHeader />}
            {isCreatorPage && <CreatorHeader />}
            {!isAuthPage && !isAdminPage && !isBrandPage && !isCreatorPage && <Navigation />}
            <main className="flex-1 pt-16">
              {children}
            </main>
            {isAdminPage && <AdminFooter />}
            {isBrandPage && <BrandFooter />}
            {isCreatorPage && <CreatorFooter />}
            {!isAuthPage && !isAdminPage && !isBrandPage && !isCreatorPage && <Footer />}
          </div>
        </Providers>
      </body>
    </html>
  );
}
