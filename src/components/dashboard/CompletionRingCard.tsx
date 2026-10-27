'use client';

import React from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { CheckCircle2, ListTodo, Award } from 'lucide-react';

export function CompletionRingCard() {
  const { tasks, todayStr } = useTaskora();
  const today = todayStr;

  const todayTasks = tasks.filter(t => t.dueDate === today);
  const completedToday = todayTasks.filter(t => t.status === 'completed');
  const pendingToday = todayTasks.filter(t => t.status !== 'completed');

  const total = todayTasks.length;
  const completedCount = completedToday.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Subtasks calculation
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  todayTasks.forEach(t => {
    t.subtasks.forEach(s => {
      totalSubtasks++;
      if (s.completed) completedSubtasks++;
    });
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight">Daily Completion</h3>
          <p className="text-xs text-[#756E64] mt-0.5">Tasks scheduled for today</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30">
          Today
        </span>
      </div>

      <div className="flex items-center justify-center my-3">
        <ProgressRing
          progress={percentage}
          size={140}
          strokeWidth={12}
          gradientId="daily-ring-gradient"
          startColor="var(--accent, #718368)"
          endColor="var(--accent-hover, #557B5C)"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-[#403B34] tracking-tight">
              <AnimatedCounter value={percentage} suffix="%" />
            </span>
            <span className="text-[10px] text-[#968D81] uppercase font-semibold">Done</span>
          </div>
        </ProgressRing>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E7E0D5] text-center">
        <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#557B5C] font-semibold mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Done</span>
          </div>
          <span className="text-base font-bold text-[#403B34]">
            <AnimatedCounter value={completedCount} />
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#B88762] font-semibold mb-1">
            <ListTodo className="w-3 h-3" />
            <span>Pending</span>
          </div>
          <span className="text-base font-bold text-[#403B34]">
            <AnimatedCounter value={pendingToday.length} />
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#A97535] font-semibold mb-1">
            <Award className="w-3 h-3" />
            <span>Subtasks</span>
          </div>
          <span className="text-base font-bold text-[#403B34]">
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      </div>
    </div>
  );
}
