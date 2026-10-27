'use client';

import React from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { TiltCard } from '@/components/ui/TiltCard';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { tasks, routines, focusSessions, openTaskModal, todayStr } = useTaskora();

  const { score, label, trend, breakdown } = AnalyticsService.calculateProductivityScore(
    tasks,
    routines,
    focusSessions,
    todayStr
  );

  const weeklyActivity = AnalyticsService.getWeeklyActivity(tasks, focusSessions, todayStr);
  const categories = AnalyticsService.getCategoryBreakdown(tasks);
  const peakHours = AnalyticsService.getPeakHours(tasks);

  const maxHour = peakHours.reduce((max, h) => (h.count > max.count ? h : max), peakHours[0]);
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const totalFocusHours = (
    focusSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600
  ).toFixed(1);

  const hasZeroActivity = tasks.length === 0 && routines.length === 0 && focusSessions.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            Productivity Analytics
          </h1>
          <p className="text-sm text-[#756E64] mt-1">
            Real metrics calculated exclusively from your actual task deliveries, routine streaks, and focus sessions.
          </p>
        </div>
      </div>

      {/* Clean Account Onboarding Notice */}
      {hasZeroActivity && (
        <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#403B34]">Clean Workspace Initialized</h3>
              <p className="text-xs text-[#756E64] mt-0.5">
                Your analytics will appear here when you start completing tasks and building routines.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => openTaskModal()} className="self-start sm:self-auto">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create First Task
          </Button>
        </div>
      )}

      {/* Top Hero Row: Score Gauge + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Score Circular Gauge */}
        <TiltCard maxTilt={3} className="p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider mb-2">
            Taskora Productivity Score
          </span>
          <ProgressRing
            progress={score}
            size={160}
            strokeWidth={14}
            gradientId="score-gradient"
            startColor="var(--accent, #718368)"
            endColor="var(--accent-hover, #557B5C)"
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-[#403B34] tracking-tight">
                <AnimatedCounter value={score} />
              </span>
              <span className="text-[11px] font-bold text-[#718368] uppercase tracking-wider mt-0.5">
                {label}
              </span>
            </div>
          </ProgressRing>
          <p className="text-xs text-[#756E64] mt-4 max-w-xs">
            {score === 0
              ? 'Complete tasks, maintain habit streaks, and log focus blocks to grow your score.'
              : 'Calculated from on-time task completions, habit consistency, and focus minutes logged.'}
          </p>
        </TiltCard>

        {/* Score Component Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight mb-1">Score Breakdown</h3>
            <p className="text-xs text-[#756E64] mb-5">Factors impacting your daily efficiency calculation</p>

            <div className="space-y-4">
              {/* Task Completion */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#403B34] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#718368]" />
                    Task Completion &amp; Velocity
                  </span>
                  <span className="font-bold text-[#403B34]">
                    <AnimatedCounter value={breakdown.tasksScore} /> / 45 pts
                  </span>
                </div>
                <div className="w-full bg-[#F0EBE2] h-2 rounded-full overflow-hidden border border-[#E7E0D5]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.tasksScore / 45) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#718368]"
                  />
                </div>
              </div>

              {/* Routine Habit */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#403B34] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#A97535]" />
                    Habit Rituals &amp; Streaks
                  </span>
                  <span className="font-bold text-[#403B34]">
                    <AnimatedCounter value={breakdown.routinesScore} /> / 35 pts
                  </span>
                </div>
                <div className="w-full bg-[#F0EBE2] h-2 rounded-full overflow-hidden border border-[#E7E0D5]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.routinesScore / 35) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#A97535]"
                  />
                </div>
              </div>

              {/* Focus */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#403B34] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#B88762]" />
                    Deep Focus Hours
                  </span>
                  <span className="font-bold text-[#403B34]">
                    <AnimatedCounter value={breakdown.focusScore} /> / 20 pts
                  </span>
                </div>
                <div className="w-full bg-[#F0EBE2] h-2 rounded-full overflow-hidden border border-[#E7E0D5]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(breakdown.focusScore / 20) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-[#B88762]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E7E0D5] text-center mt-4">
            <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <div className="text-[11px] text-[#968D81]">Total Completed</div>
              <div className="text-lg font-bold text-[#403B34]">
                <AnimatedCounter value={totalCompleted} />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <div className="text-[11px] text-[#968D81]">Focus Hours</div>
              <div className="text-lg font-bold text-[#403B34]">{totalFocusHours}h</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <div className="text-[11px] text-[#968D81]">Active Habits</div>
              <div className="text-lg font-bold text-[#403B34]">
                <AnimatedCounter value={routines.length} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Category Breakdown + 7-Day Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5] mb-4">
              <div>
                <h3 className="text-base font-bold text-[#403B34] tracking-tight">Category Distribution</h3>
                <p className="text-xs text-[#756E64] mt-0.5">Task distribution across productivity pillars</p>
              </div>
              <PieChart className="w-4 h-4 text-[#718368]" />
            </div>

            {categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#968D81] border border-dashed border-[#E7E0D5] rounded-xl bg-[#FBF9F5]">
                No categorized tasks yet. Tasks you create will populate this breakdown.
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((c, i) => (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#403B34] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.category}
                      </span>
                      <span className="text-[#756E64] font-mono">
                        {c.count} tasks ({c.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F0EBE2] h-1.5 rounded-full overflow-hidden border border-[#E7E0D5]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.percentage}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Velocity Chart */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5] mb-4">
            <div>
              <h3 className="text-base font-bold text-[#403B34] tracking-tight">7-Day Velocity</h3>
              <p className="text-xs text-[#756E64] mt-0.5">Throughput comparison by calendar day</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#718368]" />
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyActivity.map((day, idx) => {
              const maxVal = Math.max(1, ...weeklyActivity.map((d) => Math.max(d.completedCount, d.createdCount)));
              const compHeight = day.completedCount > 0 ? Math.max(12, Math.round((day.completedCount / maxVal) * 100)) : 4;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="w-full max-w-[28px] h-32 flex items-end justify-center rounded-xl bg-[#F0EBE2] border border-[#E7E0D5] p-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${compHeight}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.04 }}
                      className={`w-full rounded-lg transition-colors ${
                        day.completedCount > 0 ? 'bg-[#718368] group-hover:bg-[#5F7157]' : 'bg-[#E7E0D5]'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#756E64] mt-2">{day.dayLabel}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E7E0D5] text-xs text-[#756E64]">
            <span>
              Peak output:{' '}
              <strong className="text-[#403B34]">
                {maxHour && maxHour.count > 0 ? maxHour.label : 'No completed tasks yet'}
              </strong>
            </span>
            <span className="text-[#557B5C] font-semibold">{trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
