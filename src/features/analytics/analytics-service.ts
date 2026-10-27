import { Task } from '@/types/task';
import { Routine } from '@/types/routine';
import { FocusSession } from '@/types/focus';
import { ScheduleService } from '@/features/scheduling/schedule-service';

export interface DailyActivityPoint {
  date: string;
  dayLabel: string;
  completedCount: number;
  createdCount: number;
  focusMinutes: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export class AnalyticsService {
  /**
   * Calculate a comprehensive Productivity Score (0 - 100) exclusively from actual user activity.
   * Never fabricates metrics or provides artificial baseline scores.
   */
  public static calculateProductivityScore(
    tasks: Task[],
    routines: Routine[],
    focusSessions: FocusSession[],
    todayStr?: string
  ): {
    score: number;
    label: string;
    trend: 'up' | 'stable' | 'down';
    breakdown: { tasksScore: number; routinesScore: number; focusScore: number };
  } {
    const today = todayStr || ScheduleService.getTodayDateString();

    // 1. Task Completion Weight (Max 45 pts)
    let tasksScore = 0;
    if (tasks.length > 0) {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
      const overdueCount = tasks.filter((t) => ScheduleService.isTaskOverdue(t, today)).length;
      const overduePenalty = Math.min(15, overdueCount * 3);
      tasksScore = Math.max(0, Math.round(completionRatio * 45 - overduePenalty));
    }

    // 2. Routine Streak Weight (Max 35 pts)
    let routinesScore = 0;
    if (routines.length > 0) {
      const activeRoutines = routines.filter((r) => r.active);
      const totalRoutines = activeRoutines.length || 1;
      const completedToday = activeRoutines.filter((r) => r.completedDates.includes(today)).length;
      const todayRatio = completedToday / totalRoutines;
      const avgStreak = activeRoutines.reduce((acc, r) => acc + r.currentStreak, 0) / totalRoutines;
      routinesScore = Math.min(35, Math.round(todayRatio * 20 + Math.min(15, avgStreak * 2.5)));
    }

    // 3. Focus Mode Factor (Max 20 pts)
    const todayFocusSecs = focusSessions
      .filter((s) => s.completedAt.startsWith(today))
      .reduce((sum, s) => sum + s.durationSeconds, 0);
    const focusMins = Math.round(todayFocusSecs / 60);
    const focusScore = Math.min(20, Math.round((focusMins / 60) * 20));

    // Pure sum derived exclusively from real user deliverables
    const totalScore = Math.min(100, Math.max(0, tasksScore + routinesScore + focusScore));

    let label = 'Getting Started';
    if (totalScore >= 85) label = 'Exceptional';
    else if (totalScore >= 70) label = 'Highly Focused';
    else if (totalScore >= 50) label = 'Productive';
    else if (totalScore >= 25) label = 'Steady';
    else if (totalScore > 0) label = 'Developing';

    return {
      score: totalScore,
      label,
      trend: totalScore >= 70 ? 'up' : 'stable',
      breakdown: { tasksScore, routinesScore, focusScore },
    };
  }

  /**
   * Get 7-day activity metrics for charts strictly from user records
   */
  public static getWeeklyActivity(
    tasks: Task[],
    focusSessions: FocusSession[],
    todayStr?: string
  ): DailyActivityPoint[] {
    const today = todayStr || ScheduleService.getTodayDateString();
    const days: DailyActivityPoint[] = [];
    const [y, m, d] = today.split('-').map(Number);
    const baseDate = new Date(y, m - 1, d);

    for (let i = 6; i >= 0; i--) {
      const cur = new Date(baseDate);
      cur.setDate(cur.getDate() - i);

      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayLabel = cur.toLocaleDateString('en-US', { weekday: 'short' });

      const completedOnDate = tasks.filter(
        (t) => t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;
      const createdOnDate = tasks.filter(
        (t) => t.createdAt && t.createdAt.startsWith(dateStr)
      ).length;

      const focusSecs = focusSessions
        .filter((s) => s.completedAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.durationSeconds, 0);

      days.push({
        date: dateStr,
        dayLabel,
        completedCount: completedOnDate,
        createdCount: createdOnDate,
        focusMinutes: Math.round(focusSecs / 60),
      });
    }

    return days;
  }

  /**
   * Category breakdown with assigned colors
   */
  public static getCategoryBreakdown(tasks: Task[]): CategoryBreakdown[] {
    if (tasks.length === 0) return [];

    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const categoryColors: Record<string, string> = {
      work: '#718368',
      personal: '#B88762',
      health: '#557B5C',
      finance: '#A97535',
      learning: '#8B5CF6',
      routine: '#38BDF8',
    };

    const total = tasks.length || 1;
    return Object.entries(counts)
      .map(([cat, count]) => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        count,
        percentage: Math.round((count / total) * 100),
        color: categoryColors[cat] || '#718368',
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Peak productivity hours distribution (0 to 23 hours) based strictly on completed timestamps
   */
  public static getPeakHours(tasks: Task[]): { hour: number; label: string; count: number }[] {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
      count: 0,
    }));

    tasks
      .filter((t) => t.status === 'completed' && t.completedAt)
      .forEach((t) => {
        try {
          const d = new Date(t.completedAt!);
          const h = d.getHours();
          if (hours[h]) {
            hours[h].count++;
          }
        } catch {}
      });

    return hours;
  }
}
