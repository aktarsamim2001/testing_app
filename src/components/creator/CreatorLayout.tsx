"use client";

import { ReactNode, useState } from 'react';
import { LayoutDashboard, Briefcase, User, LogOut, DollarSign, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CreatorHeader from './CreatorHeader';

interface CreatorLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Dashboard', path: '/creator', icon: LayoutDashboard },
  { title: 'My Campaigns', path: '/creator/campaigns', icon: Briefcase },
  { title: 'Earnings', path: '/creator/earnings', icon: DollarSign },
  { title: 'Profile', path: '/creator/profile', icon: User }
];

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/creator') return pathname === path;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <CreatorHeader 
        isCollapsed={isCollapsed} 
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isCollapsed ? 'w-18' : 'w-64'} border-r bg-background transition-all duration-300 flex flex-col flex-shrink-0`}>

          {/* Menu Items */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2 mt-16`}>
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
