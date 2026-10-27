'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';
import { Routine } from '@/types/routine';
import { FocusSession, FocusSettings } from '@/types/focus';
import { NotificationSettings } from '@/types/notification';
import { UserProfile, AppToast } from '@/types/profile';
import {
  StorageService,
  TaskoraStoreState,
  DEFAULT_FOCUS_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_USER_PROFILE,
  GUEST_ACTIVE_TASK_LIMIT
} from '@/features/persistence/storage-service';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { RoutineService } from '@/features/routines/routine-service';
import { NotificationService } from '@/features/notifications/notification-service';
import {
  subscribeToWebPush,
  syncTaskReminderToServer,
  cancelTaskReminderOnServer,
  isWebPushSupported,
  getCurrentPushSubscription,
} from '@/features/notifications/web-push-client';
import { soundService } from '@/features/audio/sound-service';
import { CustomSoundStorage } from '@/features/audio/custom-sound-storage';
import { applyTheme, getSavedTheme } from '@/features/theme/theme-config';
import { useAuth } from '@/context/AuthContext';

interface TaskoraContextValue {
  todayStr: string;

  // Tasks
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  rescheduleTask: (taskId: string, newDate: string, newTime?: string, newDuration?: number, reason?: string) => void;
  undoScheduleChange: () => boolean;
  canUndoSchedule: boolean;

  // Routines
  routines: Routine[];
  addRoutine: (routineData: Omit<Routine, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutine: (id: string, dateStr?: string) => void;

  // Focus
  focusSessions: FocusSession[];
  focusSettings: FocusSettings;
  updateFocusSettings: (updates: Partial<FocusSettings>) => void;
  logFocusSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;

  // Notifications
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  sendTestNotification: () => Promise<{ success: boolean; message: string }>;
  customSoundDataUrl: string | null;
  refreshCustomSound: () => Promise<void>;

  // Toasts
  toasts: AppToast[];
  addToast: (toast: Omit<AppToast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Profile & Settings
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Modals & UI Controls
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  openTaskModal: (taskToEdit?: Task | null, defaultDate?: string) => void;
  closeTaskModal: () => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Storage
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetData: () => void;
}

const TaskoraContext = createContext<TaskoraContextValue | undefined>(undefined);

export function TaskoraProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayStr, setTodayStr] = useState(ScheduleService.FALLBACK_DATE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [focusSettings, setFocusSettings] = useState<FocusSettings>(DEFAULT_FOCUS_SETTINGS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // UI state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  // Auth integration - Scopes task and routine data by Firebase UID or guest session
  const { user: authUser, isGuest, openGuestLock } = useAuth();
  const authUid = authUser?.uid || (isGuest ? 'guest' : null);

  // Custom audio persistence state
  const [customSoundDataUrl, setCustomSoundDataUrl] = useState<string | null>(null);
  const customSoundDataUrlRef = useRef<string | null>(null);

  const refreshCustomSound = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = await CustomSoundStorage.getCustomAudio(authUid || 'guest');
    setCustomSoundDataUrl(url);
    customSoundDataUrlRef.current = url;
  }, [authUid]);

  useEffect(() => {
    refreshCustomSound();
  }, [refreshCustomSound]);

  // Track already notified tasks to prevent duplicate alerts
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  // Load state on client mount or when authenticated user changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayStr(ScheduleService.getTodayDateString());
    notifiedRemindersRef.current.clear();
    const state = StorageService.loadState(authUid);
    setTasks(state.tasks);
    setRoutines(state.routines);
    setFocusSessions(state.focusSessions);
    setFocusSettings(state.focusSettings);
    setNotificationSettings({
      ...state.notificationSettings,
      permission: NotificationService.getPermission()
    });

    // Merge authenticated user info if logged in with Firebase (Google, Email)
    const updatedProfile: UserProfile = {
      ...state.userProfile,
      ...(authUser ? {
        name: authUser.displayName || state.userProfile.name || 'Taskora Member',
        email: authUser.email || (authUser.phoneNumber ? `Phone: ${authUser.phoneNumber}` : state.userProfile.email || ''),
        avatarUrl: authUser.photoURL || state.userProfile.avatarUrl || '',
      } : {})
    };

    setUserProfile(updatedProfile);
    setIsLoaded(true);

    // Apply active theme immediately on client mount
    const activeTheme = updatedProfile?.accentColor || getSavedTheme();
    applyTheme(activeTheme);

    // Initial check: if already granted, verify SW push subscription
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      getCurrentPushSubscription().then((sub) => {
        if (!sub && isWebPushSupported()) {
          // Re-subscribe silently if permission was granted
          subscribeToWebPush().catch(() => {});
        }
      });
    }
  }, [authUid, authUser]);

  // Save state on changes (scoped to authenticated user)
  useEffect(() => {
    if (!isLoaded) return;
    const state: TaskoraStoreState = {
      version: 1,
      tasks,
      routines,
      focusSessions,
      focusSettings,
      notificationSettings,
      userProfile
    };
    StorageService.saveState(state, authUid);
  }, [isLoaded, tasks, routines, focusSessions, focusSettings, notificationSettings, userProfile, authUid]);

  // Toast manager
  const addToast = useCallback((toast: Omit<AppToast, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    const newToast: AppToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    const duration = toast.duration || 4000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Keyboard shortcut listener (Cmd/Ctrl+K for palette, N for new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (
        e.key === 'n' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        !isTaskModalOpen &&
        !isCommandPaletteOpen
      ) {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsTaskModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isCommandPaletteOpen]);

  // Service Worker Message Listener (Handles click navigation & background snooze events)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'TASKORA_NAVIGATE') {
        const taskId = data.taskId;
        if (taskId) {
          const targetTask = tasks.find((t) => t.id === taskId);
          if (targetTask) {
            setEditingTask(targetTask);
            setIsTaskModalOpen(true);
          }
        }
      } else if (data.type === 'TASKORA_SNOOZE') {
        const { taskId, snoozeMinutes } = data;
        const targetTask = tasks.find((t) => t.id === taskId);
        addToast({
          title: 'Reminder Snoozed ⏱',
          message: targetTask
            ? `"${targetTask.title}" snoozed for ${snoozeMinutes || 10} minutes.`
            : `Snoozed for ${snoozeMinutes || 10} minutes.`,
          type: 'info',
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
  }, [tasks, addToast]);

  // Periodic In-App Reminder Check Engine (runs every 30 seconds for foreground toasts)
  useEffect(() => {
    if (!isLoaded) return;

    const checkInterval = setInterval(() => {
      const { dueTasks, newlyNotifiedIds } = NotificationService.checkDueReminders(
        tasks,
        notificationSettings,
        notifiedRemindersRef.current
      );

      if (dueTasks.length > 0) {
        newlyNotifiedIds.forEach(id => notifiedRemindersRef.current.add(id));
        
        dueTasks.forEach(task => {
          if (notificationSettings.soundAlerts && notificationSettings.soundId !== 'silent') {
            soundService.playNotificationSound(
              notificationSettings.soundId || 'soft-chime',
              notificationSettings.soundVolume ?? 0.7,
              customSoundDataUrlRef.current
            );
          }

          NotificationService.sendBrowserNotification(
            `Task Reminder: ${task.title}`,
            `Due ${task.dueTime ? `at ${task.dueTime}` : 'today'} (${task.priority.toUpperCase()} priority)`,
            notificationSettings,
            `task-${task.id}`,
            `/tasks?taskId=${task.id}`
          );

          if (notificationSettings.inAppToastEnabled) {
            addToast({
              title: `Task Reminder: ${task.title}`,
              message: `Scheduled for ${task.dueTime || 'today'} (${task.category})`,
              type: task.priority === 'critical' ? 'error' : 'warning',
              duration: 6000
            });
          }
        });
      }
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [isLoaded, tasks, notificationSettings, addToast]);

  // --- TASK ACTIONS ---
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (isGuest) {
      const activeTasksCount = tasks.filter(t => t.status !== 'completed').length;
      if (activeTasksCount >= GUEST_ACTIVE_TASK_LIMIT) {
        openGuestLock(
          'Unlock Unlimited Tasks',
          `You have reached the ${GUEST_ACTIVE_TASK_LIMIT}-task limit for temporary guest sessions. Create a free account to track unlimited tasks and sync across all your devices.`
        );
        addToast({
          title: 'Guest Limit Reached',
          message: `Temporary guest sessions are limited to ${GUEST_ACTIVE_TASK_LIMIT} active tasks. Sign in to save unlimited tasks!`,
          type: 'info',
        });
        return;
      }
    }

    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);

    // Durable scheduling: Sync reminder to backend store only for authenticated customers
    if (!isGuest && newTask.dueDate && newTask.reminder && (newTask.reminder as string) !== 'none') {
      syncTaskReminderToServer(newTask, 'schedule');
    }

    addToast({ title: 'Task Created', message: newTask.title, type: 'success' });
    soundService.playClick();
  }, [isGuest, tasks, openGuestLock, addToast]);

  // Undo history for schedule adjustments
  const [scheduleHistory, setScheduleHistory] = useState<{
    taskId: string;
    taskTitle: string;
    prevDueDate: string;
    prevDueTime?: string;
    prevEstimatedMinutes?: number;
    newDueDate: string;
    newDueTime?: string;
    newEstimatedMinutes?: number;
    reason?: string;
  }[]>([]);

  const undoScheduleChange = useCallback((): boolean => {
    if (scheduleHistory.length === 0) return false;
    const lastItem = scheduleHistory[scheduleHistory.length - 1];
    setScheduleHistory(prev => prev.slice(0, -1));

    setTasks(prev => prev.map(t => {
      if (t.id !== lastItem.taskId) return t;
      const restored = {
        ...t,
        dueDate: lastItem.prevDueDate,
        dueTime: lastItem.prevDueTime,
        estimatedMinutes: lastItem.prevEstimatedMinutes,
      };
      // Reschedule restored reminder on server
      syncTaskReminderToServer(restored, 'schedule');
      return restored;
    }));

    soundService.playClick();
    addToast({
      title: 'Schedule Change Reverted',
      message: `Restored "${lastItem.taskTitle}" to ${lastItem.prevDueTime || 'unscheduled'} (${lastItem.prevDueDate})`,
      type: 'info'
    });
    return true;
  }, [scheduleHistory, addToast]);

  const rescheduleTask = useCallback((
    taskId: string,
    newDate: string,
    newTime?: string,
    newDuration?: number,
    reason?: string
  ) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const historyEntry = {
      taskId,
      taskTitle: targetTask.title,
      prevDueDate: targetTask.dueDate,
      prevDueTime: targetTask.dueTime,
      prevEstimatedMinutes: targetTask.estimatedMinutes,
      newDueDate: newDate,
      newDueTime: newTime,
      newEstimatedMinutes: newDuration !== undefined ? newDuration : targetTask.estimatedMinutes,
      reason,
    };

    setScheduleHistory(prev => [...prev, historyEntry]);

    const updatedTask = {
      ...targetTask,
      dueDate: newDate,
      dueTime: newTime,
      estimatedMinutes: newDuration !== undefined ? newDuration : targetTask.estimatedMinutes,
    };

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));

    // Reschedule durable reminder on server
    syncTaskReminderToServer(updatedTask, 'schedule');

    soundService.playClick();
    addToast({
      title: 'Schedule Updated',
      message: `Moved "${targetTask.title}" to ${newTime || 'anytime'} (${newDate})`,
      type: 'success',
      duration: 6000,
      actionLabel: 'Undo',
      onAction: () => {
        undoScheduleChange();
      }
    });
  }, [tasks, undoScheduleChange, addToast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };

      // If status changed to completed, cancel reminder on server
      if (updates.status === 'completed') {
        cancelTaskReminderOnServer(id);
      } else if (updates.dueDate || updates.dueTime || updates.reminder || updates.timezone || updates.title) {
        // Reschedule on server
        syncTaskReminderToServer(updated, 'schedule');
      }

      return updated;
    }));
    addToast({ title: 'Task Updated', type: 'info' });
  }, [addToast]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    // Cancel server reminder
    cancelTaskReminderOnServer(id);
    addToast({ title: 'Task Deleted', type: 'info' });
    soundService.playClick();
  }, [addToast]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;

      const isBecomingComplete = t.status !== 'completed';
      if (isBecomingComplete) {
        soundService.playTaskComplete();
        addToast({ title: 'Task Completed! 🎉', message: t.title, type: 'success' });

        // Cancel pending server reminder for completed task
        cancelTaskReminderOnServer(id);

        if (t.recurrence && t.recurrence !== 'none') {
          const nextDate = ScheduleService.calculateNextDueDate(t.dueDate, t.recurrence);
          const recurringClone: Task = {
            ...t,
            id: 'task-' + Date.now().toString(36),
            dueDate: nextDate,
            status: 'todo',
            completedAt: undefined,
            createdAt: new Date().toISOString(),
            subtasks: t.subtasks.map(s => ({ ...s, completed: false }))
          };

          // Schedule reminder for the next recurring occurrence on server
          syncTaskReminderToServer(recurringClone, 'schedule');

          setTimeout(() => {
            setTasks(current => [recurringClone, ...current]);
            addToast({
              title: `Recurring Task Scheduled`,
              message: `Next instance due on ${nextDate}`,
              type: 'info'
            });
          }, 600);
        }

        return {
          ...t,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          subtasks: t.subtasks.map(s => ({ ...s, completed: true }))
        };
      } else {
        // Uncompleted: reschedule reminder on server
        soundService.playClick();
        const uncompletedTask: Task = {
          ...t,
          status: 'todo' as const,
          completedAt: undefined
        };
        syncTaskReminderToServer(uncompletedTask, 'schedule');

        return uncompletedTask;
      }
    }));
  }, [addToast]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updatedSubtasks = t.subtasks.map(s => (s.id === subtaskId ? { ...s, completed: !s.completed } : s));
      soundService.playClick();
      return { ...t, subtasks: updatedSubtasks };
    }));
  }, []);

  // --- ROUTINE ACTIONS ---
  const addRoutine = useCallback((routineData: Omit<Routine, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => {
    if (isGuest) {
      openGuestLock(
        'Unlock Habit Streaks & Routines',
        'Habit rituals, 28-day consistency tracking, and streaks require an authenticated account so your long-term momentum is never lost.'
      );
      addToast({
        title: 'Account Required',
        message: 'Sign in with Google or Email to build compounding routines & streaks!',
        type: 'info',
      });
      return;
    }

    const newRoutine: Routine = {
      ...routineData,
      id: 'routine-' + Date.now().toString(36),
      currentStreak: 0,
      bestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      active: true
    };
    setRoutines(prev => [...prev, newRoutine]);
    addToast({ title: 'Routine Created', message: newRoutine.title, type: 'success' });
    soundService.playClick();
  }, [isGuest, openGuestLock, addToast]);

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    addToast({ title: 'Routine Updated', type: 'info' });
  }, [addToast]);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    addToast({ title: 'Routine Removed', type: 'info' });
    soundService.playClick();
  }, [addToast]);

  const toggleRoutine = useCallback((id: string, dateStr?: string) => {
    const targetDate = dateStr || ScheduleService.getTodayDateString();
    setRoutines(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = RoutineService.toggleRoutineCompletion(r, targetDate);
      if (updated.completedDates.includes(targetDate)) {
        soundService.playTaskComplete(0.2);
        addToast({
          title: `Routine Check-in! 🔥`,
          message: `${updated.title} — ${updated.currentStreak} day streak!`,
          type: 'success'
        });
      } else {
        soundService.playClick();
      }
      return updated;
    }));
  }, [addToast]);

  // --- FOCUS ACTIONS ---
  const updateFocusSettings = useCallback((updates: Partial<FocusSettings>) => {
    setFocusSettings(prev => ({ ...prev, ...updates }));
    soundService.playClick();
    addToast({ title: 'Focus Preferences Updated', type: 'info' });
  }, [addToast]);

  const logFocusSession = useCallback((sessionData: Omit<FocusSession, 'id' | 'completedAt'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: 'focus-' + Date.now().toString(36),
      completedAt: new Date().toISOString()
    };
    setFocusSessions(prev => [newSession, ...prev]);
    soundService.playSessionEnd();
    addToast({
      title: 'Focus Session Logged 🎯',
      message: `${Math.round(newSession.durationSeconds / 60)} minutes of concentrated output!`,
      type: 'success'
    });
  }, [addToast]);

  // --- NOTIFICATION ACTIONS ---
  const updateNotificationSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
    soundService.playClick();
    addToast({ title: 'Notification Settings Saved', type: 'info' });
  }, [addToast]);

  const requestNotificationPermission = useCallback(async () => {
    const result = await subscribeToWebPush();
    const perm = result.permission || NotificationService.getPermission();
    setNotificationSettings(prev => ({
      ...prev,
      permission: perm,
      browserEnabled: perm === 'granted',
    }));

    if (result.success) {
      addToast({
        title: 'Background Push Active 🎉',
        message: 'This device is registered for native push reminders, even when closed.',
        type: 'success',
      });
      soundService.playTaskComplete(0.2);

      // Reconcile and schedule any existing pending tasks with reminders
      tasks.forEach((task) => {
        if (task.status !== 'completed' && task.dueDate && task.reminder) {
          syncTaskReminderToServer(task, 'schedule');
        }
      });
    } else if (perm === 'granted') {
      addToast({
        title: 'Browser Notifications Allowed',
        message: 'Notification permission is active.',
        type: 'info',
      });
    } else if (perm === 'denied') {
      addToast({
        title: 'Notifications Blocked',
        message: 'Permissions are blocked in browser preferences. Please allow from your address bar.',
        type: 'warning',
      });
    }
    return perm;
  }, [tasks, addToast]);

  const sendTestNotification = useCallback(async () => {
    try {
      const res = await NotificationService.triggerTestAsync(notificationSettings);
      if (res.success) {
        addToast({ title: 'Test Alert Sent', message: res.message, type: 'success' });
        if (notificationSettings.soundAlerts && notificationSettings.soundId !== 'silent') {
          soundService.playNotificationSound(
            notificationSettings.soundId || 'soft-chime',
            notificationSettings.soundVolume ?? 0.7,
            customSoundDataUrlRef.current
          );
        }
      } else {
        addToast({ title: 'Test Alert Status', message: res.message, type: 'warning' });
      }
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred while dispatching test alert.';
      addToast({ title: 'Test Alert Failed', message: msg, type: 'error' });
      return { success: false, message: msg };
    }
  }, [notificationSettings, addToast]);

  // --- PROFILE ACTIONS ---
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (updates.accentColor) {
      applyTheme(updates.accentColor);
    }
    setUserProfile(prev => ({ ...prev, ...updates }));
    soundService.playClick();
    addToast({ title: 'Profile Updated', type: 'success' });
  }, [addToast]);

  // --- MODAL CONTROLS ---
  const openTaskModal = useCallback((taskToEdit?: Task | null, defaultDate?: string) => {
    if (taskToEdit) {
      setEditingTask(taskToEdit);
    } else if (defaultDate) {
      setEditingTask({
        id: '',
        title: '',
        category: 'work',
        priority: 'medium',
        status: 'todo',
        dueDate: defaultDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        recurrence: 'none',
        reminder: '15m',
        subtasks: [],
        createdAt: ''
      });
    } else {
      setEditingTask(null);
    }
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // --- STORAGE ACTIONS ---
  const exportData = useCallback(() => {
    const state: TaskoraStoreState = {
      version: 1,
      tasks,
      routines,
      focusSessions,
      focusSettings,
      notificationSettings,
      userProfile
    };
    return StorageService.exportJSON(state);
  }, [tasks, routines, focusSessions, focusSettings, notificationSettings, userProfile]);

  const importData = useCallback((jsonStr: string) => {
    const imported = StorageService.importJSON(jsonStr, authUid);
    if (imported) {
      setTasks(imported.tasks);
      setRoutines(imported.routines);
      setFocusSessions(imported.focusSessions);
      setFocusSettings(imported.focusSettings);
      setNotificationSettings(imported.notificationSettings);
      setUserProfile(imported.userProfile);
      if (imported.userProfile?.accentColor) {
        applyTheme(imported.userProfile.accentColor);
      }
      addToast({ title: 'Backup Restored Successfully', type: 'success' });
      soundService.playTaskComplete();
      return true;
    } else {
      addToast({ title: 'Import Failed', message: 'Invalid Taskora backup format.', type: 'error' });
      return false;
    }
  }, [addToast, authUid]);

  const resetData = useCallback(() => {
    const def = StorageService.resetToDefault(authUid);
    setTasks(def.tasks);
    setRoutines(def.routines);
    setFocusSessions(def.focusSessions);
    setFocusSettings(def.focusSettings);
    setNotificationSettings(def.notificationSettings);
    setUserProfile(def.userProfile);
    applyTheme('warm-neutral');
    addToast({ title: 'Workspace Reset', message: 'Cleared workspace data and started with a clean slate.', type: 'info' });
    soundService.playClick();
  }, [addToast, authUid]);

  return (
    <TaskoraContext.Provider
      value={{
        todayStr,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutine,
        focusSessions,
        focusSettings,
        updateFocusSettings,
        logFocusSession,
        notificationSettings,
        updateNotificationSettings,
        requestNotificationPermission,
        sendTestNotification,
        customSoundDataUrl,
        refreshCustomSound,
        toasts,
        addToast,
        removeToast,
        userProfile,
        updateProfile,
        isTaskModalOpen,
        editingTask,
        openTaskModal,
        closeTaskModal,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        rescheduleTask,
        undoScheduleChange,
        canUndoSchedule: scheduleHistory.length > 0,
        exportData,
        importData,
        resetData
      }}
    >
      {children}
    </TaskoraContext.Provider>
  );
}

export function useTaskora() {
  const context = useContext(TaskoraContext);
  if (!context) {
    throw new Error('useTaskora must be used within a TaskoraProvider');
  }
  return context;
}
