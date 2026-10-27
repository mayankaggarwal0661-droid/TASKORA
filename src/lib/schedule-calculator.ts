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
 * Accurately convert local date, time, and IANA timezone to UTC epoch milliseconds,
 * automatically accounting for Daylight Saving Time (DST).
 */
export function calculateUtcTimestamp(
  dateStr: string,
  timeStr = '09:00',
  timeZone = 'UTC'
): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);

  // Approximate UTC date
  const approx = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0));

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(approx).map((p) => [p.type, p.value])
    );

    const tzYear = Number(parts.year);
    const tzMonth = Number(parts.month);
    const tzDay = Number(parts.day);
    let tzHour = Number(parts.hour);
    if (tzHour === 24) tzHour = 0;
    const tzMin = Number(parts.minute);

    const tzTime = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
    const offsetDiff = approx.getTime() - tzTime;

    return approx.getTime() + offsetDiff;
  } catch (err) {
    console.warn(`[ScheduleCalculator] Invalid timezone "${timeZone}", falling back to UTC`, err);
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
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(timestampMs)).map((p) => [p.type, p.value])
    );

    let hour = Number(parts.hour);
    if (hour === 24) hour = 0;
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
