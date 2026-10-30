import crypto from 'crypto';
import { RecurrenceRule, AdvanceReminder } from '@/types/task';

export const LEAD_OFFSET_MS: Record<AdvanceReminder, number> = {
  at_time: 0,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

/**
 * Validates that an IANA timezone identifier is valid.
 */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Accurately convert local date, time, and IANA timezone to UTC epoch milliseconds,
 * automatically accounting for Daylight Saving Time (DST) with iterative refinement.
 */
export function calculateUtcTimestamp(
  dateStr: string,
  timeStr = '09:00',
  timeZone = 'UTC'
): number {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error('Invalid date: dateStr is required in YYYY-MM-DD format.');
  }

  const dateMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    throw new Error(`Invalid date format "${dateStr}". Expected YYYY-MM-DD.`);
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Invalid calendar date values in "${dateStr}".`);
  }

  const cleanTime = (timeStr && timeStr.trim().length > 0) ? timeStr.trim() : '09:00';
  const timeMatch = cleanTime.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  const hours = timeMatch ? Number(timeMatch[1]) : 9;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  const seconds = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;

  const resolvedTz = isValidTimeZone(timeZone) ? timeZone : 'UTC';

  // Initial approximation treating target local time as UTC
  const approx = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: resolvedTz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });

    const getTzParts = (d: Date) => {
      const parts = Object.fromEntries(
        formatter.formatToParts(d).map((p) => [p.type, p.value])
      );
      return {
        y: Number(parts.year),
        m: Number(parts.month),
        d: Number(parts.day),
        h: Number(parts.hour),
        min: Number(parts.minute),
        s: Number(parts.second),
      };
    };

    const p1 = getTzParts(approx);
    const tzTime1 = Date.UTC(p1.y, p1.m - 1, p1.d, p1.h, p1.min, p1.s);
    const offsetDiff1 = approx.getTime() - tzTime1;

    let candidateUtcMs = approx.getTime() + offsetDiff1;

    // Refinement pass for DST boundary shifts
    const p2 = getTzParts(new Date(candidateUtcMs));
    const tzTime2 = Date.UTC(p2.y, p2.m - 1, p2.d, p2.h, p2.min, p2.s);
    const residualDiff = approx.getTime() - tzTime2;

    if (residualDiff !== 0) {
      candidateUtcMs += residualDiff;
    }

    return candidateUtcMs;
  } catch (err) {
    console.warn(`[ScheduleCalculator] Timezone conversion failed for "${resolvedTz}", falling back to UTC`, err);
    return approx.getTime();
  }
}

/**
 * Calculate the exact reminder trigger time given task parameters
 */
export function calculateReminderTriggerTime(
  dateStr: string,
  timeStr: string | undefined,
  timeZone: string | undefined,
  leadOffset: AdvanceReminder | string
): { dueAtMs: number; reminderAtMs: number; leadOffsetMs: number } {
  const resolvedOffset = (leadOffset in LEAD_OFFSET_MS
    ? LEAD_OFFSET_MS[leadOffset as AdvanceReminder]
    : LEAD_OFFSET_MS['15m']) || 0;

  const dueAtMs = calculateUtcTimestamp(dateStr, timeStr || '09:00', timeZone || 'UTC');
  const reminderAtMs = dueAtMs - resolvedOffset;

  return { dueAtMs, reminderAtMs, leadOffsetMs: resolvedOffset };
}

export interface ReminderTimingEvaluation {
  dueAtMs: number;
  reminderAtMs: number;
  leadOffsetMs: number;
  isPastDue: boolean;
  isPastTrigger: boolean;
  effectiveReminderAtMs: number;
  policyApplied: 'standard' | 'immediate_past_trigger' | 'rejected_past_due';
  message: string;
}

/**
 * Evaluates reminder timing against the documented past-trigger policy.
 *
 * Policy:
 * 1. If task due time is already in the past (dueAt <= now), reject with 'rejected_past_due'.
 * 2. If task is upcoming (dueAt > now) but the offset reminder time has already passed (reminderAt <= now),
 *    schedule for immediate delivery (effectiveReminderAt = now) so the user gets an alert for their upcoming priority.
 * 3. If reminderAt > now, standard scheduled reminder.
 */
export function evaluateReminderTiming(
  dateStr: string,
  timeStr: string | undefined,
  timeZone: string | undefined,
  leadOffset: AdvanceReminder | string,
  nowMs = Date.now()
): ReminderTimingEvaluation {
  const { dueAtMs, reminderAtMs, leadOffsetMs } = calculateReminderTriggerTime(
    dateStr,
    timeStr,
    timeZone,
    leadOffset
  );

  const isPastDue = dueAtMs <= nowMs;
  const isPastTrigger = dueAtMs > nowMs && reminderAtMs <= nowMs;

  if (isPastDue) {
    return {
      dueAtMs,
      reminderAtMs,
      leadOffsetMs,
      isPastDue: true,
      isPastTrigger: false,
      effectiveReminderAtMs: reminderAtMs,
      policyApplied: 'rejected_past_due',
      message: 'Task due date/time has already passed.',
    };
  }

  if (isPastTrigger) {
    return {
      dueAtMs,
      reminderAtMs,
      leadOffsetMs,
      isPastDue: false,
      isPastTrigger: true,
      // Trigger immediately for upcoming tasks whose lead window has already elapsed
      effectiveReminderAtMs: nowMs,
      policyApplied: 'immediate_past_trigger',
      message: 'Reminder lead time has passed; scheduled for immediate delivery.',
    };
  }

  return {
    dueAtMs,
    reminderAtMs,
    leadOffsetMs,
    isPastDue: false,
    isPastTrigger: false,
    effectiveReminderAtMs: reminderAtMs,
    policyApplied: 'standard',
    message: 'Reminder scheduled successfully.',
  };
}

/**
 * Generate a deterministic idempotency key for a task reminder
 */
export function generateReminderId(
  taskId: string,
  dueDate: string,
  dueTime: string | undefined,
  leadOffset: string
): string {
  const time = dueTime || '09:00';
  const idSource = `${taskId}:${dueDate}:${time}:${leadOffset}`;
  const hash = crypto.createHash('sha256').update(idSource).digest('hex').slice(0, 16);
  return `rem-${taskId}-${hash}`;
}

/**
 * Calculate the next due date for recurring tasks
 */
export function calculateNextRecurringDueDate(
  currentDueDate: string,
  recurrence: RecurrenceRule
): string {
  const [y, m, d] = currentDueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  switch (recurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekdays':
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 0 || date.getDay() === 6);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      break;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a timestamp falls within quiet hours in the user's timezone
 */
export function isWithinQuietHours(
  timestampMs: number,
  timeZone: string,
  quietHoursStart = '22:00',
  quietHoursEnd = '07:00'
): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(timestampMs)).map((p) => [p.type, p.value])
    );

    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    const currentMins = hour * 60 + minute;

    const [startH, startM] = quietHoursStart.split(':').map(Number);
    const [endH, endM] = quietHoursEnd.split(':').map(Number);

    const startMins = (startH || 22) * 60 + (startM || 0);
    const endMins = (endH || 7) * 60 + (endM || 0);

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins < endMins;
    } else {
      // Overnight range, e.g. 22:00 to 07:00
      return currentMins >= startMins || currentMins < endMins;
    }
  } catch {
    return false;
  }
}
