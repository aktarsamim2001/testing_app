"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useFrontendMenus } from "@/hooks/useFrontendMenus";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, roles } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const [userDashboardPath, setUserDashboardPath] = useState('/');
  
  // Fetch frontend menus from API - with default fallback
  const menuResult = useFrontendMenus() || { headerMenu: null, isLoading: true };
  const { headerMenu, isLoading } = menuResult;

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!roles) return;
    
    if (roles.includes('admin' as any)) {
      setUserDashboardPath('/admin');
    } else if (roles.includes('brand' as any)) {
      setUserDashboardPath('/brand');
    } else if (roles.includes('creator' as any)) {
      setUserDashboardPath('/creator');
    }
  }, [roles]);

  // Use useMemo to prevent recalculation and ensure stability during navigation
  const navLinks = useMemo(() => {
    try {
      // Return empty array if no headerMenu
      if (!headerMenu) {
        return [];
      }

      // Handle array format (API returns array)
      let headerMenuObj;
      if (Array.isArray(headerMenu)) {
        headerMenuObj = headerMenu.find(menu => menu && menu.menu_name === "Header Menu");
      } else {
        headerMenuObj = headerMenu;
      }

      // Ensure we have valid items
      if (!headerMenuObj || !headerMenuObj.items || !Array.isArray(headerMenuObj.items)) {
        return [];
      }

      // Map items to nav links
      return headerMenuObj.items
        .filter(item => {
          return item && 
                 item.url && 
                 typeof item.url === 'string' && 
                 item.url.trim() !== '';
        })
        .map(item => ({
          name: item.title || 'Untitled',
          path: item.url || '#',
          target: item.target_set || '_self'
        }));
    } catch (error) {
      console.error('Error processing navigation menu:', error);
      return [];
    }
  }, [headerMenu]); // Only recalculate when headerMenu actually changes

  // Don't show this Navigation on dashboard pages
  const isDashboardPage = pathname?.startsWith("/admin") || 
                          pathname?.startsWith("/brand") || 
                          (pathname?.startsWith("/creator") && pathname !== "/creators");

  if (isDashboardPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg shadow-soft group-hover:shadow-medium transition-all">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
            </div>
            <span className="text-sm sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PartnerScale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.path || index}
                href={link.path || '#'}
                target={link.target}
                className={`text-xs lg:text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-3 sm:py-4 animate-fade-in border-t border-border">
            {navLinks.map((link, index) => (
              <Link
                key={link.path || index}
                href={link.path || '#'}
                target={link.target}
                className={`block py-2 sm:py-3 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {mounted && user && isAdmin && (
              <Link
                href="/admin"
                className={`block py-2 sm:py-3 text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            {!mounted ? (
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full mt-3 sm:mt-4 bg-gradient-primary text-xs sm:text-sm">
                  Sign In / Sign Up
                </Button>
              </Link>
            ) : user ? (
              <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border space-y-2">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 px-2">{user.email}</div>
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  onClick={() => { signOut(); setIsOpen(false); }}
                >
                  <LogOut className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full mt-3 sm:mt-4 bg-gradient-primary text-xs sm:text-sm">
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;