"use client";

import { ReactNode, useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, Megaphone, Building2, LogOut,MailOpen, Settings, TrendingUp, FileText, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
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
  { title: 'Services', path: '/admin/services', icon: TrendingUp },
  { title: 'Subscriptions', path: '/admin/subscriptions', icon: Package },
  { title: 'Enquiries', path: '/admin/enquiries', icon: MailOpen }, // Changed icon to FileText
  {
    group: 'Blogs',
    icon: FileText,
    items: [
      { title: 'Blog Authors', path: '/admin/authors' },
      { title: 'Blog Categories', path: '/admin/blog/categories' },
      { title: 'Blog Posts', path: '/admin/blog' },
    ],
  },
  {
    group: 'CMS',
    icon: FileText,
    items: [
      { title: 'Menu Management', path: '/admin/menu-management' },
      { title: 'Page Management', path: '/admin/pages' },
    ],
  },
  { title: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
  { title: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Track open/close state for each group
  // By default, all groups are closed (false)
  // Using sessionStorage to persist state across re-mounts
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>(() => {
    // Try to load from sessionStorage first
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('adminSidebarGroups');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved groups:', e);
        }
      }
    }
    
    // Default: all closed
    const groups: { [key: string]: boolean } = {};
    menuItems.forEach(item => {
      if (item.group) groups[item.group] = false;
    });
    return groups;
  });

  // Save to sessionStorage whenever openGroups changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminSidebarGroups', JSON.stringify(openGroups));
    }
  }, [openGroups]);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    // Special handling for Blog Categories and Blog Posts
    if (path === '/admin/blog/categories') {
      return pathname === '/admin/blog/categories';
    }
    if (path === '/admin/blog') {
      // Only active for /admin/blog or /admin/blog/[something], but not /admin/blog/categories
      return pathname === '/admin/blog' ||
        (pathname.startsWith('/admin/blog/') && !pathname.startsWith('/admin/blog/categories'));
    }
    if (path === '/admin') return pathname === path;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const closeMobileSidebar = () => {
    // Only close mobile sidebar, don't affect group state
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => {
      const newState = { ...prev, [group]: !prev[group] };
      return newState;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <AdminHeader 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => {
          if (isMobile) {
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
            ${isMobile ? 'fixed left-0 top-16 bottom-0 z-40' : 'md:z-40'}
            ${isMobileSidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `} 
          style={{
            width: !isMobile && isCollapsed ? '72px' : '256px',
          }}>

            {/* Menu Items with Collapsible Groups */}
            <nav className={`flex-1 ${!isMobile && isCollapsed ? 'p-2' : 'p-4'} space-y-2 overflow-y-auto`}>
              {menuItems.map((item, idx) => {
                if (item.group && item.items) {
                  const isOpen = openGroups[item.group] ?? false;
                  return (
                    <div key={item.group + idx} className="mb-2">
                      {!(!isMobile && isCollapsed) && (
                        <button
                          type="button"
                          className="flex items-center w-full px-2 py-1 text-xs font-semibold text-muted-foreground tracking-wider focus:outline-none hover:text-primary transition-colors"
                          onClick={() => toggleGroup(item.group!)}
                        >
                           {item.icon && <item.icon className="w-5 h-5 mr-1" />}
                          <span className="text-[13px]">{item.group}</span>
                          <span className="ml-auto">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        </button>
                      )}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ml-4 border-l border-muted-foreground/10 pl-2 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                        aria-hidden={!isOpen}
                      >
                        <div className="space-y-1">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              onClick={closeMobileSidebar}
                              className={`flex items-center ${!isMobile && isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${
                                isActive(sub.path)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                              title={sub.title}
                            >
                              <span className="w-1 h-1 rounded-full bg-muted-foreground mr-2" />
                              {!(!isMobile && isCollapsed) && <span className="truncate text-sm font-medium">{sub.title}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                // Normal menu item
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center ${!isMobile && isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                    title={item.title}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!(!isMobile && isCollapsed) && <span className="truncate text-sm font-medium">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>

        {/* Main Content - Scrollable with margin for fixed sidebar */}
        <main className="flex-1 overflow-y-auto transition-all duration-300" 
        style={{
          marginLeft: isMobile ? '0' : (isCollapsed ? '72px' : '256px'),
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}