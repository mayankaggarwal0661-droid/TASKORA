import { Task, RecurrenceRule } from '@/types/task';

export class ScheduleService {
  /**
   * Deterministic fallback anchor date for SSR and prerendering passes
   */
  public static readonly FALLBACK_DATE = '2026-10-26';

  /**
   * Get today's ISO date string: YYYY-MM-DD
   */
  public static getTodayDateString(referenceDate?: Date): string {
    if (referenceDate) {
      const year = referenceDate.getFullYear();
      const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
      const day = String(referenceDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    if (typeof window === 'undefined') {
      return this.FALLBACK_DATE;
    }

    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format friendly date (e.g. "Today", "Tomorrow", "Yesterday", or "Oct 28")
   */
  public static formatFriendlyDate(dateStr: string, todayStr?: string): string {
    if (!dateStr) return '';
    const today = todayStr || this.getTodayDateString();
    if (dateStr === today) return 'Today';

    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const [tY, tM, tD] = today.split('-').map(Number);
    const now = new Date(tY, tM - 1, tD);

    const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Check if a task is overdue
   */
  public static isTaskOverdue(task: Task, todayStr?: string): boolean {
    if (task.status === 'completed' || !task.dueDate) return false;
    const today = todayStr || this.getTodayDateString();
    if (task.dueDate < today) return true;

    if (task.dueDate === today && task.dueTime && typeof window !== 'undefined') {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [h, m] = task.dueTime.split(':').map(Number);
      const taskMinutes = (h || 0) * 60 + (m || 0);
      return currentMinutes > taskMinutes;
    }

    return false;
  }

  /**
   * Categorize tasks into Today, Overdue, Upcoming, Completed
   */
  public static categorizeTasks(tasks: Task[], todayStr?: string) {
    const today = todayStr || this.getTodayDateString();
    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed.push(task);
        continue;
      }

      if (this.isTaskOverdue(task, today)) {
        overdue.push(task);
      } else if (task.dueDate === today) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    }

    // Sort overdue by oldest first
    overdue.sort((a, b) => `${a.dueDate} ${a.dueTime || '00:00'}`.localeCompare(`${b.dueDate} ${b.dueTime || '00:00'}`));

    // Sort today by earliest time first
    dueToday.sort((a, b) => (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59'));

    // Sort upcoming by date ascending
    upcoming.sort((a, b) => `${a.dueDate} ${a.dueTime || '00:00'}`.localeCompare(`${b.dueDate} ${b.dueTime || '00:00'}`));

    // Sort completed by most recently completed
    completed.sort((a, b) => (b.completedAt || b.createdAt).localeCompare(a.completedAt || a.createdAt));

    return { overdue, dueToday, upcoming, completed };
  }

  /**
   * Find the "Next Up" task that user should focus on
   */
  public static getNextUpTask(tasks: Task[], todayStr?: string): { task: Task | null; countdown: string; isOverdue: boolean } {
    const today = todayStr || this.getTodayDateString();
    const { overdue, dueToday, upcoming } = this.categorizeTasks(tasks, today);

    if (overdue.length > 0) {
      const topOverdue = overdue[0];
      return {
        task: topOverdue,
        countdown: 'Overdue now',
        isOverdue: true
      };
    }

    if (dueToday.length > 0) {
      const topToday = dueToday[0];
      if (topToday.dueTime && typeof window !== 'undefined') {
        const now = new Date();
        const [h, m] = topToday.dueTime.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);

        const diffMinutes = Math.round((target.getTime() - now.getTime()) / 60000);
        if (diffMinutes <= 0) {
          return { task: topToday, countdown: 'Starting now', isOverdue: false };
        } else if (diffMinutes < 60) {
          return { task: topToday, countdown: `in ${diffMinutes}m`, isOverdue: false };
        } else {
          const hours = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          return { task: topToday, countdown: `in ${hours}h ${mins > 0 ? `${mins}m` : ''}`, isOverdue: false };
        }
      }
      return { task: topToday, countdown: 'Due Today', isOverdue: false };
    }

    if (upcoming.length > 0) {
      const topUpcoming = upcoming[0];
      return {
        task: topUpcoming,
        countdown: this.formatFriendlyDate(topUpcoming.dueDate, today),
        isOverdue: false
      };
    }

    return { task: null, countdown: 'All caught up!', isOverdue: false };
  }

  /**
   * Calculate next due date for recurring tasks
   */
  public static calculateNextDueDate(currentDueDate: string, recurrence: RecurrenceRule): string {
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
}
