'use client';

import React, { useState } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { BarChart2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function WeeklyActivityChart() {
  const { tasks, focusSessions, todayStr } = useTaskora();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const weeklyData = AnalyticsService.getWeeklyActivity(tasks, focusSessions, todayStr);
  const maxVal = Math.max(1, ...weeklyData.map(d => d.completedCount));

  const totalCompletedWeek = weeklyData.reduce((sum, d) => sum + d.completedCount, 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#403B34] tracking-tight">Weekly Throughput</h3>
            <span className="text-[11px] font-semibold text-[#557B5C] bg-[#E8F0E9] border border-[#557B5C]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {totalCompletedWeek} completed
            </span>
          </div>
          <p className="text-xs text-[#756E64] mt-0.5">Tasks delivered over the past 7 days</p>
        </div>
        <div className="p-2 rounded-xl bg-[#EAF0E5] text-[#718368]">
          <BarChart2 className="w-4 h-4" />
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-1 relative">
        {weeklyData.map((day, idx) => {
          const heightPct = Math.max(12, Math.round((day.completedCount / maxVal) * 100));
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-white text-[#403B34] text-[11px] py-1 px-2.5 rounded-lg border border-[#E7E0D5] shadow-lg whitespace-nowrap pointer-events-none">
                  <div className="font-bold">{day.completedCount} Tasks</div>
                  <div className="text-[10px] text-[#756E64]">{day.focusMinutes}m focus</div>
                </div>
              )}

              {/* Bar Container */}
              <div className="w-full max-w-[32px] h-32 flex items-end justify-center rounded-xl bg-[#F0EBE2] border border-[#E7E0D5] p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                  className={`w-full rounded-lg transition-all ${
                    isHovered
                      ? 'bg-[#5F7157] shadow-sm'
                      : day.completedCount > 0
                      ? 'bg-[#718368]'
                      : 'bg-[#E7E0D5]'
                  }`}
                />
              </div>

              {/* Day Label */}
              <span
                suppressHydrationWarning
                className={`text-[11px] font-medium mt-2 transition-colors ${
                  isHovered ? 'text-[#718368] font-bold' : 'text-[#968D81]'
                }`}
              >
                {day.dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart Footer Legend */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E7E0D5] text-[11px] text-[#756E64]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#718368]" />
          Completed output
        </span>
        <span className="font-mono text-[#968D81]">Last 7 Days</span>
      </div>
    </div>
  );
}
