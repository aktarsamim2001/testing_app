"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, User, Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

const AdminHeader = ({ isCollapsed, onToggleSidebar }: AdminHeaderProps) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border h-16">
      <div className="w-full mx-auto px-3 sm:px-5 flex items-center justify-between h-16 gap-2 sm:gap-4">
        <Link href="/admin" className="flex items-center gap-2 group flex-shrink-0">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
          </div>
          <span className="text-sm sm:text-lg md:text-xl font-bold hidden sm:inline">Admin Panel</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <Menu className="w-4 sm:w-5 h-4 sm:h-5" /> : <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />}
          </button>
          <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate max-w-[150px] md:max-w-none">{user?.name}</div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="hidden sm:flex text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <User className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <LogOut className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
