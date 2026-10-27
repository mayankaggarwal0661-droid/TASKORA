'use client';

import React from 'react';
import Link from 'next/link';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { TiltCard } from '@/components/ui/TiltCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { CheckCircle2, Flame, Timer, AlertTriangle } from 'lucide-react';

export function QuickStatsBar() {
  const { tasks, routines, focusSessions, todayStr } = useTaskora();
  const today = todayStr;

  // Tasks today
  const todayTasks = tasks.filter(t => t.dueDate === today);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed').length;
  const taskCompletionPct = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  // Active best routine streak
  const bestStreak = routines.reduce((max, r) => Math.max(max, r.currentStreak), 0);

  // Focus minutes today
  const focusMinutesToday = Math.round(
    focusSessions
      .filter(s => s.completedAt.startsWith(today))
      .reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  );

  // Overdue count
  const overdueCount = tasks.filter(t => ScheduleService.isTaskOverdue(t, today)).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Today's Tasks */}
      <Link href="/tasks" className="block">
        <TiltCard glowColor="rgba(113, 131, 104, 0.15)" className="p-4 hover:border-[#718368]/40 transition-all group h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider">Today&apos;s Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#403B34] tracking-tight">
              <AnimatedCounter value={completedTodayTasks} />/{todayTasks.length}
            </span>
            <span className="text-xs text-[#756E64]">completed</span>
          </div>
          <div className="mt-2.5 w-full bg-[#F0EBE2] border border-[#E7E0D5] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#718368] h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionPct}%` }}
            />
          </div>
        </TiltCard>
      </Link>

      {/* 2. Streak Flame */}
      <Link href="/routines" className="block">
        <TiltCard glowColor="rgba(184, 135, 98, 0.15)" className="p-4 hover:border-[#B88762]/40 transition-all group h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider">Habit Streak</span>
            <div className="w-8 h-8 rounded-xl bg-[#F4E9DE] text-[#B88762] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#403B34] tracking-tight">
              <AnimatedCounter value={bestStreak} />
            </span>
            <span className="text-xs text-[#B88762] font-semibold">Days In A Row</span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-2 truncate">
            {routines.filter(r => r.completedDates.includes(today)).length} of {routines.length} routines done today
          </p>
        </TiltCard>
      </Link>

      {/* 3. Focus Log */}
      <Link href="/focus" className="block">
        <TiltCard glowColor="rgba(85, 123, 92, 0.15)" className="p-4 hover:border-[#557B5C]/40 transition-all group h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider">Focus Time</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0E9] text-[#557B5C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#403B34] tracking-tight">
              <AnimatedCounter value={focusMinutesToday} />
            </span>
            <span className="text-xs text-[#756E64]">minutes today</span>
          </div>
          <p className="text-[11px] text-[#557B5C] mt-2 truncate font-medium">
            {focusSessions.filter(s => s.completedAt.startsWith(today)).length} sessions completed
          </p>
        </TiltCard>
      </Link>

      {/* 4. Attention Needed */}
      <Link href="/tasks" className="block">
        <TiltCard
          glowColor={overdueCount > 0 ? 'rgba(185, 87, 80, 0.15)' : 'rgba(85, 123, 92, 0.15)'}
          className="p-4 hover:border-[#B95750]/30 transition-all group h-full flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider">Attention</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${overdueCount > 0 ? 'bg-[#F5E6E5] text-[#B95750]' : 'bg-[#E8F0E9] text-[#557B5C]'}`}>
              {overdueCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#403B34] tracking-tight">
              <AnimatedCounter value={overdueCount} />
            </span>
            <span className={`text-xs font-semibold ${overdueCount > 0 ? 'text-[#B95750]' : 'text-[#557B5C]'}`}>
              {overdueCount > 0 ? 'Tasks Overdue' : 'All on track'}
            </span>
          </div>
          <p className="text-[11px] text-[#756E64] mt-2 truncate">
            {overdueCount > 0 ? 'Needs prompt rescheduling' : 'No overdue priorities'}
          </p>
        </TiltCard>
      </Link>
    </div>
  );
}
