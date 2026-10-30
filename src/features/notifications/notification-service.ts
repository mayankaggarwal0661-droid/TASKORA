import { NotificationSettings } from '@/types/notification';
import { Task } from '@/types/task';
import {
  registerServiceWorker,
  subscribeToWebPush,
  sendTestPushNotification,
  isWebPushSupported,
} from './web-push-client';
import {
  calculateUtcTimestamp,
  LEAD_OFFSET_MS,
  isWithinQuietHours,
} from '@/lib/schedule-calculator';

export class NotificationService {
  /**
   * Register Service Worker for background Web Push and reminder capability
   */
  public static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    return registerServiceWorker();
  }

  /**
   * Check current browser notification permission
   */
  public static getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request browser permission, register SW, and subscribe to Web Push
   */
  public static async requestPermission(authUid?: string | null): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const result = await subscribeToWebPush(authUid);
      return result.permission || Notification.permission;
    } catch {
      return Notification.permission || 'denied';
    }
  }

  /**
   * Determine whether current time is within quiet hours
   */
  public static isQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHoursEnabled) return false;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return isWithinQuietHours(
      Date.now(),
      tz,
      settings.quietHoursStart || '22:00',
      settings.quietHoursEnd || '07:00'
    );
  }

  /**
   * Dispatch a browser notification (via Service Worker if ready, fallback to Notification API)
   */
  public static sendBrowserNotification(
    title: string,
    body: string,
    settings: NotificationSettings,
    tag?: string,
    url?: string
  ): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission !== 'granted' || !settings.browserEnabled) return false;
    if (this.isQuietHours(settings)) return false;

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification(title, {
              body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: tag || 'taskora-reminder',
              data: { url: url || '/dashboard' },
            });
          })
          .catch(() => {
            try {
              new Notification(title, {
                body,
                icon: '/icon-192.png',
                tag: tag || 'taskora-reminder',
              });
            } catch {}
          });
      } else {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          tag: tag || 'taskora-reminder',
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dispatch a local test notification directly to the browser or via Service Worker.
   * Deliberately bypasses quiet hours since this is an explicit user-initiated diagnostic test.
   */
  public static async sendTestLocalNotification(
    title: string,
    body: string
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    // 1. Preferred method: ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator) {
      try {
        let reg: ServiceWorkerRegistration | null | undefined =
          await navigator.serviceWorker.getRegistration();
        if (!reg?.active) {
          reg = await registerServiceWorker();
        }
        if (reg) {
          await reg.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'taskora-test-notification',
            data: { url: '/notifications' },
          });
          return true;
        }
      } catch (swErr) {
        console.warn('[NotificationService] SW showNotification error:', swErr);
      }
    }

    // 2. Secondary method: standard window Notification constructor
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: 'taskora-test-notification',
      });
      return true;
    } catch (winErr) {
      console.warn('[NotificationService] Window Notification error:', winErr);
      return false;
    }
  }

  /**
   * Trigger test notification with strict timeout and fallback
   */
  public static async triggerTestAsync(
    _settings?: NotificationSettings,
    authUid?: string | null
  ): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return {
        success: false,
        message: 'Browser notifications are not supported on this device/browser.',
      };
    }

    if (Notification.permission === 'denied') {
      return {
        success: false,
        message:
          'Notification permission is blocked in your browser settings. Please click the tune/lock icon in your browser address bar to allow notifications.',
      };
    }

    // If permission not yet granted, request it now
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        return {
          success: false,
          message:
            perm === 'denied'
              ? 'Notification permission was denied. Please allow notifications from your address bar.'
              : 'Notification permission prompt was dismissed.',
        };
      }
    }

    // Ensure Service Worker is registered
    if (isWebPushSupported()) {
      try {
        await registerServiceWorker();
      } catch {}
    }

    // 1. Attempt real Web Push delivery via backend server
    try {
      const pushResult = await sendTestPushNotification(authUid);
      if (pushResult.success) {
        return {
          success: true,
          message: pushResult.message || 'Web Push delivered successfully to your device!',
        };
      }
    } catch (e) {
      console.warn('[NotificationService] sendTestPushNotification error:', e);
    }

    // 2. Fallback to direct local notification
    const localDelivered = await this.sendTestLocalNotification(
      'Taskora — Test Alert Active',
      'Browser notification confirmed. Your scheduled task alerts are ready.'
    );

    if (localDelivered) {
      return {
        success: true,
        message: 'Test notification displayed successfully on this device.',
      };
    }

    return {
      success: false,
      message:
        'Could not display notification. Please ensure system Do Not Disturb / Focus Assist is not silencing browser alerts.',
    };
  }

  public static triggerTest(
    settings: NotificationSettings,
    authUid?: string | null
  ): { success: boolean; message: string } {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, message: 'Browser notifications are not supported.' };
    }
    if (Notification.permission !== 'granted') {
      return { success: false, message: 'Please grant notification permissions first.' };
    }

    this.triggerTestAsync(settings, authUid).catch((e) => {
      console.error('[NotificationService] triggerTest error:', e);
    });
    return { success: true, message: 'Dispatched test push notification request.' };
  }

  /**
   * Check tasks for in-app or open-tab reminder checks, respecting task timezone
   */
  public static checkDueReminders(
    tasks: Task[],
    settings: NotificationSettings,
    notifiedTaskIds: Set<string>
  ): { dueTasks: Task[]; newlyNotifiedIds: string[] } {
    const nowMs = Date.now();
    const dueTasks: Task[] = [];
    const newlyNotifiedIds: string[] = [];

    for (const task of tasks) {
      if (task.status === 'completed' || !task.dueDate) continue;

      let targetTimeMs: number;
      try {
        targetTimeMs = calculateUtcTimestamp(
          task.dueDate,
          task.dueTime || '09:00',
          task.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        );
      } catch {
        continue;
      }

      const offsetKey = task.reminder || settings.defaultLeadTime || '15m';
      const offsetMs = LEAD_OFFSET_MS[offsetKey] ?? 15 * 60 * 1000;

      const reminderTriggerTime = targetTimeMs - offsetMs;
      const diffMs = reminderTriggerTime - nowMs;

      // In-tab alert triggers within -30s to +60s window (or immediately if past trigger but task upcoming)
      const isUpcoming = targetTimeMs > nowMs;
      const notifyKey = `${task.id}-${task.dueDate}-${task.dueTime}-${offsetMs}`;

      if (
        !notifiedTaskIds.has(notifyKey) &&
        ((diffMs <= 60000 && diffMs >= -60000) || (diffMs < -60000 && isUpcoming && !task.reminderStatus))
      ) {
        dueTasks.push(task);
        newlyNotifiedIds.push(notifyKey);
      }
    }

    return { dueTasks, newlyNotifiedIds };
  }
}
