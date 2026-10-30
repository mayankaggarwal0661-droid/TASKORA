/**
 * /api/reminders/schedule
 *
 * POST: Create, update, cancel, or snooze a durable server-side reminder for a task.
 * GET: Retrieve active reminder status for a taskId.
 * DELETE: Cancel pending reminders for a taskId.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  upsertReminder,
  cancelRemindersForTask,
  snoozeReminder,
  getReminderByTaskId,
  ReminderRecord,
} from '@/lib/push-store';
import {
  evaluateReminderTiming,
  generateReminderId,
} from '@/lib/schedule-calculator';
import { AdvanceReminder, RecurrenceRule } from '@/types/task';
import { processDueReminders } from '@/lib/scheduler-worker';

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
          { error: 'Cannot snooze: No active reminder found for task.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        snoozed: true,
        reminderId: snoozed.id,
        reminderAt: snoozed.reminderAt,
        status: snoozed.status,
      });
    }

    // ─── ACTION: Schedule ────────────────────────────────────────────────────
    if (!dueDate || !taskTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: dueDate, taskTitle.' },
        { status: 400 }
      );
    }

    // Validate dueDate format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return NextResponse.json(
        { error: `Invalid dueDate format "${dueDate}". Expected YYYY-MM-DD.` },
        { status: 400 }
      );
    }

    const leadOffset = reminder || '15m';
    const tz = timezone || 'UTC';

    // Cancel old pending reminders for this task (superseded by update)
    cancelRemindersForTask(taskId);

    // Evaluate reminder timing and apply documented past-trigger policy
    let timing;
    try {
      timing = evaluateReminderTiming(dueDate, dueTime, tz, leadOffset);
    } catch (calcErr) {
      return NextResponse.json(
        { error: calcErr instanceof Error ? calcErr.message : 'Invalid schedule parameters.' },
        { status: 400 }
      );
    }

    // Policy 1: If task itself is already in the past, reject scheduling
    if (timing.policyApplied === 'rejected_past_due') {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: timing.message,
        dueAt: new Date(timing.dueAtMs).toISOString(),
        reminderAt: new Date(timing.reminderAtMs).toISOString(),
      });
    }

    const dueAt = new Date(timing.dueAtMs).toISOString();
    const reminderAt = new Date(timing.effectiveReminderAtMs).toISOString();
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
      status: 'scheduled',
      attempts: 0,
      taskUrl: `/tasks?taskId=${taskId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertReminder(record);

    // If policy was immediate past trigger (task is upcoming, but reminder offset was in the past),
    // kick the processor so user receives the upcoming notification right away
    if (timing.policyApplied === 'immediate_past_trigger') {
      processDueReminders().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      reminderId,
      reminderAt,
      dueAt,
      timezone: tz,
      leadOffset,
      status: record.status,
      policyApplied: timing.policyApplied,
      immediate: timing.policyApplied === 'immediate_past_trigger',
      message: timing.message,
    });
  } catch (err) {
    console.error('[/api/reminders/schedule] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * GET /api/reminders/schedule?taskId=...
 * Retrieve reminder status for a specific task
 */
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId parameter.' }, { status: 400 });
  }

  const reminder = getReminderByTaskId(taskId);
  if (!reminder) {
    return NextResponse.json({ found: false, taskId }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    reminder: {
      id: reminder.id,
      taskId: reminder.taskId,
      status: reminder.status,
      reminderAt: reminder.reminderAt,
      dueAt: reminder.dueAt,
      leadOffset: reminder.leadOffset,
      attempts: reminder.attempts,
      deliveredAt: reminder.deliveredAt,
      deviceDeliveredAt: reminder.deviceDeliveredAt,
      lastError: reminder.lastError,
    },
  });
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
