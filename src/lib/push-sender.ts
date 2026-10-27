/**
 * Taskora Web Push Sender
 * Server-side only — uses VAPID private key to send push notifications.
 * NEVER import this in client components.
 */

import webpush from 'web-push';
import { PushSubscriptionRecord, appendDeliveryLog } from './push-store';

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@taskora.app';

  if (!publicKey || !privateKey) {
    console.warn('[Taskora Push] VAPID keys not configured in environment.');
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error('[Taskora Push] Failed to configure VAPID details:', err);
    return false;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  taskId?: string | null;
  tag?: string;
  silent?: boolean;
  requireInteraction?: boolean;
  snoozeMinutes?: number;
  icon?: string;
  badge?: string;
  action?: 'reminder' | 'test' | 'snooze' | 'digest';
}

/**
 * Send a push notification to a single subscription.
 * Returns whether the send succeeded, and any error details.
 */
export async function sendPushToSubscription(
  subscription: PushSubscriptionRecord,
  payload: PushPayload,
  reminderId?: string
): Promise<{ success: boolean; error?: string; subscriptionExpired?: boolean; statusCode?: number }> {
  if (!ensureVapidConfigured()) {
    return { success: false, error: 'VAPID keys not configured in environment variables.' };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/icon-192.png',
    url: payload.url || '/dashboard',
    taskId: payload.taskId || null,
    tag: payload.tag || 'taskora-reminder',
    silent: payload.silent ?? false,
    requireInteraction: payload.requireInteraction ?? false,
    snoozeMinutes: payload.snoozeMinutes ?? 10,
    action: payload.action || 'reminder',
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      pushPayload,
      {
        TTL: 24 * 60 * 60, // Allow push service to hold for up to 24h if device is offline
        urgency: 'normal',
        topic: payload.tag || 'taskora-reminder',
      }
    );

    if (reminderId) {
      appendDeliveryLog({
        reminderId,
        subscriptionId: subscription.id,
        attemptedAt: new Date().toISOString(),
        success: true,
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const message = error?.message || String(err);
    const statusCode = error?.statusCode;

    // HTTP 404 Not Found or 410 Gone = subscription has expired / user revoked permission
    const subscriptionExpired = statusCode === 404 || statusCode === 410;

    if (reminderId) {
      appendDeliveryLog({
        reminderId,
        subscriptionId: subscription.id,
        attemptedAt: new Date().toISOString(),
        success: false,
        error: message,
      });
    }

    // Mask endpoint for privacy in server logs
    const maskedEndpoint = subscription.endpoint.slice(0, 30) + '...';
    console.error(`[Taskora Push] Send failed for ${maskedEndpoint} (Status ${statusCode || 'unknown'}): ${message}`);
    return { success: false, error: message, subscriptionExpired, statusCode };
  }
}

/**
 * Send a push notification to all active subscriptions for a user.
 */
export async function sendPushToUser(
  subscriptions: PushSubscriptionRecord[],
  payload: PushPayload,
  reminderId?: string
): Promise<{ sent: number; failed: number; expired: string[] }> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload, reminderId))
  );

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        sent++;
      } else {
        failed++;
        if (result.value.subscriptionExpired) {
          expired.push(subscriptions[i].endpoint);
        }
      }
    } else {
      failed++;
    }
  });

  return { sent, failed, expired };
}
