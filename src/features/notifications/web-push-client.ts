/**
 * Taskora Web Push Client
 * Client-side integration with PushManager, Service Worker, and server subscription APIs.
 */

import { Task } from '@/types/task';

const USER_ID_STORAGE_KEY = 'taskora_user_account_id';
const AUTH_UID_KEY = 'taskora_auth_user_uid';

/**
 * Get or initialize a stable user account ID.
 * If user is authenticated with Firebase (authUid provided or in storage),
 * that Firebase UID is used to link all user devices and tasks together.
 */
export function getEffectiveUserId(authUid?: string | null): string {
  if (typeof window === 'undefined') return 'server_user';

  if (authUid && authUid !== 'guest') {
    try {
      localStorage.setItem(AUTH_UID_KEY, authUid);
      localStorage.setItem(USER_ID_STORAGE_KEY, authUid);
    } catch {}
    return authUid;
  }

  try {
    const savedAuthUid = localStorage.getItem(AUTH_UID_KEY);
    if (savedAuthUid && savedAuthUid !== 'guest') {
      return savedAuthUid;
    }

    let id = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!id) {
      id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(USER_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'fallback_user';
  }
}

export function getOrCreateUserId(): string {
  return getEffectiveUserId();
}

/**
 * Utility to convert base64url VAPID public key to Uint8Array required by pushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the current browser and OS support Service Workers and Web Push
 */
export function isWebPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Detect device friendly name (e.g. "Google Chrome on Windows")
 */
export function getClientDeviceName(): string {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;

  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Google Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';

  let os = 'Device';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

/**
 * Detect client device category
 */
export function getClientDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
    return 'tablet';
  }
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return 'mobile';
  }
  return 'desktop';
}

let isDocumentUnloading = false;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    isDocumentUnloading = true;
  }, { passive: true });
  window.addEventListener('pagehide', () => {
    isDocumentUnloading = true;
  }, { passive: true });
}

/**
 * Check if document is currently in an invalid, navigating, or unloading state
 */
function isDocumentInactive(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  if (isDocumentUnloading || window.closed) return true;
  return false;
}

/**
 * Check if an error is a browser DOMException InvalidStateError
 */
function isInvalidStateError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DOMException && err.name === 'InvalidStateError') return true;
  if (typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'InvalidStateError') return true;
  const msg = err instanceof Error ? err.message : String(err);
  return msg.toLowerCase().includes('invalid state');
}

let inFlightRegistration: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Helper to safely get an active service worker registration with a strict timeout.
 * Prevents navigator.serviceWorker.ready from hanging indefinitely.
 */
async function getReadyServiceWorker(timeoutMs = 3000): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || isDocumentInactive()) return null;

  try {
    const existing = await navigator.serviceWorker.getRegistration().catch((e) => {
      if (isInvalidStateError(e)) return null;
      return null;
    });
    if (existing?.active) return existing;
    if (isDocumentInactive()) return null;

    const readyPromise = navigator.serviceWorker.ready.catch(() => null);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([readyPromise, timeoutPromise]);
  } catch (err) {
    if (isInvalidStateError(err)) return null;
    return null;
  }
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported() || isDocumentInactive()) return null;

  // Wait for document to be ready if called during initial parse
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        window.removeEventListener('DOMContentLoaded', onReady);
        window.removeEventListener('load', onReady);
        resolve();
      };
      window.addEventListener('DOMContentLoaded', onReady, { once: true });
      window.addEventListener('load', onReady, { once: true });
    });
  }
  if (isDocumentInactive()) return null;

  if (inFlightRegistration) return inFlightRegistration;

  inFlightRegistration = (async () => {
    try {
      const existing = await navigator.serviceWorker.getRegistration().catch((e) => {
        if (isInvalidStateError(e)) return null;
        throw e;
      });
      if (existing?.active) return existing;
      if (isDocumentInactive()) return null;

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const ready = await getReadyServiceWorker(3000);
      return ready || reg;
    } catch (err) {
      if (isInvalidStateError(err)) {
        // Document is navigating, unloading, or not fully active.
        // Return null gracefully without polluting the console.
        return null;
      }
      console.error('[WebPush] Service Worker registration failed:', err);
      return null;
    } finally {
      inFlightRegistration = null;
    }
  })();

  return inFlightRegistration;
}

/**
 * Get current push subscription from PushManager
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported() || isDocumentInactive()) return null;
  try {
    const reg = await getReadyServiceWorker(2500);
    if (!reg?.pushManager || isDocumentInactive()) return null;
    return await reg.pushManager.getSubscription().catch((e) => {
      if (isInvalidStateError(e)) return null;
      return null;
    });
  } catch (err) {
    if (isInvalidStateError(err)) return null;
    return null;
  }
}

/**
 * Full flow: Request permission, subscribe to PushManager with VAPID key,
 * and register with Taskora backend store.
 */
export async function subscribeToWebPush(authUid?: string | null): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
  permission?: NotificationPermission;
}> {
  if (!isWebPushSupported()) {
    return {
      success: false,
      error:
        'Web Push is not supported in this browser. On iOS, add Taskora to your Home Screen first.',
    };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return {
      success: false,
      error: 'VAPID public key not found in application configuration.',
    };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        error:
          permission === 'denied'
            ? 'Notifications are blocked in your browser settings. Please allow notifications from your address bar.'
            : 'Notification permission was dismissed.',
      };
    }

    // 2. Register Service Worker
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, error: 'Could not initialize service worker.' };
    }

    // 3. Subscribe with PushManager
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    let sub = await reg.pushManager.getSubscription().catch((e) => {
      if (isInvalidStateError(e)) return null;
      throw e;
    });

    if (!sub) {
      if (isDocumentInactive()) {
        return { success: false, error: 'Document transitioned during subscription.' };
      }
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    // 4. Send subscription to server
    const userId = getEffectiveUserId(authUid);
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        userId,
        userAgent: navigator.userAgent,
        deviceName: getClientDeviceName(),
        deviceType: getClientDeviceType(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Server failed to save push subscription.');
    }

    return { success: true, subscription: sub, permission };
  } catch (err: unknown) {
    if (isInvalidStateError(err)) {
      return { success: false, error: 'Document transitioned or was inactive during push subscription.' };
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error('[WebPush] subscribeToWebPush error:', message);
    return { success: false, error: message };
  }
}

/**
 * Unsubscribe current device from Web Push
 */
export async function unsubscribeFromWebPush(): Promise<{ success: boolean; error?: string }> {
  try {
    const sub = await getCurrentPushSubscription();
    if (sub) {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});

      await sub.unsubscribe();
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Trigger immediate test Web Push notification with strict timeout and fallback
 */
export async function sendTestPushNotification(authUid?: string | null): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const sub = await getCurrentPushSubscription();
    const userId = getEffectiveUserId(authUid);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub?.endpoint,
        subscription: sub ? sub.toJSON() : undefined,
        userId,
        deviceName: getClientDeviceName(),
      }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timer);
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Test notification failed.' };
    }

    return { success: true, message: data.message };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('abort') || message.includes('signal')) {
      return { success: false, error: 'Push request timed out after 7 seconds.' };
    }
    return { success: false, error: message };
  }
}

/**
 * Fetch registered devices for the current user
 */
export async function fetchUserDevices(authUid?: string | null): Promise<{
  devices: Array<{
    id: string;
    deviceName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    createdAt: string;
    lastUsedAt: string;
    isActive: boolean;
    endpointMask: string;
  }>;
  activeCount: number;
}> {
  try {
    const userId = getEffectiveUserId(authUid);
    const res = await fetch(`/api/push/devices?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return { devices: [], activeCount: 0 };
    const data = await res.json();
    return { devices: data.devices || [], activeCount: data.activeCount || 0 };
  } catch {
    return { devices: [], activeCount: 0 };
  }
}

/**
 * Remove/deactivate a specific registered device
 */
export async function removeUserDevice(deviceId: string, authUid?: string | null): Promise<boolean> {
  try {
    const userId = getEffectiveUserId(authUid);
    const res = await fetch('/api/push/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deviceId, userId, hardDelete: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Synchronize task reminder to server backend for durable scheduling
 */
export async function syncTaskReminderToServer(
  task: Task,
  authUid?: string | null,
  action: 'schedule' | 'cancel' = 'schedule'
): Promise<{
  success: boolean;
  skipped?: boolean;
  reason?: string;
  immediate?: boolean;
  message?: string;
}> {
  try {
    const userId = getEffectiveUserId(authUid);
    const res = await fetch('/api/reminders/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        timezone: task.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        reminder: task.reminder,
        recurrence: task.recurrence,
        userId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn(`[WebPush] Sync reminder failed for task ${task.id}:`, data.error);
      return { success: false, reason: data.error };
    }

    return {
      success: data.success ?? true,
      skipped: data.skipped,
      reason: data.reason,
      immediate: data.immediate,
      message: data.message,
    };
  } catch (err) {
    console.warn(`[WebPush] Failed to sync reminder for task ${task.id}:`, err);
    return { success: false, reason: String(err) };
  }
}

/**
 * Cancel reminder on server
 */
export async function cancelTaskReminderOnServer(taskId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/reminders/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
