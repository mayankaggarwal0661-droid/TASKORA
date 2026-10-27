/**
 * POST /api/reminders/schedule
 * Create, update, cancel, or snooze a durable server-side reminder for a task.
 *
 * Requirements:
 * - Timezone-aware UTC calculations respecting Daylight Saving Time (DST)
 * - Lead time offsets: at_time, 5m, 15m, 30m, 1h, 1d
 * - Idempotency key generation: deterministic hash per task and trigger
 * - Action handlers: 'schedule', 'cancel', 'snooze'
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  upsertReminder,
  cancelRemindersForTask,
  snoozeReminder,
  ReminderRecord,
} from '@/lib/push-store';
import {
  calculateReminderTriggerTime,
  generateReminderId,
} from '@/lib/schedule-calculator';
import { AdvanceReminder, RecurrenceRule } from '@/types/task';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      taskId: string;
      taskTitle?: string;
      taskDescription?: string;
      dueDate?: string; // YYYY-MM-DD
      dueTime?: string; // HH:mm
      timezone?: string;
      reminder?: AdvanceReminder | string;
      recurrence?: RecurrenceRule;
      userId: string;
      action?: 'schedule' | 'cancel' | 'snooze';
      snoozeMinutes?: number;
    };

    const {
      taskId,
      taskTitle,
      dueDate,
      dueTime,
      timezone,
      reminder,
      recurrence,
      userId,
      action = 'schedule',
      snoozeMinutes,
    } = body;

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, userId.' },
        { status: 400 }
      );
    }

    // ─── ACTION: Cancel ──────────────────────────────────────────────────────
    if (action === 'cancel') {
      cancelRemindersForTask(taskId);
      return NextResponse.json({ success: true, cancelled: true, taskId });
    }

    // ─── ACTION: Snooze ──────────────────────────────────────────────────────
    if (action === 'snooze') {
      const snoozed = snoozeReminder(taskId, snoozeMinutes || 10);
      if (!snoozed) {
        return NextResponse.json(
          { error: 'Cannot snooze: No existing reminder found for task.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        snoozed: true,
        reminderId: snoozed.id,
        reminderAt: snoozed.reminderAt,
      });
    }

    // ─── ACTION: Schedule ────────────────────────────────────────────────────
    if (!dueDate || !taskTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: dueDate, taskTitle.' },
        { status: 400 }
      );
    }

    // Cancel old pending reminders for this task (superseded by update)
    cancelRemindersForTask(taskId);

    const leadOffset = reminder || '15m';
    const tz = timezone || 'UTC';

    // Calculate exact UTC timestamps respecting DST and lead time
    const { dueAtMs, reminderAtMs } = calculateReminderTriggerTime(
      dueDate,
      dueTime,
      tz,
      leadOffset
    );

    // If reminder time has already passed (older than 60 seconds ago), skip scheduling
    if (reminderAtMs < Date.now() - 60_000) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'Reminder trigger time is in the past.',
        reminderAt: new Date(reminderAtMs).toISOString(),
        dueAt: new Date(dueAtMs).toISOString(),
      });
    }

    const dueAt = new Date(dueAtMs).toISOString();
    const reminderAt = new Date(reminderAtMs).toISOString();
    const reminderId = generateReminderId(taskId, dueDate, dueTime, String(leadOffset));

    const record: ReminderRecord = {
      id: reminderId,
      taskId,
      taskTitle: taskTitle.trim(),
      taskDescription: body.taskDescription?.trim(),
      userId,
      dueDate,
      dueTime: dueTime || '09:00',
      dueAt,
      reminderAt,
      timezone: tz,
      leadOffset: String(leadOffset),
      recurrence: recurrence || 'none',
      status: 'pending',
      attempts: 0,
      taskUrl: `/tasks?taskId=${taskId}`,
    };

    upsertReminder(record);

    return NextResponse.json({
      success: true,
      reminderId,
      reminderAt,
      dueAt,
      timezone: tz,
      leadOffset,
    });
  } catch (err) {
    console.error('[/api/reminders/schedule] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/reminders/schedule
 * Cancel all pending reminders for a given taskId
 */
export async function DELETE(req: NextRequest) {
  try {
    const { taskId } = ((await req.json().catch(() => ({}))) as { taskId?: string });
    const searchTaskId = req.nextUrl.searchParams.get('taskId') || taskId;

    if (!searchTaskId) {
      return NextResponse.json({ error: 'Missing taskId parameter.' }, { status: 400 });
    }

    cancelRemindersForTask(searchTaskId);
    return NextResponse.json({ success: true, cancelled: true, taskId: searchTaskId });
  } catch (err) {
    console.error('[/api/reminders/schedule DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
