/**
 * GET /api/cron/send-reminders
 *
 * DURABLE SCHEDULER ENDPOINT:
 * Called by external cron triggers (Vercel Cron, GitHub Actions, cron-job.org)
 * or local dev worker script.
 *
 * Features:
 * - Timezone-aware delivery
 * - Multi-device dispatch per user account
 * - Bounded retry backoff on temporary failures (max 3 attempts)
 * - Automatic 410/404 cleanup for expired subscriptions
 * - Recurring task auto-scheduling for next occurrence
 * - Quiet hours evaluation
 * - Idempotent delivery logging
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingRemindersUpTo,
  getSubscriptionsByUser,
  markReminderSent,
  markReminderFailed,
  cleanupExpiredSubscriptions,
  upsertReminder,
  ReminderRecord,
} from '@/lib/push-store';
import { sendPushToSubscription } from '@/lib/push-sender';
import {
  calculateNextRecurringDueDate,
  calculateReminderTriggerTime,
  generateReminderId,
  isWithinQuietHours,
} from '@/lib/schedule-calculator';
import { RecurrenceRule } from '@/types/task';

const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const secretParam = req.nextUrl.searchParams.get('secret');

  if (!CRON_SECRET) {
    // Development mode without secret configured
    return true;
  }

  if (authHeader === `Bearer ${CRON_SECRET}`) return true;
  if (secretParam === CRON_SECRET) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const now = new Date();
  // 90s lookahead window catches reminders firing between 60s cron ticks
  const cutoff = new Date(now.getTime() + 90_000).toISOString();

  const pendingReminders = getPendingRemindersUpTo(cutoff);

  if (pendingReminders.length === 0) {
    return NextResponse.json({
      checked: true,
      processedAt: now.toISOString(),
      sent: 0,
      total: 0,
      message: 'No pending reminders due.',
    });
  }

  const results: Array<{
    reminderId: string;
    status: string;
    sent: number;
    failed: number;
    nextRecurrence?: string;
  }> = [];

  const expiredEndpoints: string[] = [];

  for (const reminder of pendingReminders) {
    // Check Quiet Hours (optional quiet hours check in user's timezone)
    const checkQuiet = req.nextUrl.searchParams.get('respectQuietHours') === 'true';
    if (checkQuiet && reminder.timezone) {
      const inQuiet = isWithinQuietHours(now.getTime(), reminder.timezone);
      if (inQuiet) {
        // Skip or delay reminder past quiet hours
        results.push({
          reminderId: reminder.id,
          status: 'delayed_quiet_hours',
          sent: 0,
          failed: 0,
        });
        continue;
      }
    }

    const subscriptions = getSubscriptionsByUser(reminder.userId);

    if (subscriptions.length === 0) {
      // User has no active subscriptions on any device
      markReminderFailed(reminder.id, 'No active device subscriptions registered for user.');
      results.push({
        reminderId: reminder.id,
        status: 'skipped_no_subscriptions',
        sent: 0,
        failed: 0,
      });
      continue;
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const result = await sendPushToSubscription(
        sub,
        buildPushPayload(reminder),
        reminder.id
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
        if (result.subscriptionExpired) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }

    if (sent > 0) {
      markReminderSent(reminder.id);

      // ─── RECURRENCE HANDLING ───────────────────────────────────────────────
      // If task has recurrence, schedule the next instance reminder automatically
      let nextRecurrenceDate: string | undefined;
      if (reminder.recurrence && reminder.recurrence !== 'none') {
        try {
          nextRecurrenceDate = calculateNextRecurringDueDate(
            reminder.dueDate,
            reminder.recurrence as RecurrenceRule
          );

          const { dueAtMs, reminderAtMs } = calculateReminderTriggerTime(
            nextRecurrenceDate,
            reminder.dueTime,
            reminder.timezone,
            reminder.leadOffset
          );

          const nextReminderId = generateReminderId(
            reminder.taskId,
            nextRecurrenceDate,
            reminder.dueTime,
            reminder.leadOffset
          );

          const nextRecord: ReminderRecord = {
            id: nextReminderId,
            taskId: reminder.taskId,
            taskTitle: reminder.taskTitle,
            taskDescription: reminder.taskDescription,
            userId: reminder.userId,
            dueDate: nextRecurrenceDate,
            dueTime: reminder.dueTime,
            dueAt: new Date(dueAtMs).toISOString(),
            reminderAt: new Date(reminderAtMs).toISOString(),
            timezone: reminder.timezone,
            leadOffset: reminder.leadOffset,
            recurrence: reminder.recurrence,
            status: 'pending',
            attempts: 0,
            taskUrl: reminder.taskUrl,
          };

          upsertReminder(nextRecord);
        } catch (recErr) {
          console.error(`[Cron] Recurrence calculation error for ${reminder.taskId}:`, recErr);
        }
      }

      results.push({
        reminderId: reminder.id,
        status: 'sent',
        sent,
        failed,
        nextRecurrence: nextRecurrenceDate,
      });
    } else {
      markReminderFailed(reminder.id, `All ${failed} target device(s) failed delivery.`);
      results.push({
        reminderId: reminder.id,
        status: 'failed_retrying',
        sent,
        failed,
      });
    }
  }

  // Deactivate expired subscriptions across all sends
  if (expiredEndpoints.length > 0) {
    cleanupExpiredSubscriptions(expiredEndpoints);
  }

  return NextResponse.json({
    checked: true,
    processedAt: now.toISOString(),
    total: pendingReminders.length,
    results,
    cleanedExpiredCount: expiredEndpoints.length,
  });
}

function buildPushPayload(reminder: ReminderRecord) {
  return {
    title: `⏰ Taskora: ${reminder.taskTitle}`,
    body: `Your scheduled priority is due soon. Tap to view details.`,
    url: reminder.taskUrl || `/tasks?taskId=${reminder.taskId}`,
    taskId: reminder.taskId,
    tag: `taskora-task-${reminder.taskId}`,
    requireInteraction: true,
    snoozeMinutes: 10,
    action: 'reminder' as const,
  };
}
