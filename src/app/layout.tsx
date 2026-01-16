"use client";

import { useState } from "react";
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
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/admin/login");
  const isAdminPage = pathname?.startsWith("/admin");
  const isBrandPage = pathname?.startsWith("/brand");
  const isCreatorPage = pathname?.startsWith("/creator") && pathname !== "/creators";

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const showFloatingButton = !isAuthPage && !isAdminPage && !isBrandPage && !isCreatorPage;

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
            {isAdminPage && !isAuthPage && <AdminHeader isCollapsed={isCollapsed} onToggleSidebar={handleToggleSidebar} />}
            {isBrandPage && <BrandHeader isCollapsed={isCollapsed} onToggleSidebar={handleToggleSidebar} />}
            {isCreatorPage && <CreatorHeader isCollapsed={isCollapsed} onToggleSidebar={handleToggleSidebar} />}
            {!isAuthPage && !isAdminPage && !isBrandPage && !isCreatorPage && <Navigation />}
            <main className="flex-1 pt-16">
              {children}
            </main>
            {isAdminPage && !isAuthPage && <AdminFooter />}
            {isBrandPage && <BrandFooter />}
            {isCreatorPage && <CreatorFooter />}
            {!isAuthPage && !isAdminPage && !isBrandPage && !isCreatorPage && <Footer />}
              {/* Floating Get In Touch Button */}
            {showFloatingButton && (
              <Link
                href="https://wa.me/1234567890?text=Hi,%20I%20would%20like%20to%20get%20in%20touch%20with%20PartnerScale"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-50 group"
                aria-label="Get in Touch via WhatsApp"
              >
                <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Get in Touch</span>
              </Link>
            )}
          </div>
        </Providers>
      </body>
    </html>
  );
}

