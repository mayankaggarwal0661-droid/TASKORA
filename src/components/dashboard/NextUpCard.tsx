'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TiltCard } from '@/components/ui/TiltCard';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import {
  Clock,
  CheckCircle2,
  Timer,
  Edit2,
  Calendar,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export function NextUpCard() {
  const router = useRouter();
  const { tasks, toggleTaskComplete, openTaskModal, todayStr } = useTaskora();
  const nextUp = ScheduleService.getNextUpTask(tasks, todayStr);

  if (!nextUp.task) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F0E9] border border-[#557B5C]/30 text-[#557B5C] flex items-center justify-center">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#403B34]">All Caught Up!</h3>
            <p className="text-xs text-[#756E64] mt-0.5">
              No pending tasks right now. Relax or plan ahead for tomorrow.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openTaskModal()}>
          Plan New Task
        </Button>
      </div>
    );
  }

  const { task, countdown, isOverdue } = nextUp;

  const handleStartFocus = () => {
    soundService.playClick();
    router.push(`/focus?taskId=${task.id}`);
  };

  const handleComplete = () => {
    soundService.playTaskComplete();
    triggerCelebration(0.5, 0.35);
    toggleTaskComplete(task.id);
  };

  return (
    <TiltCard
      maxTilt={3}
      glowColor="rgba(113, 131, 104, 0.15)"
      className="p-6 bg-[#FBF9F5] border border-[#D9D0C3] shadow-md"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Task Info */}
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-2.5 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-[#718368]" />
              Next Up Spotlight
            </span>
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            
            {/* Live countdown chip */}
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                isOverdue
                  ? 'bg-[#F5E6E5] text-[#B95750] border-[#B95750]/30 animate-pulse'
                  : 'bg-white text-[#403B34] border border-[#E7E0D5]'
              }`}
            >
              <Clock className="w-3 h-3" />
              {countdown}
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#403B34] tracking-tight">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs sm:text-sm text-[#756E64] mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#968D81]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#968D81]" />
              {ScheduleService.formatFriendlyDate(task.dueDate, todayStr)} {task.dueTime ? `at ${task.dueTime}` : ''}
            </span>
            {task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Subtasks done
              </span>
            )}
            {task.recurrence !== 'none' && (
              <span className="capitalize text-[#718368] font-medium">Repeats {task.recurrence}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartFocus}
            className="flex items-center gap-1.5"
          >
            <Timer className="w-4 h-4 text-[#718368]" />
            <span>Focus Now</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              soundService.playClick();
              openTaskModal(task);
            }}
            className="flex items-center gap-1.5"
            title="Edit Task Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleComplete}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete</span>
          </Button>
        </div>
      </div>
    </TiltCard>
  );
}
