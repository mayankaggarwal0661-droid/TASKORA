import { Task } from '@/types/task';
import { FocusSession } from '@/types/focus';

export interface ScheduleConflict {
  id: string;
  taskA: Task;
  taskB: Task;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  overlapMinutes: number;
}

export interface ScheduleSuggestion {
  id: string;
  taskId: string;
  taskTitle: string;
  currentDate: string;
  currentTime?: string;
  proposedDate: string;
  proposedTime?: string;
  reason: string;
  impactMinutes: number;
  priority: Task['priority'];
  category: Task['category'];
}

export interface RealityEngineAnalysis {
  targetDate: string;
  dayCapacityMinutes: number; // default 480 (8h)
  scheduledCommitmentsMinutes: number;
  unscheduledTasksMinutes: number;
  focusMinutesLogged: number;
  totalWorkloadMinutes: number;
  remainingCapacityMinutes: number;
  isOverloaded: boolean;
  overloadAmountMinutes: number;
  confirmedEstimatesCount: number;
  missingEstimatesCount: number;
  conflicts: ScheduleConflict[];
  suggestions: ScheduleSuggestion[];
  statusSummary: {
    headline: string;
    description: string;
    tone: 'balanced' | 'moderate' | 'overloaded';
  };
}

export class RealityEngineService {
  /**
   * Convert HH:mm to minutes from midnight
   */
  public static timeToMinutes(timeStr?: string): number | null {
    if (!timeStr) return null;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return parts[0] * 60 + parts[1];
  }

  /**
   * Convert minutes from midnight to HH:mm
   */
  public static minutesToTime(minutes: number): string {
    const norm = Math.max(0, Math.min(23 * 60 + 59, Math.round(minutes)));
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Analyze workload, commitments, overlaps, and produce explainable suggestions
   */
  public static analyzeDay(
    tasks: Task[],
    focusSessions: FocusSession[],
    targetDateStr: string,
    dayCapacityMinutes = 480 // 8 hours daylight capacity
  ): RealityEngineAnalysis {
    const dayTasks = tasks.filter(t => t.dueDate === targetDateStr && t.status !== 'completed');
    
    // Relevant focus sessions logged on this date
    const dayFocusSessions = focusSessions.filter(s => {
      if (!s.completedAt) return false;
      return s.completedAt.startsWith(targetDateStr);
    });

    const focusMinutesLogged = Math.round(
      dayFocusSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    let scheduledCommitmentsMinutes = 0;
    let unscheduledTasksMinutes = 0;
    let confirmedEstimatesCount = 0;
    let missingEstimatesCount = 0;

    const scheduledItems: { task: Task; startMins: number; endMins: number; duration: number }[] = [];

    dayTasks.forEach(task => {
      const duration = task.estimatedMinutes && task.estimatedMinutes > 0 ? task.estimatedMinutes : 30;
      if (task.estimatedMinutes && task.estimatedMinutes > 0) {
        confirmedEstimatesCount++;
      } else {
        missingEstimatesCount++;
      }

      const startMins = this.timeToMinutes(task.dueTime);
      if (startMins !== null) {
        scheduledCommitmentsMinutes += duration;
        scheduledItems.push({
          task,
          startMins,
          endMins: startMins + duration,
          duration,
        });
      } else {
        unscheduledTasksMinutes += duration;
      }
    });

    // Detect Conflicts (overlaps in time)
    scheduledItems.sort((a, b) => a.startMins - b.startMins);
    const conflicts: ScheduleConflict[] = [];

    for (let i = 0; i < scheduledItems.length; i++) {
      for (let j = i + 1; j < scheduledItems.length; j++) {
        const itemA = scheduledItems[i];
        const itemB = scheduledItems[j];

        // Check overlap
        if (itemA.endMins > itemB.startMins) {
          const overlapStart = Math.max(itemA.startMins, itemB.startMins);
          const overlapEnd = Math.min(itemA.endMins, itemB.endMins);
          const overlapMinutes = Math.max(0, overlapEnd - overlapStart);

          if (overlapMinutes > 0) {
            conflicts.push({
              id: `conflict-${itemA.task.id}-${itemB.task.id}`,
              taskA: itemA.task,
              taskB: itemB.task,
              startTime: this.minutesToTime(overlapStart),
              endTime: this.minutesToTime(overlapEnd),
              overlapMinutes,
            });
          }
        }
      }
    }

    const totalWorkloadMinutes = scheduledCommitmentsMinutes + unscheduledTasksMinutes;
    const remainingCapacityMinutes = dayCapacityMinutes - totalWorkloadMinutes;
    const isOverloaded = remainingCapacityMinutes < 0;
    const overloadAmountMinutes = isOverloaded ? Math.abs(remainingCapacityMinutes) : 0;

    // Generate Deterministic Actionable Suggestions
    const suggestions: ScheduleSuggestion[] = [];

    // 1. Conflict resolution suggestions
    conflicts.forEach(c => {
      // Determine lower priority task
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const taskAWeight = priorityWeight[c.taskA.priority] || 2;
      const taskBWeight = priorityWeight[c.taskB.priority] || 2;

      const flexibleTask = taskAWeight <= taskBWeight ? c.taskA : c.taskB;
      const anchorTask = flexibleTask.id === c.taskA.id ? c.taskB : c.taskA;

      const anchorStart = this.timeToMinutes(anchorTask.dueTime) || 840;
      const anchorDuration = anchorTask.estimatedMinutes || 30;
      const proposedMinutes = anchorStart + anchorDuration + 15; // 15m breathing gap

      const proposedTime = this.minutesToTime(proposedMinutes);

      suggestions.push({
        id: `sug-conflict-${c.id}`,
        taskId: flexibleTask.id,
        taskTitle: flexibleTask.title,
        currentDate: flexibleTask.dueDate,
        currentTime: flexibleTask.dueTime,
        proposedDate: flexibleTask.dueDate,
        proposedTime,
        reason: `Eliminates the ${c.overlapMinutes}m schedule overlap with "${anchorTask.title}" (${anchorTask.priority.toUpperCase()} priority).`,
        impactMinutes: c.overlapMinutes,
        priority: flexibleTask.priority,
        category: flexibleTask.category,
      });
    });

    // 2. Capacity rebalancing suggestions if overloaded
    if (isOverloaded) {
      // Pick tasks that are low or medium priority and not critical
      const rebalanceCandidates = dayTasks
        .filter(t => t.priority === 'low' || t.priority === 'medium')
        .sort((a, _b) => (a.priority === 'low' ? -1 : 1));

      // Calculate tomorrow's date string
      const [y, m, d] = targetDateStr.split('-').map(Number);
      const tomorrowObj = new Date(y, m - 1, d + 1);
      const tomorrowStr = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;

      let reclaimed = 0;
      for (const cand of rebalanceCandidates) {
        if (reclaimed >= overloadAmountMinutes) break;
        // Don't duplicate suggestion if already in conflict suggestions
        if (suggestions.some(s => s.taskId === cand.id)) continue;

        const dur = cand.estimatedMinutes || 30;
        reclaimed += dur;

        suggestions.push({
          id: `sug-rebalance-${cand.id}`,
          taskId: cand.id,
          taskTitle: cand.title,
          currentDate: cand.dueDate,
          currentTime: cand.dueTime,
          proposedDate: tomorrowStr,
          proposedTime: '10:30',
          reason: `Reclaims ${dur}m of bandwidth to bring today's workload within your ${Math.round(dayCapacityMinutes / 60)}h capacity goal.`,
          impactMinutes: dur,
          priority: cand.priority,
          category: cand.category,
        });
      }
    }

    // Status Summary Text (calm, non-alarmist, transparent)
    let headline = 'Daylight Workload Balanced';
    let description = `Your scheduled commitments (${Math.round(totalWorkloadMinutes / 60)}h ${totalWorkloadMinutes % 60}m) fit comfortably within your available capacity. You have ${Math.round(remainingCapacityMinutes / 60)}h ${remainingCapacityMinutes % 60}m of open bandwidth.`;
    let tone: 'balanced' | 'moderate' | 'overloaded' = 'balanced';

    if (isOverloaded) {
      headline = 'Workload Exceeds Target Daylight';
      description = `Your total planned commitments exceed the standard ${Math.round(dayCapacityMinutes / 60)}h work window by ${Math.round(overloadAmountMinutes / 60)}h ${overloadAmountMinutes % 60}m. Review suggested task adjustments below to restore equilibrium.`;
      tone = 'overloaded';
    } else if (remainingCapacityMinutes < 60) {
      headline = 'Tight Day Schedule';
      description = `You have ${remainingCapacityMinutes}m of remaining buffer today. High task density with minimal recovery breaks between blocks.`;
      tone = 'moderate';
    }

    return {
      targetDate: targetDateStr,
      dayCapacityMinutes,
      scheduledCommitmentsMinutes,
      unscheduledTasksMinutes,
      focusMinutesLogged,
      totalWorkloadMinutes,
      remainingCapacityMinutes: Math.max(0, remainingCapacityMinutes),
      isOverloaded,
      overloadAmountMinutes,
      confirmedEstimatesCount,
      missingEstimatesCount,
      conflicts,
      suggestions,
      statusSummary: {
        headline,
        description,
        tone,
      },
    };
  }
}
