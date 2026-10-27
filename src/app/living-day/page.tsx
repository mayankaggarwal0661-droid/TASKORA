'use client';

import React, { useState, useEffect } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { LivingDayTimeline } from '@/components/timeline/LivingDayTimeline';
import { RealityEngineDrawer } from '@/components/reality/RealityEngineDrawer';
import { CalendarClock, Sparkles } from 'lucide-react';

export default function LivingDayPage() {
  const { todayStr } = useTaskora();
  const [isRealityEngineOpen, setIsRealityEngineOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(todayStr || ScheduleService.FALLBACK_DATE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveDate(todayStr || ScheduleService.getTodayDateString());
  }, [todayStr]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Schedule Visualizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            Living Day
          </h1>
          <p className="text-sm text-[#756E64] mt-1">
            An interactive timeline of your actual scheduled tasks, focus blocks, and daylight capacity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRealityEngineOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#718368] hover:bg-[#557B5C] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs self-start"
        >
          <Sparkles className="w-4 h-4" />
          Open Reality Engine
        </button>
      </div>

      {/* Timeline Component */}
      <LivingDayTimeline
        initialDate={activeDate}
        onOpenRealityEngine={() => setIsRealityEngineOpen(true)}
      />

      {/* Reality Engine Drawer */}
      <RealityEngineDrawer
        isOpen={isRealityEngineOpen}
        onClose={() => setIsRealityEngineOpen(false)}
        targetDate={activeDate}
      />
    </div>
  );
}
