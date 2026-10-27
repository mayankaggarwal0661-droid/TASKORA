import { NotificationSettings } from '@/types/notification';
import { Task } from '@/types/task';
import {
  registerServiceWorker,
  subscribeToWebPush,
  sendTestPushNotification,
  isWebPushSupported,
} from './web-push-client';

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
  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const result = await subscribeToWebPush();
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

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = (settings.quietHoursStart || '22:00').split(':').map(Number);
    const [endH, endM] = (settings.quietHoursEnd || '07:00').split(':').map(Number);

    const startTotal = (startH || 22) * 60 + (startM || 0);
    const endTotal = (endH || 7) * 60 + (endM || 0);

    if (startTotal <= endTotal) {
      return currentMins >= startTotal && currentMins < endTotal;
    } else {
      // Overnight (e.g. 22:00 to 07:00)
      return currentMins >= startTotal || currentMins < endTotal;
    }
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
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
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
            new Notification(title, {
              body,
              icon: '/icon-192.png',
              tag: tag || 'taskora-reminder',
            });
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

    // 1. Preferred method: ServiceWorkerRegistration.showNotification (works on desktop & Android)
    if ('serviceWorker' in navigator) {
      try {
        let reg: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
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

    // 2. Secondary method: standard window Notification constructor (desktop browsers)
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: 'taskora-test-notification',
      });
      return true;
    } catch (winErr) {
      console.warn('[NotificationService] Window Notification constructor error:', winErr);
      return false;
    }
  }

  /**
   * Trigger test notification (dispatches via Web Push server if subscribed, with fallback to local)
   */
  public static async triggerTestAsync(
    _settings?: NotificationSettings
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

    if (Notification.permission === 'default') {
      return {
        success: false,
        message: 'Please click "Enable Notifications" first to grant browser permission.',
      };
    }

    // Ensure Service Worker is registered for notification capability
    if (isWebPushSupported()) {
      registerServiceWorker().catch(() => {});
    }

    // 1. Attempt real Web Push delivery via backend server
    try {
      const pushResult = await sendTestPushNotification();
      if (pushResult.success) {
        return {
          success: true,
          message: pushResult.message || 'Web Push delivered successfully to your device!',
        };
      }
    } catch (e) {
      console.warn('[NotificationService] sendTestPushNotification non-fatal error:', e);
    }

    // 2. Fallback to direct local notification (bypasses quiet hours for explicit user test)
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

  public static triggerTest(settings: NotificationSettings): { success: boolean; message: string } {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, message: 'Browser notifications are not supported.' };
    }
    if (Notification.permission !== 'granted') {
      return { success: false, message: 'Please grant notification permissions first.' };
    }

    // Trigger async push in background
    this.triggerTestAsync(settings).catch((e) => {
      console.error('[NotificationService] triggerTest error:', e);
    });
    return { success: true, message: 'Dispatched test push notification request.' };
  }

  /**
   * Check tasks for in-app or open-tab reminder checks
   */
  public static checkDueReminders(
    tasks: Task[],
    settings: NotificationSettings,
    notifiedTaskIds: Set<string>
  ): { dueTasks: Task[]; newlyNotifiedIds: string[] } {
    const now = Date.now();
    const dueTasks: Task[] = [];
    const newlyNotifiedIds: string[] = [];

    for (const task of tasks) {
      if (task.status === 'completed' || !task.dueDate) continue;

      const timeStr = task.dueTime || '09:00';
      const [year, month, day] = task.dueDate.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);

      const targetTime = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0).getTime();

      let offsetMs = 0;
      switch (task.reminder || settings.defaultLeadTime) {
        case '5m':
          offsetMs = 5 * 60 * 1000;
          break;
        case '15m':
          offsetMs = 15 * 60 * 1000;
          break;
        case '30m':
          offsetMs = 30 * 60 * 1000;
          break;
        case '1h':
          offsetMs = 60 * 60 * 1000;
          break;
        case '1d':
          offsetMs = 24 * 60 * 60 * 1000;
          break;
        default:
          offsetMs = 0;
          break;
      }

      const reminderTriggerTime = targetTime - offsetMs;
      const diffMs = reminderTriggerTime - now;

      // In-tab alert triggers within -30s to +60s window
      const notifyKey = `${task.id}-${task.dueDate}-${task.dueTime}-${offsetMs}`;
      if (diffMs <= 60000 && diffMs >= -60000 && !notifiedTaskIds.has(notifyKey)) {
        dueTasks.push(task);
        newlyNotifiedIds.push(notifyKey);
      }
    }

    return { dueTasks, newlyNotifiedIds };
  }
}
