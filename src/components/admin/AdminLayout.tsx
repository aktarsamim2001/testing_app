"use client";

import { ReactNode, useState } from 'react';
import { LayoutDashboard, Users,UserCircle, Megaphone, Building2, LogOut, Settings, TrendingUp, FileText, Menu, X } from 'lucide-react';
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
  { title: 'Authors', path: '/admin/authors', icon: UserCircle },
  { title: 'Blog Posts', path: '/admin/blog', icon: FileText },
  { title: 'Pages', path: '/admin/pages', icon: FileText },
  { title: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
  { title: 'Settings', path: '/admin/settings', icon: Settings }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === path;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <AdminHeader 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => {
          if (window.innerWidth < 768) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }} 
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile Drawer & Desktop Fixed */}
        <>
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileSidebar}
            />
          )}
          
          {/* Sidebar */}
          <aside className={`
            border-r bg-background transition-all duration-300 flex flex-col flex-shrink-0
            md:fixed md:left-0 md:top-16 md:bottom-0
            ${window.innerWidth < 768 ? 'fixed left-0 top-16 bottom-0 z-40' : 'md:z-40'}
            ${isMobileSidebarOpen || window.innerWidth >= 768 ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `} 
          style={{
            width: window.innerWidth >= 768 && isCollapsed ? '72px' : '256px',
          }}>

            {/* Menu Items */}
            <nav className={`flex-1 ${window.innerWidth >= 768 && isCollapsed ? 'p-2' : 'p-4'} space-y-2 overflow-y-auto`}>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={closeMobileSidebar}
                  className={`flex items-center ${window.innerWidth >= 768 && isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  title={item.title}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!(window.innerWidth >= 768 && isCollapsed) && <span className="truncate text-sm font-medium">{item.title}</span>}
                </Link>
              ))}
            </nav>
          </aside>
        </>

        {/* Main Content - Scrollable with margin for fixed sidebar */}
        <main className="flex-1 overflow-y-auto transition-all duration-300" 
        style={{
          marginLeft: window.innerWidth < 768 ? '0' : (isCollapsed ? '72px' : '256px'),
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
