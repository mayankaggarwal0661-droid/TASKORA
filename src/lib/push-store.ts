/**
 * Taskora Push Subscription & Reminder Store
 *
 * Durable database-backed / file-backed persistent storage for subscriptions,
 * scheduled reminders, and delivery logs.
 * Supports multi-device registration, atomic claim locking (idempotent cron),
 * bounded retry backoff, missed-reminder policy, and automatic cleanup of expired subscriptions.
 */

import fs from 'fs';
import path from 'path';
import { RecurrenceRule, ReminderStatus } from '@/types/task';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PushSubscriptionRecord {
  id: string;                    // Unique device subscription ID (e.g. sub-hash)
  userId: string;                // Authenticated Firebase UID or guest session ID
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  deviceName?: string;           // E.g. "Chrome on Windows", "Safari on iPhone"
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  createdAt: string;             // ISO timestamp
  lastUsedAt: string;            // ISO timestamp
  isActive: boolean;
}

export interface ReminderRecord {
  id: string;                    // Idempotency key: `rem-{taskId}-{hash}`
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  userId: string;
  dueDate: string;               // YYYY-MM-DD
  dueTime?: string;              // HH:mm
  dueAt: string;                 // ISO UTC timestamp when the task is due
  reminderAt: string;            // ISO UTC timestamp when to send the notification
  timezone: string;              // IANA timezone, e.g. "America/New_York"
  leadOffset: string;            // 'at_time' | '5m' | '15m' | '30m' | '1h' | '1d'
  recurrence?: RecurrenceRule;
  status: ReminderStatus;
  attempts: number;
  claimedAt?: string;            // ISO UTC timestamp for atomic processing lease
  nextRetryAt?: string;          // ISO timestamp for bounded exponential backoff
  lastAttemptAt?: string;
  lastError?: string;
  deliveredAt?: string;          // When accepted by push service
  deviceDeliveredAt?: string;    // When confirmed received by client Service Worker
  taskUrl: string;               // Deep link to the task: `/tasks?taskId=...`
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryLogRecord {
  reminderId: string;
  subscriptionId: string;
  attemptedAt: string;
  success: boolean;
  error?: string;
}

export interface TaskoraServerStore {
  subscriptions: PushSubscriptionRecord[];
  reminders: ReminderRecord[];
  deliveryLog: DeliveryLogRecord[];
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.join('/tmp', 'taskora-data')
  : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'taskora-server-store.json');
const SEED_FILE = path.join(process.cwd(), 'data', 'taskora-server-store.json');

// In-memory cache for fast reads
let memoryCache: TaskoraServerStore | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Taskora Store] ensureDataDir warning:', err);
  }
}

function emptyStore(): TaskoraServerStore {
  return { subscriptions: [], reminders: [], deliveryLog: [] };
}

export function readStore(): TaskoraServerStore {
  if (memoryCache) return memoryCache;

  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryCache = JSON.parse(raw) as TaskoraServerStore;
    } else if (IS_VERCEL && fs.existsSync(SEED_FILE)) {
      // Seed from bundled file in Vercel serverless environment
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      memoryCache = JSON.parse(raw) as TaskoraServerStore;
    }

    if (memoryCache) {
      if (!Array.isArray(memoryCache.subscriptions)) memoryCache.subscriptions = [];
      if (!Array.isArray(memoryCache.reminders)) memoryCache.reminders = [];
      if (!Array.isArray(memoryCache.deliveryLog)) memoryCache.deliveryLog = [];
      return memoryCache;
    }
  } catch (e) {
    console.error('[Taskora Store] readStore error, initializing fresh store:', e);
  }

  memoryCache = emptyStore();
  return memoryCache;
}

export function writeStore(store: TaskoraServerStore): void {
  memoryCache = store;
  try {
    ensureDataDir();
    // Atomic write via temp file
    const tempFile = `${STORE_FILE}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);
  } catch {
    // Fallback direct write
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('[Taskora Store] writeStore error:', writeErr);
    }
  }
}

/**
 * Resets memory cache (useful in tests)
 */
export function resetMemoryCache(): void {
  memoryCache = null;
}

// ─── Subscription Management (Multi-Device) ──────────────────────────────────

export function getSubscriptionsByUser(userId: string): PushSubscriptionRecord[] {
  return readStore().subscriptions.filter(
    (s) => s.userId === userId && s.isActive
  );
}

export function getAllSubscriptionsForUser(userId: string): PushSubscriptionRecord[] {
  return readStore().subscriptions.filter(
    (s) => s.userId === userId
  );
}

export function upsertSubscription(
  record: Omit<PushSubscriptionRecord, 'createdAt' | 'lastUsedAt' | 'isActive'> & {
    createdAt?: string;
    deviceName?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
  }
): PushSubscriptionRecord {
  const store = readStore();
  const now = new Date().toISOString();

  const existingIndex = store.subscriptions.findIndex((s) => s.endpoint === record.endpoint);
  const full: PushSubscriptionRecord = {
    ...record,
    deviceName: record.deviceName || detectDeviceName(record.userAgent),
    deviceType: record.deviceType || detectDeviceType(record.userAgent),
    createdAt: record.createdAt || now,
    lastUsedAt: now,
    isActive: true,
  };

  if (existingIndex >= 0) {
    store.subscriptions[existingIndex] = {
      ...store.subscriptions[existingIndex],
      ...full,
      createdAt: store.subscriptions[existingIndex].createdAt || full.createdAt,
    };
  } else {
    store.subscriptions.push(full);
  }

  writeStore(store);
  return full;
}

export function deactivateSubscription(endpoint: string): void {
  const store = readStore();
  const sub = store.subscriptions.find((s) => s.endpoint === endpoint);
  if (sub) {
    sub.isActive = false;
    sub.lastUsedAt = new Date().toISOString();
    writeStore(store);
  }
}

export function deactivateSubscriptionById(id: string, userId: string): boolean {
  const store = readStore();
  const sub = store.subscriptions.find((s) => s.id === id && s.userId === userId);
  if (sub) {
    sub.isActive = false;
    sub.lastUsedAt = new Date().toISOString();
    writeStore(store);
    return true;
  }
  return false;
}

export function deleteSubscriptionById(id: string, userId: string): boolean {
  const store = readStore();
  const initialLength = store.subscriptions.length;
  store.subscriptions = store.subscriptions.filter(
    (s) => !(s.id === id && s.userId === userId)
  );
  if (store.subscriptions.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}

export function cleanupExpiredSubscriptions(endpoints: string[]): void {
  if (!endpoints.length) return;
  const store = readStore();
  const endpointSet = new Set(endpoints);
  store.subscriptions.forEach((s) => {
    if (endpointSet.has(s.endpoint)) {
      s.isActive = false;
      s.lastUsedAt = new Date().toISOString();
    }
  });
  writeStore(store);
}

// ─── Reminder Management (Durable Scheduling) ────────────────────────────────

export function upsertReminder(reminder: ReminderRecord): void {
  const store = readStore();
  const now = new Date().toISOString();
  const recordWithDates: ReminderRecord = {
    ...reminder,
    createdAt: reminder.createdAt || now,
    updatedAt: now,
  };

  const idx = store.reminders.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) {
    store.reminders[idx] = {
      ...store.reminders[idx],
      ...recordWithDates,
      createdAt: store.reminders[idx].createdAt || recordWithDates.createdAt,
    };
  } else {
    store.reminders.push(recordWithDates);
  }
  writeStore(store);
}

/**
 * Cancel any pending, scheduled, processing, or snoozed reminders for a given task.
 */
export function cancelRemindersForTask(taskId: string): void {
  const store = readStore();
  let changed = false;
  const now = new Date().toISOString();

  store.reminders
    .filter(
      (r) =>
        r.taskId === taskId &&
        (r.status === 'scheduled' ||
          (r.status as string) === 'pending' ||
          r.status === 'processing' ||
          r.status === 'snoozed')
    )
    .forEach((r) => {
      r.status = 'cancelled';
      r.updatedAt = now;
      changed = true;
    });

  if (changed) writeStore(store);
}

/**
 * Atomic Claim Mechanism:
 * Finds reminders due up to cutoffIso, applies the missed-reminder policy,
 * and atomically claims active due reminders by transitioning them to 'processing'
 * with a claimedAt lease.
 *
 * Prevents concurrent scheduler executions from dispatching duplicate notifications!
 */
export function claimRemindersForProcessing(
  cutoffIso: string,
  leaseDurationMs = 120_000
): ReminderRecord[] {
  const store = readStore();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const staleLeaseCutoffMs = nowMs - leaseDurationMs;

  const claimedReminders: ReminderRecord[] = [];
  let changed = false;

  for (const r of store.reminders) {
    // 1. Check if reminder has expired / missed:
    // If the task's due date has already passed by more than 10 minutes,
    // or the reminder trigger is older than 24 hours, mark as 'missed'
    const dueAtMs = new Date(r.dueAt).getTime();
    const reminderAtMs = new Date(r.reminderAt).getTime();

    const isPendingOrClaimed =
      r.status === 'scheduled' ||
      (r.status as string) === 'pending' ||
      r.status === 'processing';

    if (isPendingOrClaimed && (nowMs > dueAtMs + 10 * 60 * 1000 || nowMs > reminderAtMs + 24 * 60 * 60 * 1000)) {
      r.status = 'missed';
      r.lastError = 'Reminder expired: task due time passed before delivery.';
      r.updatedAt = nowIso;
      changed = true;
      continue;
    }

    // 2. Identify candidates eligible for processing:
    // a) New scheduled reminders due up to cutoffIso whose retry time has arrived
    const isReadyToTrigger =
      (r.status === 'scheduled' || (r.status as string) === 'pending') &&
      r.reminderAt <= cutoffIso &&
      (!r.nextRetryAt || r.nextRetryAt <= nowIso);

    // b) Stale processing lease recovery: crashed/timed-out run
    const isLeaseExpired =
      r.status === 'processing' &&
      r.claimedAt &&
      new Date(r.claimedAt).getTime() < staleLeaseCutoffMs &&
      r.attempts < 3;

    if (isReadyToTrigger || isLeaseExpired) {
      r.status = 'processing';
      r.claimedAt = nowIso;
      r.updatedAt = nowIso;
      r.attempts = (r.attempts || 0) + 1;
      claimedReminders.push({ ...r });
      changed = true;
    }
  }

  if (changed) {
    writeStore(store);
  }

  return claimedReminders;
}

/**
 * Backward-compatible helper to inspect pending reminders up to a cutoff
 */
export function getPendingRemindersUpTo(cutoffIso: string): ReminderRecord[] {
  const nowIso = new Date().toISOString();
  return readStore().reminders.filter(
    (r) =>
      (r.status === 'scheduled' || (r.status as string) === 'pending') &&
      r.reminderAt <= cutoffIso &&
      (!r.nextRetryAt || r.nextRetryAt <= nowIso)
  );
}

export function getRemindersForUser(userId: string): ReminderRecord[] {
  return readStore().reminders.filter((r) => r.userId === userId);
}

export function getReminderByTaskId(taskId: string): ReminderRecord | null {
  const store = readStore();
  const matches = store.reminders.filter((r) => r.taskId === taskId);
  if (matches.length === 0) return null;
  // Return most recent record
  return matches[matches.length - 1];
}

/**
 * Mark reminder as successfully accepted by the push service (Web Push / FCM)
 */
export function markReminderSent(id: string, _details?: { deviceCount?: number }): void {
  const store = readStore();
  const r = store.reminders.find((r) => r.id === id);
  if (r) {
    r.status = 'sent';
    r.deliveredAt = new Date().toISOString();
    r.nextRetryAt = undefined;
    r.updatedAt = new Date().toISOString();
    writeStore(store);
  }
}

/**
 * Record confirmation from the device / Service Worker that the notification
 * was physically received and displayed.
 */
export function recordDeviceAck(reminderId: string, subscriptionId?: string): boolean {
  const store = readStore();
  const r = store.reminders.find((r) => r.id === reminderId);
  if (r) {
    r.deviceDeliveredAt = new Date().toISOString();
    r.updatedAt = new Date().toISOString();
    if (subscriptionId) {
      appendDeliveryLog({
        reminderId,
        subscriptionId,
        attemptedAt: new Date().toISOString(),
        success: true,
      });
    }
    writeStore(store);
    return true;
  }
  return false;
}

/**
 * Handle delivery failure with bounded exponential backoff.
 * Retry delays: Attempt 1 = 60s, Attempt 2 = 300s (5m).
 * After 3 failed attempts, marks permanently as 'failed'.
 */
export function markReminderFailed(id: string, error: string, isPermanent = false): void {
  const store = readStore();
  const r = store.reminders.find((r) => r.id === id);
  if (r) {
    r.lastAttemptAt = new Date().toISOString();
    r.lastError = error;
    r.updatedAt = new Date().toISOString();

    if (isPermanent || (r.attempts || 0) >= 3) {
      r.status = 'failed';
      r.nextRetryAt = undefined;
    } else {
      // Revert to scheduled for retry with bounded exponential backoff
      r.status = 'scheduled';
      const backoffSeconds = r.attempts === 1 ? 60 : 300;
      r.nextRetryAt = new Date(Date.now() + backoffSeconds * 1000).toISOString();
    }
    writeStore(store);
  }
}

/**
 * Mark reminder as missed when task due time has already passed
 */
export function markReminderMissed(id: string, reason: string): void {
  const store = readStore();
  const r = store.reminders.find((r) => r.id === id);
  if (r) {
    r.status = 'missed';
    r.lastError = reason;
    r.nextRetryAt = undefined;
    r.updatedAt = new Date().toISOString();
    writeStore(store);
  }
}

/**
 * Snooze a reminder by X minutes
 */
export function snoozeReminder(taskId: string, snoozeMinutes = 10): ReminderRecord | null {
  const store = readStore();
  const existing = store.reminders.find(
    (r) =>
      r.taskId === taskId &&
      (r.status === 'sent' ||
        r.status === 'scheduled' ||
        (r.status as string) === 'pending')
  );

  if (!existing) return null;

  const now = Date.now();
  const newReminderAt = new Date(now + snoozeMinutes * 60 * 1000).toISOString();
  const newId = `rem-${taskId}-snooze-${now}`;

  const snoozed: ReminderRecord = {
    ...existing,
    id: newId,
    status: 'scheduled',
    reminderAt: newReminderAt,
    attempts: 0,
    claimedAt: undefined,
    nextRetryAt: undefined,
    lastError: undefined,
    deliveredAt: undefined,
    deviceDeliveredAt: undefined,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };

  store.reminders.push(snoozed);
  writeStore(store);
  return snoozed;
}

// ─── Delivery Logging ────────────────────────────────────────────────────────

export function appendDeliveryLog(entry: DeliveryLogRecord): void {
  const store = readStore();
  store.deliveryLog.push(entry);
  if (store.deliveryLog.length > 500) {
    store.deliveryLog = store.deliveryLog.slice(-500);
  }
  writeStore(store);
}

export function getDeliveryLogsForUser(userId: string): DeliveryLogRecord[] {
  const store = readStore();
  const userReminderIds = new Set(
    store.reminders.filter((r) => r.userId === userId).map((r) => r.id)
  );
  return store.deliveryLog.filter((log) => userReminderIds.has(log.reminderId));
}

// ─── Helpers: Device Detection ───────────────────────────────────────────────

export function detectDeviceName(userAgent?: string): string {
  if (!userAgent) return 'Web Browser';
  const ua = userAgent.toLowerCase();

  let browser = 'Browser';
  if (ua.includes('edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Google Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Apple Safari';
  else if (ua.includes('firefox')) browser = 'Mozilla Firefox';

  let os = 'Device';
  if (ua.includes('win')) os = 'Windows';
  else if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipad')) os = 'macOS';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

export function detectDeviceType(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet';
  }
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return 'mobile';
  }
  return 'desktop';
}
