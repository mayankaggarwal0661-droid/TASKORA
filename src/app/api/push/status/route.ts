/**
 * GET /api/push/status
 * Returns push subscription and scheduling status for a device or user.
 * Used by the settings page to display real-time diagnostics.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readStore,
  getSubscriptionsByUser,
  getRemindersForUser,
  getDeliveryLogsForUser,
} from '@/lib/push-store';

export async function GET(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get('endpoint');
  const userId = req.nextUrl.searchParams.get('userId');

  const store = readStore();

  let subscription = null;
  if (endpoint) {
    subscription = store.subscriptions.find((s) => s.endpoint === endpoint) || null;
  }

  const resolvedUserId = userId || (subscription ? subscription.userId : null);

  const userSubscriptions = resolvedUserId ? getSubscriptionsByUser(resolvedUserId) : [];
  const userReminders = resolvedUserId ? getRemindersForUser(resolvedUserId) : [];
  const pendingCount = userReminders.filter(
    (r) => r.status === 'scheduled' || (r.status as string) === 'pending'
  ).length;
  const deliveryLogs = resolvedUserId ? getDeliveryLogsForUser(resolvedUserId) : [];
  const lastDelivery = deliveryLogs.length > 0 ? deliveryLogs[deliveryLogs.length - 1] : null;

  return NextResponse.json({
    hasSubscription: !!subscription && subscription.isActive,
    subscription: subscription
      ? {
          id: subscription.id,
          isActive: subscription.isActive,
          deviceName: subscription.deviceName,
          deviceType: subscription.deviceType,
          createdAt: subscription.createdAt,
          lastUsedAt: subscription.lastUsedAt,
        }
      : null,
    userId: resolvedUserId,
    activeDeviceCount: userSubscriptions.length,
    pendingRemindersCount: pendingCount,
    lastDelivery: lastDelivery
      ? {
          attemptedAt: lastDelivery.attemptedAt,
          success: lastDelivery.success,
          error: lastDelivery.error,
        }
      : null,
    reminders: userReminders.slice(-20).reverse().map((r) => ({
      id: r.id,
      taskId: r.taskId,
      taskTitle: r.taskTitle,
      dueDate: r.dueDate,
      dueTime: r.dueTime,
      reminderAt: r.reminderAt,
      status: r.status,
      leadOffset: r.leadOffset,
      attempts: r.attempts,
      deliveredAt: r.deliveredAt,
      deviceDeliveredAt: r.deviceDeliveredAt,
      lastError: r.lastError,
    })),
  });
}
