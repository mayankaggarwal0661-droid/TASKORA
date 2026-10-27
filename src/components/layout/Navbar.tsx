'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import {
  Search,
  Plus,
  Bell,
  Clock,
  Menu,
  Leaf,
  Zap,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export function Navbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { tasks, openCommandPalette, openTaskModal, notificationSettings, userProfile, todayStr } = useTaskora();
  const { user, isGuest, signOutUser, openGuestLock } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const { isVisible: isScrollVisible } = useScrollDirection({ thresholdDown: 8, thresholdUp: 6, topOffset: 24 });
  const menuRef = useRef<HTMLDivElement>(null);
  const nextUp = ScheduleService.getNextUpTask(tasks, todayStr);

  const shouldShowNavbar = isScrollVisible || isProfileOpen || isFocusWithin;

  const displayName = user?.displayName || userProfile?.name || (isGuest ? 'Guest Explorer' : 'Taskora Member');
  const displayEmail = user?.email || (isGuest ? 'Guest preview session' : userProfile?.email || 'workspace@taskora.io');
  const avatarLetter = (displayName.charAt(0) || 'T').toUpperCase();
  const activeTasksCount = tasks.filter(t => t.status !== 'completed').length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isProfileOpen]);

  return (
    <header
      onFocus={() => setIsFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocusWithin(false);
        }
      }}
      className={`sticky top-0 z-30 h-18 glass-surface border-b border-[#E7E0D5]/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        shouldShowNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Left side: Mobile Brand & Menu, Desktop Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-[#968D81] hover:text-[#403B34] rounded-lg hover:bg-[#F0EBE2] cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#718368] flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#403B34] text-base tracking-tight">Taskora</span>
        </Link>

        {/* Global Search / Command Palette Trigger */}
        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-3 py-2 px-3.5 rounded-xl bg-[#F7F4EE]/80 backdrop-blur-sm border border-[#E7E0D5] hover:border-[#718368]/50 text-[#968D81] hover:text-[#403B34] transition-all text-xs font-medium cursor-pointer w-64 md:w-80 group shadow-xs"
        >
          <Search className="w-4 h-4 group-hover:text-[#718368] transition-colors" />
          <span className="truncate">Search tasks, routines, or actions...</span>
          <kbd className="ml-auto flex items-center gap-0.5 text-[10px] bg-[#F0EBE2] text-[#968D81] px-1.5 py-0.5 rounded border border-[#E7E0D5] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Guest Mode Indicator Pill */}
        {isGuest && (
          <button
            type="button"
            onClick={() =>
              openGuestLock(
                'Unlock Unlimited Tasks & Cloud Sync',
                'Guests have temporary access with up to 5 active tasks. Create a free account to track unlimited tasks, habit streaks, and cloud backup.'
              )
            }
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#FAF0E6] hover:bg-[#F5E6D3] border border-[#B88762]/40 text-[#B88762] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group"
            title="Temporary guest session (click to unlock account)"
          >
            <Sparkles className="w-3 h-3 text-[#B88762] group-hover:rotate-12 transition-transform" />
            <span>Guest ({activeTasksCount}/5)</span>
            <span className="hidden sm:inline font-bold">· Upgrade</span>
          </button>
        )}

        {/* Next Up pill (Desktop) */}
        {nextUp.task && (
          <div className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#FBF9F5] border border-[#E7E0D5] text-xs">
            <Clock className={`w-3.5 h-3.5 ${nextUp.isOverdue ? 'text-[#B95750]' : 'text-[#718368]'}`} />
            <span className="text-[#756E64] font-medium">Next:</span>
            <span className="text-[#403B34] font-semibold max-w-[140px] truncate">{nextUp.task.title}</span>
            <span className={`text-[11px] font-mono px-1.5 rounded ${
              nextUp.isOverdue
                ? 'bg-[#F5E6E5] text-[#B95750] font-bold'
                : 'text-[#718368] bg-[#EAF0E5]'
            }`}>
              {nextUp.countdown}
            </span>
          </div>
        )}

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative p-2.5 text-[#968D81] hover:text-[#403B34] rounded-xl hover:bg-[#F0EBE2] transition-colors cursor-pointer"
          title="Notification Settings"
          aria-label="View Notification Settings"
        >
          <Bell className="w-4 h-4" />
          <span
            className={`absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white ${
              notificationSettings.permission === 'granted' ? 'bg-[#557B5C]' : 'bg-[#A97535]'
            }`}
          />
        </Link>

        {/* Focus Mode Quick Link */}
        <Link
          href="/focus"
          className="hidden sm:flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#EAF0E5] border border-[#718368]/20 text-[#718368] hover:bg-[#D9E8D3] transition-all text-xs font-semibold cursor-pointer"
          title="Start Focus Session"
        >
          <Zap className="w-3.5 h-3.5 text-[#718368]" />
          <span>Focus</span>
        </Link>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={() => openTaskModal()}
          className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#718368] hover:bg-[#5F7157] border border-[#718368] shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Profile Avatar & Glass Popover Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 pl-1 group cursor-pointer focus:outline-hidden"
            aria-expanded={isProfileOpen}
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-full ring-2 ring-[#E7E0D5] hover:ring-[#718368]/60 overflow-hidden bg-[#EAF0E5] flex items-center justify-center text-xs font-bold text-[#718368] transition-all shadow-xs">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span suppressHydrationWarning>{avatarLetter}</span>
              )}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-72 glass-surface-elevated rounded-2xl border border-[#E7E0D5]/90 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Identity info */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#E7E0D5]/80">
                <div className="w-10 h-10 rounded-full bg-[#EAF0E5] text-[#718368] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-1 ring-[#718368]/30">
                  {user?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span suppressHydrationWarning>{avatarLetter}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0" suppressHydrationWarning>
                  <p className="text-xs font-bold text-[#403B34] truncate" suppressHydrationWarning>{displayName}</p>
                  <p className="text-[11px] text-[#756E64] truncate" suppressHydrationWarning>{displayEmail}</p>
                  <div className="mt-1 flex items-center gap-1" suppressHydrationWarning>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#718368]" />
                    <span className="text-[10px] font-semibold text-[#718368]" suppressHydrationWarning>
                      {user ? 'Google Connected' : 'Guest Workspace'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="py-2 space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#403B34] hover:bg-[#F0EBE2] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#756E64]" />
                  <span>Profile & Appearance</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#403B34] hover:bg-[#F0EBE2] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#756E64]" />
                  <span>Security & Notifications</span>
                </Link>
              </div>

              {/* Account Actions */}
              <div className="pt-2 border-t border-[#E7E0D5]/80 space-y-1.5">
                {isGuest && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      openGuestLock('Save Your Progress Permanently');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#718368] hover:bg-[#5F7157] transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Save Account / Sign In</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOutUser();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#B95750] hover:bg-[#F5E6E5] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#B95750]" />
                  <span>{isGuest ? 'Exit Guest Mode' : 'Sign Out of Taskora'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
