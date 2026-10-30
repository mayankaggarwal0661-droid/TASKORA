/**
 * Taskora Background Reminder Scheduler Worker
 *
 * Runs automatically inside the Node.js server runtime (via instrumentation)
 * and can also be triggered directly via the /api/cron/send-reminders endpoint.
 *
 * Features:
 * - Atomic claiming to prevent duplicate notification dispatch
 * - Multi-device dispatch per user account
 * - Bounded retry backoff with error logging
 * - Automatic 410/404 cleanup for expired subscriptions
 * - Recurring task auto-scheduling
 * - Missed-reminder expiration policy
 */

import {
  claimRemindersForProcessing,
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

export interface SchedulerProcessResult {
  checked: boolean;
  processedAt: string;
  totalClaimed: number;
  sentCount: number;
  failedCount: number;
  results: Array<{
    reminderId: string;
    taskId: string;
    userId: string;
    status: 'sent' | 'failed' | 'delayed_quiet_hours' | 'skipped_no_subscriptions';
    sent: number;
    failed: number;
    nextRecurrence?: string;
    error?: string;
  }>;
  cleanedExpiredCount: number;
}

/**
 * Core scheduler processing function.
 * Atomically claims due reminders and delivers Web Push notifications.
 */
export async function processDueReminders(
  respectQuietHours = false,
  lookaheadMs = 60_000
): Promise<SchedulerProcessResult> {
  const now = new Date();
  const cutoffIso = new Date(now.getTime() + lookaheadMs).toISOString();

  // Atomically claim due reminders — sets status to 'processing'
  const claimed = claimRemindersForProcessing(cutoffIso);

  if (claimed.length === 0) {
    return {
      checked: true,
      processedAt: now.toISOString(),
      totalClaimed: 0,
      sentCount: 0,
      failedCount: 0,
      results: [],
      cleanedExpiredCount: 0,
    };
  }

  const results: SchedulerProcessResult['results'] = [];
  const expiredEndpoints: string[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  for (const reminder of claimed) {
    // 1. Quiet Hours check (optional)
    if (respectQuietHours && reminder.timezone) {
      const inQuiet = isWithinQuietHours(now.getTime(), reminder.timezone);
      if (inQuiet) {
        // Postpone retry
        markReminderFailed(reminder.id, 'Quiet hours active in local timezone.', false);
        results.push({
          reminderId: reminder.id,
          taskId: reminder.taskId,
          userId: reminder.userId,
          status: 'delayed_quiet_hours',
          sent: 0,
          failed: 0,
        });
        continue;
      }
    }

    // 2. Fetch active subscriptions for user
    const subscriptions = getSubscriptionsByUser(reminder.userId);

    if (subscriptions.length === 0) {
      // User has no active subscriptions on any device
      markReminderFailed(
        reminder.id,
        'No active device subscriptions registered for user account.',
        false
      );
      results.push({
        reminderId: reminder.id,
        taskId: reminder.taskId,
        userId: reminder.userId,
        status: 'skipped_no_subscriptions',
        sent: 0,
        failed: 0,
        error: 'No active device subscriptions registered for user account.',
      });
      totalFailed++;
      continue;
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    const payload = buildPushPayload(reminder);

    for (const sub of subscriptions) {
      const sendRes = await sendPushToSubscription(sub, payload, reminder.id);
      if (sendRes.success) {
        sent++;
      } else {
        failed++;
        errors.push(sendRes.error || 'Failed');
        if (sendRes.subscriptionExpired) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }

    if (sent > 0) {
      markReminderSent(reminder.id, { deviceCount: sent });
      totalSent++;

      // 3. Recurrence Handling: Schedule next occurrence
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
            status: 'scheduled',
            attempts: 0,
            taskUrl: reminder.taskUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          upsertReminder(nextRecord);
        } catch (recErr) {
          console.error(`[Scheduler] Recurrence error for task ${reminder.taskId}:`, recErr);
        }
      }

      results.push({
        reminderId: reminder.id,
        taskId: reminder.taskId,
        userId: reminder.userId,
        status: 'sent',
        sent,
        failed,
        nextRecurrence: nextRecurrenceDate,
      });
    } else {
      markReminderFailed(
        reminder.id,
        `Push delivery failed on all ${subscriptions.length} registered device(s): ${errors.join('; ')}`
      );
      totalFailed++;
      results.push({
        reminderId: reminder.id,
        taskId: reminder.taskId,
        userId: reminder.userId,
        status: 'failed',
        sent: 0,
        failed,
        error: errors.join('; '),
      });
    }
  }

  // Clean up any 404/410 expired endpoints
  if (expiredEndpoints.length > 0) {
    cleanupExpiredSubscriptions(expiredEndpoints);
  }

  return {
    checked: true,
    processedAt: now.toISOString(),
    totalClaimed: claimed.length,
    sentCount: totalSent,
    failedCount: totalFailed,
    results,
    cleanedExpiredCount: expiredEndpoints.length,
  };
}

function buildPushPayload(reminder: ReminderRecord) {
  return {
    title: `⏰ Task Reminder: ${reminder.taskTitle}`,
    body: `Scheduled priority due ${reminder.dueTime ? `at ${reminder.dueTime}` : 'today'}. Tap to view task.`,
    url: reminder.taskUrl || `/tasks?taskId=${reminder.taskId}`,
    taskId: reminder.taskId,
    tag: `taskora-task-${reminder.taskId}`,
    requireInteraction: true,
    snoozeMinutes: 10,
    action: 'reminder' as const,
  };
}

// ─── Background Worker Singleton ─────────────────────────────────────────────

declare global {
  var __taskora_scheduler_timer__: NodeJS.Timeout | undefined;
}

/**
 * Starts the internal background reminder scheduler worker.
 * Runs every `intervalMs` (default 30 seconds) in Node.js server.
 */
export function startReminderSchedulerWorker(intervalMs = 30_000): void {
  if (globalThis.__taskora_scheduler_timer__) {
    return; // Already running in this process
  }

  console.log(`[Taskora Scheduler] Starting background worker (tick interval: ${intervalMs / 1000}s)`);

  // Initial immediate pass
  processDueReminders().catch((err) => {
    console.warn('[Taskora Scheduler] Initial pass warning:', err);
  });

  globalThis.__taskora_scheduler_timer__ = setInterval(async () => {
    try {
      const res = await processDueReminders();
      if (res.totalClaimed > 0) {
        console.log(
          `[Taskora Scheduler] Processed ${res.totalClaimed} due reminder(s): ${res.sentCount} sent, ${res.failedCount} failed.`
        );
      }
    } catch (err) {
      console.error('[Taskora Scheduler] Tick error:', err);
    }
  }, intervalMs);

  // Do not hold the Node process open if everything else shuts down
  if (globalThis.__taskora_scheduler_timer__.unref) {
    globalThis.__taskora_scheduler_timer__.unref();
  }
}

/**
 * Stop scheduler worker (used in test teardown)
 */
export function stopReminderSchedulerWorker(): void {
  if (globalThis.__taskora_scheduler_timer__) {
    clearInterval(globalThis.__taskora_scheduler_timer__);
    globalThis.__taskora_scheduler_timer__ = undefined;
    console.log('[Taskora Scheduler] Background worker stopped.');
  }
}
