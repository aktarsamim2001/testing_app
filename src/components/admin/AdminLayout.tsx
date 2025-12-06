"use client";

import { ReactNode, useState } from 'react';
import { LayoutDashboard, Users, Megaphone, Building2, LogOut, Settings, TrendingUp, FileText, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Clients', path: '/admin/clients', icon: Building2 },
  { title: 'Partners', path: '/admin/partners', icon: Users },
  { title: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
  { title: 'Blog Posts', path: '/admin/blog', icon: FileText },
  { title: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
  { title: 'Settings', path: '/admin/settings', icon: Settings }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === path;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <AdminHeader 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isCollapsed ? 'w-18' : 'w-64'} border-r bg-background transition-all duration-300 flex flex-col flex-shrink-0`}>

          {/* Menu Items */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
                title={item.title}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate text-sm font-medium">{item.title}</span>}
              </Link>
            ))}
          </nav>

          {/* Sign Out Button */}
          {/* <div className="p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={`w-full justify-${isCollapsed ? 'center' : 'start'}`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
