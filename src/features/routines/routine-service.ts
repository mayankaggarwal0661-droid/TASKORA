import { Routine } from '@/types/routine';
import { ScheduleService } from '@/features/scheduling/schedule-service';

export class RoutineService {
  /**
   * Determine if routine is completed for a given date
   */
  public static isCompletedOnDate(routine: Routine, dateStr: string): boolean {
    return routine.completedDates.includes(dateStr);
  }

  /**
   * Toggle completion for a routine on a given date (defaults to today)
   */
  public static toggleRoutineCompletion(routine: Routine, dateStr?: string): Routine {
    const targetDate = dateStr || ScheduleService.getTodayDateString();
    const alreadyCompleted = routine.completedDates.includes(targetDate);
    let newCompletedDates: string[];

    if (alreadyCompleted) {
      newCompletedDates = routine.completedDates.filter(d => d !== targetDate);
    } else {
      newCompletedDates = [...routine.completedDates, targetDate].sort();
    }

    // Recalculate current streak
    const currentStreak = this.calculateCurrentStreak(newCompletedDates, targetDate);
    const bestStreak = Math.max(routine.bestStreak, currentStreak);

    return {
      ...routine,
      completedDates: newCompletedDates,
      currentStreak,
      bestStreak
    };
  }

  /**
   * Calculate consecutive streak from completed date list
   */
  public static calculateCurrentStreak(completedDates: string[], todayStr?: string): number {
    if (!completedDates || completedDates.length === 0) return 0;

    const todayString = todayStr || ScheduleService.getTodayDateString();
    const dateSet = new Set(completedDates);
    const [y, m, d] = todayString.split('-').map(Number);
    const today = new Date(y, m - 1, d);
    
    // Check if streak is active today or yesterday
    const checkDate = new Date(today);
    let streak = 0;

    // If today is completed, start streak from today, otherwise check yesterday
    if (!dateSet.has(todayString)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      if (dateSet.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate array of last N days for habit heatmap
   */
  public static getHeatmapDays(daysCount = 28, todayStr?: string): { dateStr: string; dayNumber: number; dayName: string; isToday: boolean }[] {
    const todayString = todayStr || ScheduleService.getTodayDateString();
    const result = [];
    const [y, m, d] = todayString.split('-').map(Number);
    const today = new Date(y, m - 1, d);

    for (let i = daysCount - 1; i >= 0; i--) {
      const cur = new Date(today);
      cur.setDate(cur.getDate() - i);

      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      result.push({
        dateStr,
        dayNumber: cur.getDate(),
        dayName: cur.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: dateStr === todayStr
      });
    }

    return result;
  }
}
