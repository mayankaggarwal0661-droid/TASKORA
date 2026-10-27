'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TaskoraProvider } from '@/context/TaskoraContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { GuestLockModal } from '@/components/auth/GuestLockModal';
import { GuestTaskImportModal } from '@/components/auth/GuestTaskImportModal';
import { PageTransition } from '@/components/layout/PageTransition';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Flame,
  Timer,
  BarChart3,
  Bell,
  Settings,
  X,
  Leaf,
  CalendarClock,
  Sprout,
  Compass,
} from 'lucide-react';

function ShellContent({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('taskora_sidebar_collapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    } catch (e) {
      // Gracefully handle storage errors
    }
  }, []);

  const pathname = usePathname();

  // Marketing pages render without the app shell chrome
  const isMarketingPage = pathname === '/' || pathname === '/welcome' || pathname === '/landing';

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('taskora_sidebar_collapsed', String(next));
      } catch (e) {
        // Gracefully handle storage errors
      }
      return next;
    });
  };

  // Keyboard shortcut listener for '[' or 'Ctrl+B' / 'Cmd+B' to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '[' || ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B'))) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    { name: 'Dashboard',        href: '/dashboard',      icon: LayoutDashboard },
    { name: 'All Tasks',        href: '/tasks',          icon: CheckSquare },
    { name: 'Calendar',         href: '/calendar',       icon: Calendar },
    { name: 'Routines & Habits',href: '/routines',       icon: Flame },
    { name: 'Focus Mode',       href: '/focus',          icon: Timer },
    { name: 'Living Day',       href: '/living-day',     icon: CalendarClock },
    { name: 'Momentum Garden',  href: '/garden',         icon: Sprout },
    { name: 'Analytics',        href: '/analytics',      icon: BarChart3 },
    { name: 'Notifications',    href: '/notifications',  icon: Bell },
    { name: 'Settings & Profile',href: '/settings',      icon: Settings },
  ];

  if (isMarketingPage) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] text-[#403B34]">
        <main>{children}</main>
        <TaskModal />
        <CommandPalette />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#403B34] flex relative selection:bg-[#718368]/20">

      {/* Desktop Collapsible Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#403B34]/20 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 bg-white border-r border-[#E7E0D5] p-5 flex flex-col justify-between z-10 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#718368] flex items-center justify-center shadow-sm">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-[#403B34]">Taskora</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-[#968D81] hover:text-[#403B34] rounded-lg hover:bg-[#F0EBE2] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 font-semibold'
                          : 'text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#718368]' : 'text-[#968D81]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-2">
                  <Link
                    href="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#718368] bg-[#EAF0E5] border border-[#718368]/20"
                  >
                    <Compass className="w-4 h-4 text-[#718368]" />
                    <span>Product Tour</span>
                  </Link>
                </div>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E7E0D5] text-xs text-[#968D81]">
              Taskora Workspace
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen ${
          isMounted ? 'transition-all duration-300' : ''
        } relative ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar onMobileMenuToggle={() => setMobileDrawerOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Interactive Overlays */}
      <TaskModal />
      <CommandPalette />
      <ToastContainer />
      <GuestLockModal />
      <GuestTaskImportModal />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TaskoraProvider>
        <ShellContent>
          <AuthGuard>{children}</AuthGuard>
        </ShellContent>
      </TaskoraProvider>
    </AuthProvider>
  );
}
