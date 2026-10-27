'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { soundService } from '@/features/audio/sound-service';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Flame,
  Timer
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { openTaskModal } = useTaskora();

  const navItems = [
    { name: 'Home',     href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks',    href: '/tasks',     icon: CheckSquare },
    { name: 'Add',      href: '#',          icon: Plus, isAction: true },
    { name: 'Routines', href: '/routines',  icon: Flame },
    { name: 'Focus',    href: '/focus',     icon: Timer },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E7E0D5] px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          if (item.isAction) {
            return (
              <button
                key="action-add"
                type="button"
                onClick={() => {
                  soundService.playClick();
                  openTaskModal();
                }}
                className="-mt-5 w-12 h-12 rounded-full bg-[#718368] hover:bg-[#5F7157] flex items-center justify-center text-white shadow-lg border-2 border-[#F7F4EE] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                aria-label="Create new task"
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundService.playClick()}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#718368] font-semibold' : 'text-[#968D81] hover:text-[#756E64]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute -top-1.5 w-6 h-1 bg-[#718368] rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
