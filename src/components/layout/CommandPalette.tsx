'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  CheckSquare,
  Flame,
  Timer,
  Calendar,
  Settings,
  Bell,
  Plus,
  ArrowRight,
  Download,
  Leaf
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    tasks,
    routines,
    openTaskModal,
    sendTestNotification,
    exportData,
    toggleTaskComplete
  } = useTaskora();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const staticActions = useMemo(() => [
    {
      id: 'action-new-task',
      title: 'Create New Task',
      subtitle: 'Open task scheduler modal',
      icon: Plus,
      category: 'Actions',
      run: () => { closeCommandPalette(); openTaskModal(); }
    },
    {
      id: 'action-focus',
      title: 'Start 25m Focus Session',
      subtitle: 'Launch Pomodoro timer & ambient sounds',
      icon: Timer,
      category: 'Actions',
      run: () => { closeCommandPalette(); router.push('/focus'); }
    },
    {
      id: 'action-calendar',
      title: 'Open Calendar Schedule',
      subtitle: 'View monthly and weekly schedule',
      icon: Calendar,
      category: 'Navigation',
      run: () => { closeCommandPalette(); router.push('/calendar'); }
    },
    {
      id: 'action-tour',
      title: 'Experience Product Tour',
      subtitle: 'Landing page with feature showcase',
      icon: Leaf,
      category: 'Explore',
      run: async () => {
        closeCommandPalette();
        if (user) {
          await signOutUser();
        }
        router.push('/welcome?mode=tour');
      }
    },
    {
      id: 'action-routines',
      title: 'Check Daily Routines & Streaks',
      subtitle: 'Track your recurring habits',
      icon: Flame,
      category: 'Navigation',
      run: () => { closeCommandPalette(); router.push('/routines'); }
    },
    {
      id: 'action-test-notif',
      title: 'Send Test Notification',
      subtitle: 'Dispatch browser notification reminder',
      icon: Bell,
      category: 'System',
      run: () => { closeCommandPalette(); sendTestNotification(); }
    },
    {
      id: 'action-export',
      title: 'Export Workspace Data (JSON)',
      subtitle: 'Download full backup of tasks and routines',
      icon: Download,
      category: 'System',
      run: () => {
        closeCommandPalette();
        const json = exportData();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskora-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    },
    {
      id: 'action-settings',
      title: 'Preferences & Profile',
      subtitle: 'Customize themes, hours, and goals',
      icon: Settings,
      category: 'Navigation',
      run: () => { closeCommandPalette(); router.push('/settings'); }
    }
  ], [closeCommandPalette, openTaskModal, router, sendTestNotification, exportData, user, signOutUser]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staticActions;

    const matchedActions = staticActions.filter(a =>
      a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );

    const matchedTasks = tasks
      .filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)))
      .slice(0, 5)
      .map(t => ({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: `${t.category.toUpperCase()} • Due: ${t.dueDate} ${t.dueTime || ''} (${t.status})`,
        icon: CheckSquare,
        category: 'Tasks',
        run: () => { closeCommandPalette(); toggleTaskComplete(t.id); }
      }));

    const matchedRoutines = routines
      .filter(r => r.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({
        id: `routine-${r.id}`,
        title: r.title,
        subtitle: `${r.currentStreak} day streak • ${r.targetFrequency}`,
        icon: Flame,
        category: 'Routines',
        run: () => { closeCommandPalette(); router.push('/routines'); }
      }));

    return [...matchedActions, ...matchedTasks, ...matchedRoutines];
  }, [query, staticActions, tasks, routines, closeCommandPalette, toggleTaskComplete, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) results[selectedIndex].run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
            className="fixed inset-0 glass-backdrop cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="relative w-full max-w-xl glass-modal border border-[#E7E0D5]/90 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#E7E0D5] gap-3">
              <Search className="w-5 h-5 text-[#718368] shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search tasks & habits..."
                className="w-full bg-transparent text-[#403B34] placeholder-[#968D81] text-sm focus:outline-none"
              />
              <span className="text-[11px] font-mono bg-[#F0EBE2] text-[#968D81] px-2 py-0.5 rounded border border-[#E7E0D5]">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-84 overflow-y-auto p-2 space-y-1">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#968D81]">
                  No matching tasks, routines, or actions found.
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.run()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EAF0E5] text-[#403B34] border border-[#718368]/20'
                          : 'text-[#756E64] hover:bg-[#F7F4EE] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#D9E8D3] text-[#718368]' : 'bg-[#F0EBE2] text-[#968D81]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#403B34] truncate">{item.title}</p>
                          <p className="text-xs text-[#968D81] truncate">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-[#968D81] tracking-wider">
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#718368]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2 bg-[#FBF9F5] border-t border-[#E7E0D5] flex items-center justify-between text-[11px] text-[#968D81]">
              <div className="flex items-center gap-4 font-medium">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[#718368] font-semibold">Taskora Commands</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
