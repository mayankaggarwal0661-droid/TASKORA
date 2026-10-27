import { Task } from '@/types/task';
import { Routine } from '@/types/routine';
import { FocusSession, FocusSettings } from '@/types/focus';
import { NotificationSettings } from '@/types/notification';
import { UserProfile } from '@/types/profile';

export interface TaskoraStoreState {
  version: number;
  tasks: Task[];
  routines: Routine[];
  focusSessions: FocusSession[];
  focusSettings: FocusSettings;
  notificationSettings: NotificationSettings;
  userProfile: UserProfile;
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  soundEnabled: true,
  ambientSound: 'rain',
  ambientVolume: 0.4,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  permission: 'default',
  browserEnabled: true,
  inAppToastEnabled: true,
  defaultLeadTime: '15m',
  quietHoursEnabled: true,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  dailyDigestEnabled: true,
  dailyDigestTime: '08:30',
  soundAlerts: true,
  soundId: 'soft-chime',
  soundVolume: 0.7,
  customSound: null,
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Taskora Member',
  email: '',
  avatarUrl: '',
  role: 'Productivity Explorer',
  timezone: 'UTC',
  accentColor: 'warm-neutral',
  weeklyGoalHours: 35,
  dailyTaskGoal: 5,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const STORAGE_KEY = 'taskora_ecosystem_v1';

// Confirmed demonstration record IDs from original development templates
const CONFIRMED_DEMO_TASK_IDS = new Set([
  'task-1',
  'task-2',
  'task-3',
  'task-4',
  'task-5',
  'task-6',
]);
const CONFIRMED_DEMO_ROUTINE_IDS = new Set([
  'routine-1',
  'routine-2',
  'routine-3',
  'routine-4',
]);
const CONFIRMED_DEMO_FOCUS_IDS = new Set(['focus-1', 'focus-2']);

export const GUEST_ACTIVE_TASK_LIMIT = 5;

export class StorageService {
  /**
   * Configurable active task limit for temporary guest sessions
   */
  public static readonly GUEST_TASK_LIMIT = GUEST_ACTIVE_TASK_LIMIT;

  /**
   * Generates a clean empty workspace state for real customers
   */
  public static getInitialState(): TaskoraStoreState {
    return {
      version: 1,
      tasks: [],
      routines: [],
      focusSessions: [],
      focusSettings: DEFAULT_FOCUS_SETTINGS,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      userProfile: DEFAULT_USER_PROFILE,
    };
  }

  public static getStorageKey(userId?: string | null): string {
    return userId ? `taskora_ecosystem_v1_${userId}` : STORAGE_KEY;
  }

  /**
   * Retrieve temporary tasks created during guest mode for migration to customer account
   */
  public static getGuestTasks(): Task[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('taskora_ecosystem_v1_guest');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as TaskoraStoreState;
      return Array.isArray(parsed?.tasks) ? parsed.tasks : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear temporary guest tasks following a successful account migration
   */
  public static clearGuestTasks(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('taskora_ecosystem_v1_guest');
      if (raw) {
        const parsed = JSON.parse(raw) as TaskoraStoreState;
        parsed.tasks = [];
        localStorage.setItem('taskora_ecosystem_v1_guest', JSON.stringify(parsed));
      }
    } catch {}
  }

  /**
   * Load store state from localStorage (scoped to user identity)
   * Safely purges confirmed demonstration records while preserving customer data
   */
  public static loadState(userId?: string | null): TaskoraStoreState {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }

    const key = this.getStorageKey(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const init = this.getInitialState();
        this.saveState(init, userId);
        return init;
      }
      const parsed = JSON.parse(raw) as TaskoraStoreState;
      if (!parsed.version || parsed.version < 1) {
        const fresh = this.getInitialState();
        this.saveState(fresh, userId);
        return fresh;
      }

      // 1. Purge confirmed demonstration data while strictly keeping actual user records
      let stateChanged = false;

      if (Array.isArray(parsed.tasks)) {
        const originalCount = parsed.tasks.length;
        parsed.tasks = parsed.tasks.filter((t) => !CONFIRMED_DEMO_TASK_IDS.has(t.id));
        if (parsed.tasks.length !== originalCount) stateChanged = true;
      } else {
        parsed.tasks = [];
      }

      if (Array.isArray(parsed.routines)) {
        const originalCount = parsed.routines.length;
        parsed.routines = parsed.routines.filter((r) => !CONFIRMED_DEMO_ROUTINE_IDS.has(r.id));
        if (parsed.routines.length !== originalCount) stateChanged = true;
      } else {
        parsed.routines = [];
      }

      if (Array.isArray(parsed.focusSessions)) {
        const originalCount = parsed.focusSessions.length;
        parsed.focusSessions = parsed.focusSessions.filter((s) => !CONFIRMED_DEMO_FOCUS_IDS.has(s.id));
        if (parsed.focusSessions.length !== originalCount) stateChanged = true;
      } else {
        parsed.focusSessions = [];
      }

      // 2. Purge hardcoded Alex Rivera demo profile
      if (
        parsed.userProfile &&
        parsed.userProfile.name === 'Alex Rivera' &&
        parsed.userProfile.email === 'alex.rivera@taskora.io'
      ) {
        parsed.userProfile = {
          ...DEFAULT_USER_PROFILE,
          accentColor: parsed.userProfile.accentColor || DEFAULT_USER_PROFILE.accentColor,
        };
        stateChanged = true;
      }

      // 3. Ensure notification settings include sound presets
      parsed.notificationSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed.notificationSettings,
      };

      if (parsed.userProfile && parsed.userProfile.accentColor) {
        // Fallback / legacy mapping
        const rawAccent = parsed.userProfile.accentColor.toLowerCase();
        if (rawAccent === 'sage') parsed.userProfile.accentColor = 'sage-green';
        else if (rawAccent === 'sienna') parsed.userProfile.accentColor = 'sienna-clay';
        else if (rawAccent === 'amber') parsed.userProfile.accentColor = 'sunset-amber';
        else if (rawAccent === 'emerald' || rawAccent === 'forest') parsed.userProfile.accentColor = 'forest-olive';
        else if (rawAccent === 'rose') parsed.userProfile.accentColor = 'terracotta-rose';
        else if (rawAccent === 'violet') parsed.userProfile.accentColor = 'muted-violet';
        else if (rawAccent === 'warm' || rawAccent === 'default') parsed.userProfile.accentColor = 'warm-neutral';
      }

      if (stateChanged) {
        this.saveState(parsed, userId);
      }

      return parsed;
    } catch {
      return this.getInitialState();
    }
  }

  /**
   * Persist state to localStorage (scoped to user identity)
   */
  public static saveState(state: TaskoraStoreState, userId?: string | null): void {
    if (typeof window === 'undefined') return;
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Taskora storage save error:', e);
    }
  }

  /**
   * Export all data as a formatted JSON string
   */
  public static exportJSON(state: TaskoraStoreState): string {
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import data from JSON string with basic validation
   */
  public static importJSON(jsonStr: string, userId?: string | null): TaskoraStoreState | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.routines)) {
        parsed.version = 1;
        this.saveState(parsed, userId);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Reset data to clean empty workspace state (scoped to user identity)
   */
  public static resetToDefault(userId?: string | null): TaskoraStoreState {
    const fresh = this.getInitialState();
    this.saveState(fresh, userId);
    return fresh;
  }
}
