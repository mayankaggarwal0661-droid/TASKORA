'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Flame,
  Timer,
  BarChart3,
  Bell,
  Settings,
  Plus,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Compass,
  CalendarClock,
  Sprout,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ActiveTooltip {
  name: string;
  badge?: React.ReactNode;
  top: number;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { tasks, routines, notificationSettings, openTaskModal, todayStr } = useTaskora();
  const { isGuest } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear tooltips whenever sidebar state changes
  useEffect(() => {
    setActiveTooltip(null);
  }, [collapsed]);

  const { overdue, dueToday } = ScheduleService.categorizeTasks(tasks, todayStr);
  const totalDueCount = overdue.length + dueToday.length;
  const activeRoutinesCount = routines.filter(r => r.active).length;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'All Tasks',
      href: '/tasks',
      icon: CheckSquare,
      badge: totalDueCount > 0 ? (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          overdue.length > 0
            ? 'bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30'
            : 'bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30'
        }`}>
          {totalDueCount}
        </span>
      ) : null,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      badge: null,
    },
    {
      name: 'Routines & Habits',
      href: '/routines',
      icon: Flame,
      badge: (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#F4EBD9] text-[#A97535] border border-[#A97535]/30">
          {activeRoutinesCount}
        </span>
      ),
    },
    {
      name: 'Focus Mode',
      href: '/focus',
      icon: Timer,
      badge: (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#EAF0E5] text-[#718368] border border-[#718368]/30">
          25m
        </span>
      ),
    },
    {
      name: 'Living Day',
      href: '/living-day',
      icon: CalendarClock,
      badge: null,
    },
    {
      name: 'Momentum Garden',
      href: '/garden',
      icon: Sprout,
      badge: null,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: (
        <span className={`w-2 h-2 rounded-full ${
          notificationSettings.permission === 'granted' ? 'bg-[#557B5C]' : 'bg-[#A97535]'
        }`} />
      ),
    },
    {
      name: 'Settings & Profile',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
        }
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 glass-surface-elevated border-r border-[#E7E0D5]/80 z-40 select-none overflow-hidden text-[#403B34]"
      >
        {/* Brand Header & Persistent Controls */}
        {collapsed ? (
          <div className="flex flex-col items-center py-2.5 px-3 border-b border-[#E7E0D5] gap-2 shrink-0 bg-white/40">
            {/* Persistent Expand Control at the Top Edge of Collapsed Sidebar */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                id="sidebar-expand-btn-top"
                className="w-10 h-8 rounded-lg bg-[#EAF0E5] hover:bg-[#D9E8D3] text-[#557B5C] hover:text-[#3E5C44] border border-[#718368]/30 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer group"
                title="Expand sidebar ([ or Ctrl+B)"
                aria-label="Expand sidebar"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveTooltip({ name: 'Expand sidebar ([)', top: rect.top + rect.height / 2 });
                }}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            )}

            {/* Taskora Logo Link */}
            <Link
              href="/"
              className="flex items-center justify-center group"
              title="Taskora Workspace"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({ name: 'Taskora Workspace', top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="w-10 h-10 rounded-xl bg-[#718368] group-hover:bg-[#5F7157] flex items-center justify-center shadow-sm shrink-0 transition-colors">
                <Leaf className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>
        ) : (
          <div className="h-18 flex items-center justify-between px-5 border-b border-[#E7E0D5] shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#718368] flex items-center justify-center shadow-sm shrink-0">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-xl font-extrabold tracking-tight text-[#403B34]">
                  Taskora
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#718368] font-semibold block">
                  Workspace
                </span>
              </motion.div>
            </Link>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                id="sidebar-collapse-btn"
                className="p-1.5 rounded-lg text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer group"
                title="Collapse sidebar ([ or Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}
          </div>
        )}

        {/* Quick Action Button */}
        <div className={`py-4 shrink-0 ${collapsed ? 'px-3 flex justify-center' : 'px-5'}`}>
          <button
            type="button"
            onClick={() => openTaskModal()}
            className={`flex items-center justify-center rounded-xl font-semibold text-sm text-white bg-[#718368] hover:bg-[#5F7157] active:bg-[#4E5E47] shadow-sm border border-[#718368] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
              collapsed ? 'w-10 h-10 p-0' : 'w-full py-2.5 px-4 gap-2'
            }`}
            title="New Task (Press N)"
            aria-label="Create new task"
            onMouseEnter={(e) => {
              if (collapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({ name: 'New Task (Press N)', top: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <>
                <span>New Task</span>
                <span className="ml-auto text-[10px] bg-[#5F7157] px-1.5 py-0.5 rounded text-white/80 font-mono">N</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider px-3 py-1">
              Workspace
            </div>
          )}
          {navigationItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`relative flex items-center rounded-xl text-sm font-medium transition-all group ${
                  collapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'text-[#557B5C] font-semibold'
                    : 'text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
                }`}
                onMouseEnter={(e) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({
                      name: item.name,
                      badge: item.badge,
                      top: rect.top + rect.height / 2
                    });
                  }
                }}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-[#EAF0E5] border border-[#718368]/25 rounded-xl z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                  <Icon
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? 'text-[#718368]' : 'text-[#968D81] group-hover:text-[#756E64]'
                    }`}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </div>
                {!collapsed && <span className="relative z-10">{item.badge}</span>}
              </Link>
            );
          })}

          {/* Product Tour Link */}
          <div className="pt-2">
            <Link
              href="/"
              title={collapsed ? 'Product Tour' : undefined}
              className={`flex items-center rounded-xl text-xs font-semibold text-[#718368] hover:text-[#5F7157] bg-[#EAF0E5] hover:bg-[#D9E8D3] border border-[#718368]/20 transition-all group ${
                collapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'
              }`}
              onMouseEnter={(e) => {
                if (collapsed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActiveTooltip({ name: 'Product Tour', top: rect.top + rect.height / 2 });
                }
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Compass className="w-4 h-4 text-[#718368] group-hover:rotate-45 transition-transform shrink-0" />
                {!collapsed && <span>Product Tour</span>}
              </div>
              {!collapsed && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D9E8D3] text-[#557B5C]">
                  Tour
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer & Expand Toggle */}
        <div className={`p-4 border-t border-[#E7E0D5]/70 bg-white/40 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-[#968D81]" suppressHydrationWarning>
                <span
                  suppressHydrationWarning
                  className={`w-2 h-2 rounded-full ${isGuest ? 'bg-[#B88762]' : 'bg-[#557B5C] animate-pulse'}`}
                />
                <span className="font-medium text-[#403B34]" suppressHydrationWarning>
                  {isGuest ? 'Guest Session' : 'Taskora Cloud'}
                </span>
              </div>
              <span className="text-[11px] text-[#968D81] font-mono" suppressHydrationWarning>
                {isGuest ? 'Temporary' : 'Synced'}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              id="sidebar-expand-btn-bottom"
              className="p-1.5 rounded-lg text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer group"
              title="Expand sidebar ([ or Ctrl+B)"
              aria-label="Expand sidebar"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActiveTooltip({ name: 'Expand sidebar ([)', top: rect.top + rect.height / 2 });
              }}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Floating Tooltips Portal for Collapsed Navigation */}
      {mounted && collapsed && activeTooltip && typeof document !== 'undefined' && createPortal(
        <div
          style={{ top: activeTooltip.top }}
          className="fixed left-[88px] -translate-y-1/2 z-[100] pointer-events-none px-2.5 py-1.5 rounded-lg bg-[#322D27] text-white text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-2 border border-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          <span>{activeTooltip.name}</span>
          {activeTooltip.badge && <span className="scale-90">{activeTooltip.badge}</span>}
          <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px border-4 border-transparent border-r-[#322D27]" />
        </div>,
        document.body
      )}
    </>
  );
}
