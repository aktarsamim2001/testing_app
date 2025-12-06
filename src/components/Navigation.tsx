"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, roles } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const [userDashboardPath, setUserDashboardPath] = useState('/');

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (roles.includes('admin' as any)) {
      setUserDashboardPath('/admin');
    } else if (roles.includes('brand' as any)) {
      setUserDashboardPath('/brand');
    } else if (roles.includes('creator' as any)) {
      setUserDashboardPath('/creator');
    }
  }, [roles]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "For Creators", path: "/creators" },
    { name: "Services", path: "/services" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
  ];

  // Don't show this Navigation on dashboard pages
  const isDashboardPage = pathname?.startsWith("/admin") || 
                          pathname?.startsWith("/brand") || 
                          pathname?.startsWith("/creator");

  if (isDashboardPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-soft group-hover:shadow-medium transition-all">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PartnerScale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {mounted && user && isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
            {!mounted ? (
              <Link href="/auth">
                <Button size="sm" className="bg-gradient-primary shadow-soft hover:shadow-medium">
                  Sign In / Sign Up
                </Button>
              </Link>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push(userDashboardPath)}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-gradient-primary shadow-soft hover:shadow-medium">
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block py-3 text-sm font-medium transition-colors hover:text-primary ${
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
                className={`block py-3 text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            {!mounted ? (
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full mt-4 bg-gradient-primary">
                  Sign In / Sign Up
                </Button>
              </Link>
            ) : user ? (
              <div className="pt-3 mt-3 border-t space-y-2">
                <div className="text-sm text-muted-foreground mb-2">{user.email}</div>
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  onClick={() => { signOut(); setIsOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full mt-4 bg-gradient-primary">
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
