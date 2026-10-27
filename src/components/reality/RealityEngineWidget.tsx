'use client';

import React, { useState } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { RealityEngineService } from '@/features/reality-engine/reality-engine-service';
import { RealityEngineDrawer } from './RealityEngineDrawer';
import { soundService } from '@/features/audio/sound-service';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export function RealityEngineWidget() {
  const { tasks, focusSessions, todayStr } = useTaskora();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const analysis = RealityEngineService.analyzeDay(tasks, focusSessions, todayStr);

  const percentUsed = Math.min(
    100,
    Math.round((analysis.totalWorkloadMinutes / analysis.dayCapacityMinutes) * 100)
  );

  return (
    <>
      <div className="p-5 rounded-2xl bg-white border border-[#E7E0D5] shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#718368]" />
              <h3 className="text-sm font-bold text-[#403B34] tracking-tight">Reality Engine</h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                analysis.isOverloaded
                  ? 'bg-[#FBF5F2] text-[#B88762] border border-[#B88762]/30'
                  : analysis.conflicts.length > 0
                  ? 'bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30'
                  : 'bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30'
              }`}
            >
              {analysis.statusSummary.tone}
            </span>
          </div>

          <p className="text-xs text-[#756E64] line-clamp-2">
            {analysis.statusSummary.description}
          </p>
        </div>

        {/* Daylight Capacity Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#403B34] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#718368]" />
              Daylight Bandwidth
            </span>
            <span className="font-mono text-[#756E64]">
              {Math.round(analysis.totalWorkloadMinutes / 60)}h {analysis.totalWorkloadMinutes % 60}m /{' '}
              {Math.round(analysis.dayCapacityMinutes / 60)}h ({percentUsed}%)
            </span>
          </div>

          <div className="w-full bg-[#F0EBE2] h-2 rounded-full overflow-hidden border border-[#E7E0D5]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${
                analysis.isOverloaded
                  ? 'bg-[#B88762]'
                  : analysis.conflicts.length > 0
                  ? 'bg-[#B95750]'
                  : 'bg-[#718368]'
              }`}
            />
          </div>
        </div>

        {/* Footer trigger button */}
        <div className="pt-2 border-t border-[#E7E0D5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#968D81]">
            {analysis.conflicts.length > 0 ? (
              <span className="text-[#B95750] font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {analysis.conflicts.length} Overlap(s)
              </span>
            ) : (
              <span className="text-[#557B5C] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Capacity Balanced
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-[#718368] hover:text-[#557B5C] transition-colors cursor-pointer"
          >
            <span>Inspect Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <RealityEngineDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        targetDate={todayStr}
      />
    </>
  );
}
