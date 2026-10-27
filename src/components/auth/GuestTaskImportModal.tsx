'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/features/persistence/storage-service';
import { Task } from '@/types/task';
import { soundService } from '@/features/audio/sound-service';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import {
  UploadCloud,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

const IMPORT_DISMISSED_KEY = 'taskora_guest_import_dismissed_uid';

export function GuestTaskImportModal() {
  const { user, isGuest } = useAuth();
  const { tasks, addTask, addToast } = useTaskora();
  const [guestTasks, setGuestTasks] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Only trigger for authenticated customers (not guest sessions, not unauthenticated visitors)
    if (!user || isGuest) {
      setIsOpen(false);
      return;
    }

    try {
      const dismissedUid = sessionStorage.getItem(IMPORT_DISMISSED_KEY);
      if (dismissedUid === user.uid) {
        return;
      }

      const tempTasks = StorageService.getGuestTasks();
      if (tempTasks.length > 0) {
        setGuestTasks(tempTasks);
        setIsOpen(true);
      }
    } catch {}
  }, [user, isGuest]);

  const handleDismiss = () => {
    soundService.playClick();
    setIsOpen(false);
    try {
      if (user) {
        sessionStorage.setItem(IMPORT_DISMISSED_KEY, user.uid);
      }
      // Clear temporary guest storage so it doesn't prompt again
      StorageService.clearGuestTasks();
    } catch {}
  };

  const handleImport = async () => {
    if (guestTasks.length === 0 || isImporting) return;
    setIsImporting(true);
    soundService.playClick();

    try {
      // Import tasks with clean new IDs to guarantee no collisions
      guestTasks.forEach((gTask) => {
        addTask({
          title: gTask.title,
          description: gTask.description || '',
          category: gTask.category || 'work',
          priority: gTask.priority || 'medium',
          dueDate: gTask.dueDate,
          dueTime: gTask.dueTime,
          timezone: gTask.timezone || 'UTC',
          estimatedMinutes: gTask.estimatedMinutes || 30,
          status: gTask.status || 'todo',
          subtasks: Array.isArray(gTask.subtasks) ? gTask.subtasks : [],
          recurrence: gTask.recurrence || 'none',
          reminder: gTask.reminder || 'none',
        });
      });

      // Clear guest tasks after successful import
      StorageService.clearGuestTasks();
      if (user) {
        sessionStorage.setItem(IMPORT_DISMISSED_KEY, user.uid);
      }

      soundService.playTaskComplete();
      addToast({
        title: 'Guest Tasks Imported! 🎉',
        message: `Successfully transferred ${guestTasks.length} task${guestTasks.length > 1 ? 's' : ''} to your account.`,
        type: 'success',
      });
      setIsOpen(false);
    } catch (err) {
      console.error('Task import error:', err);
      addToast({
        title: 'Import Issue',
        message: 'Could not import all tasks. Your guest tasks remain intact in this browser.',
        type: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen || guestTasks.length === 0) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#403B34]/30 backdrop-blur-md"
          onClick={handleDismiss}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-[#E7E0D5] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#403B34] z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer"
            aria-label="Dismiss task import"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718368] bg-[#EAF0E5] px-2 py-0.5 rounded-full border border-[#718368]/20">
                Smooth Transition
              </span>
              <h2 id="import-modal-title" className="text-xl font-bold text-[#403B34] mt-0.5">
                Transfer your guest tasks?
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#756E64] mb-4">
            You created <strong>{guestTasks.length} temporary task{guestTasks.length > 1 ? 's' : ''}</strong> during your guest exploration. Would you like to save them to your account now?
          </p>

          {/* Task Preview List */}
          <div className="max-h-52 overflow-y-auto rounded-2xl bg-[#F7F4EE] border border-[#E7E0D5] p-3 space-y-2 mb-6">
            {guestTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E7E0D5]/80 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-2 h-2 rounded-full bg-[#718368]" />
                  <span className="text-xs font-semibold text-[#403B34] truncate">{t.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <CategoryBadge category={t.category} />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              disabled={isImporting}
              onClick={handleImport}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#718368] hover:bg-[#5F7157] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isImporting ? 'Importing Tasks...' : `Import ${guestTasks.length} Tasks to Account`}</span>
            </button>

            <button
              type="button"
              disabled={isImporting}
              onClick={handleDismiss}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer"
            >
              Start with clean slate
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
