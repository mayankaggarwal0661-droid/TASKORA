/**
 * Taskora Web Push Client
 * Client-side integration with PushManager, Service Worker, and server subscription APIs.
 */

import { Task } from '@/types/task';

const USER_ID_STORAGE_KEY = 'taskora_user_account_id';

/**
 * Get or initialize a stable user account ID stored in localStorage.
 * This links multiple devices (e.g. laptop and phone) to the same account.
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'server_user';
  try {
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

/**
 * Helper to safely get an active service worker registration with a strict timeout.
 * Prevents navigator.serviceWorker.ready from hanging indefinitely.
 */
async function getReadyServiceWorker(timeoutMs = 2500): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    // Check if there is already an active registration
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;

    // Race ready with timeout so callers never hang
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([readyPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported()) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;

    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const ready = await getReadyServiceWorker(3000);
    return ready || reg;
  } catch (err) {
    console.error('[WebPush] Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Get current push subscription from PushManager
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  try {
    const reg = await getReadyServiceWorker(2500);
    if (!reg?.pushManager) return null;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Full flow: Request permission, subscribe to PushManager with VAPID key,
 * and register with Taskora backend store.
 */
export async function subscribeToWebPush(): Promise<{
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
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    // 4. Send subscription to server
    const userId = getOrCreateUserId();
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
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});

      // Unsubscribe from browser PushManager
      await sub.unsubscribe();
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Trigger immediate test Web Push notification
 */
export async function sendTestPushNotification(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const sub = await getCurrentPushSubscription();
    const userId = getOrCreateUserId();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub?.endpoint,
        userId,
      }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timer);
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Test notification failed.' };
    }

    return { success: true, message: data.message };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('abort') || message.includes('signal')) {
      return { success: false, error: 'Push request timed out after 6 seconds.' };
    }
    return { success: false, error: message };
  }
}

/**
 * Fetch registered devices for the current user
 */
export async function fetchUserDevices(): Promise<{
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
    const userId = getOrCreateUserId();
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
export async function removeUserDevice(deviceId: string): Promise<boolean> {
  try {
    const userId = getOrCreateUserId();
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
  action: 'schedule' | 'cancel' = 'schedule'
): Promise<boolean> {
  try {
    const userId = getOrCreateUserId();
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
    return res.ok;
  } catch (err) {
    console.warn(`[WebPush] Failed to sync reminder for task ${task.id}:`, err);
    return false;
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
