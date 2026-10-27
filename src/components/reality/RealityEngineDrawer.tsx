'use client';

import React, { useState } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { RealityEngineService, RealityEngineAnalysis, ScheduleSuggestion } from '@/features/reality-engine/reality-engine-service';
import { Modal } from '@/components/ui/Modal';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { soundService } from '@/features/audio/sound-service';
import {
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
  Scale,
  X,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealityEngineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
}

export function RealityEngineDrawer({ isOpen, onClose, targetDate }: RealityEngineDrawerProps) {
  const { tasks, focusSessions, todayStr, rescheduleTask } = useTaskora();
  const activeDate = targetDate || todayStr || '2026-10-25';

  const analysis: RealityEngineAnalysis = RealityEngineService.analyzeDay(
    tasks,
    focusSessions,
    activeDate
  );

  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Set<string>>(new Set());
  const [previewSuggestion, setPreviewSuggestion] = useState<ScheduleSuggestion | null>(null);

  const handleApplySuggestion = (sug: ScheduleSuggestion) => {
    soundService.playTaskComplete();
    rescheduleTask(
      sug.taskId,
      sug.proposedDate,
      sug.proposedTime,
      undefined,
      sug.reason
    );
    setAppliedSuggestionIds(prev => new Set(prev).add(sug.id));
    setPreviewSuggestion(null);
  };

  const handleApplyAll = () => {
    soundService.playTaskComplete();
    analysis.suggestions.forEach(sug => {
      if (!appliedSuggestionIds.has(sug.id)) {
        rescheduleTask(
          sug.taskId,
          sug.proposedDate,
          sug.proposedTime,
          undefined,
          sug.reason
        );
        appliedSuggestionIds.add(sug.id);
      }
    });
    setAppliedSuggestionIds(new Set(appliedSuggestionIds));
    setPreviewSuggestion(null);
  };

  const toneConfig = {
    balanced: {
      border: 'border-[#718368]/40',
      bg: 'bg-[#EAF0E5]',
      badge: 'bg-[#557B5C] text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-[#557B5C]" />,
    },
    moderate: {
      border: 'border-[#A97535]/40',
      bg: 'bg-[#F4EBD9]',
      badge: 'bg-[#A97535] text-white',
      icon: <Scale className="w-5 h-5 text-[#A97535]" />,
    },
    overloaded: {
      border: 'border-[#B88762]/40',
      bg: 'bg-[#FBF5F2]',
      badge: 'bg-[#B88762] text-white',
      icon: <AlertTriangle className="w-5 h-5 text-[#B88762]" />,
    },
  };

  const currentTone = toneConfig[analysis.statusSummary.tone];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reality Engine — Workload Intelligence"
      description={`Transparent deterministic analysis of commitments and daylight capacity for ${activeDate}.`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Status Banner */}
        <div className={`p-4 rounded-2xl border ${currentTone.border} ${currentTone.bg} shadow-xs`}>
          <div className="flex items-start gap-3.5">
            {currentTone.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-bold text-[#403B34]">
                  {analysis.statusSummary.headline}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentTone.badge}`}>
                  {analysis.statusSummary.tone}
                </span>
              </div>
              <p className="text-xs text-[#756E64] leading-relaxed">
                {analysis.statusSummary.description}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Key Calculation Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Day Capacity */}
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[10px] font-semibold text-[#968D81] uppercase tracking-wider block mb-1">
              Daylight Capacity
            </span>
            <div className="text-base sm:text-lg font-bold text-[#403B34]">
              {Math.round(analysis.dayCapacityMinutes / 60)}h 00m
            </div>
            <span className="text-[10px] text-[#756E64]">Standard 8h daylight target</span>
          </div>

          {/* Planned Workload */}
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[10px] font-semibold text-[#968D81] uppercase tracking-wider block mb-1">
              Total Workload
            </span>
            <div className="text-base sm:text-lg font-bold text-[#403B34]">
              {Math.round(analysis.totalWorkloadMinutes / 60)}h {analysis.totalWorkloadMinutes % 60}m
            </div>
            <span className="text-[10px] text-[#756E64]">
              {analysis.scheduledCommitmentsMinutes}m set • {analysis.unscheduledTasksMinutes}m unassigned
            </span>
          </div>

          {/* Remaining Capacity */}
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[10px] font-semibold text-[#968D81] uppercase tracking-wider block mb-1">
              Available Buffer
            </span>
            <div className="text-base sm:text-lg font-bold text-[#557B5C]">
              {Math.round(analysis.remainingCapacityMinutes / 60)}h {analysis.remainingCapacityMinutes % 60}m
            </div>
            <span className="text-[10px] text-[#756E64]">Buffer for breaks & flow</span>
          </div>

          {/* Schedule Conflicts */}
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[10px] font-semibold text-[#968D81] uppercase tracking-wider block mb-1">
              Time Conflicts
            </span>
            <div
              className={`text-base sm:text-lg font-bold ${
                analysis.conflicts.length > 0 ? 'text-[#B95750]' : 'text-[#557B5C]'
              }`}
            >
              {analysis.conflicts.length} Overlaps
            </div>
            <span className="text-[10px] text-[#756E64]">
              {analysis.conflicts.length > 0 ? 'Overlapping commitments' : 'Zero overlaps detected'}
            </span>
          </div>
        </div>

        {/* Data Honesty: Confirmed Estimates vs Default Assumptions */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D5] text-xs text-[#756E64] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#718368] shrink-0" />
            <span>
              <strong>Estimate Transparency:</strong> {analysis.confirmedEstimatesCount} task(s) with verified durations,{' '}
              {analysis.missingEstimatesCount} task(s) without estimate (assumed 30m default).
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#968D81]">Deterministic Engine</span>
        </div>

        {/* Conflicts Breakdown (if any) */}
        {analysis.conflicts.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#403B34] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B95750]" />
              Detected Schedule Overlaps ({analysis.conflicts.length})
            </h4>

            <div className="space-y-2">
              {analysis.conflicts.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#FBF0EE] border border-[#B95750]/30 text-xs text-[#403B34] space-y-1.5"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#B95750]">
                      Overlap from {c.startTime} to {c.endTime} ({c.overlapMinutes} mins)
                    </span>
                    <span className="text-[11px] text-[#756E64]">Conflicting Commitment</span>
                  </div>
                  <div className="text-xs text-[#756E64]">
                    Between <strong className="text-[#403B34]">"{c.taskA.title}"</strong> ({c.taskA.dueTime}) and{' '}
                    <strong className="text-[#403B34]">"{c.taskB.title}"</strong> ({c.taskB.dueTime}).
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intelligent Suggestions with Approval Workflow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#403B34] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#718368]" />
                Recommended Schedule Rebalancing ({analysis.suggestions.length})
              </h4>
              <p className="text-xs text-[#756E64] mt-0.5">
                Every suggestion requires your approval before any schedule changes are applied.
              </p>
            </div>

            {analysis.suggestions.length > 1 && (
              <button
                type="button"
                onClick={handleApplyAll}
                className="px-3 py-1 rounded-xl bg-[#718368] hover:bg-[#557B5C] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Approve All Suggestions
              </button>
            )}
          </div>

          {analysis.suggestions.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-center text-xs text-[#756E64]">
              No schedule adjustments needed. Your daylight commitments are balanced with zero conflicts!
            </div>
          ) : (
            <div className="space-y-2.5">
              {analysis.suggestions.map(sug => {
                const isApplied = appliedSuggestionIds.has(sug.id);

                return (
                  <div
                    key={sug.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isApplied
                        ? 'bg-[#EAF0E5]/60 border-[#718368]/30 opacity-80'
                        : 'bg-white border-[#E7E0D5] hover:border-[#718368]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#403B34] truncate">{sug.taskTitle}</span>
                          <PriorityBadge priority={sug.priority} />
                          <CategoryBadge category={sug.category} />
                        </div>

                        {/* Proposal pill */}
                        <div className="flex items-center gap-2 text-xs text-[#756E64] flex-wrap">
                          <span className="font-mono bg-[#F0EBE2] px-2 py-0.5 rounded text-[11px] line-through text-[#968D81]">
                            {sug.currentTime || 'Unscheduled'} ({sug.currentDate})
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#718368]" />
                          <span className="font-mono bg-[#EAF0E5] text-[#557B5C] font-bold px-2 py-0.5 rounded text-[11px]">
                            {sug.proposedTime || 'Anytime'} ({sug.proposedDate})
                          </span>
                        </div>

                        {/* Reasoning explanation */}
                        <p className="text-xs text-[#756E64] italic pt-1">
                          Reason: {sug.reason}
                        </p>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {isApplied ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-[#557B5C] bg-[#EAF0E5] px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            Applied
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewSuggestion(sug)}
                              className="px-2.5 py-1 rounded-lg bg-[#F0EBE2] hover:bg-[#E7E0D5] text-[#756E64] hover:text-[#403B34] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplySuggestion(sug)}
                              className="px-3 py-1 rounded-lg bg-[#718368] hover:bg-[#557B5C] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Single Suggestion Preview Sub-Modal */}
      {previewSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#718368]" />
                <h4 className="text-sm font-bold text-[#403B34]">Preview Schedule Change</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSuggestion(null)}
                className="text-[#968D81] hover:text-[#403B34] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-[#403B34]">{previewSuggestion.taskTitle}</h5>
              
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-xs">
                <div>
                  <span className="text-[10px] text-[#968D81] uppercase tracking-wider block mb-1">Current State</span>
                  <p className="font-mono text-[#756E64] font-medium">
                    {previewSuggestion.currentTime || 'Unscheduled'}
                  </p>
                  <p className="text-[11px] text-[#968D81]">{previewSuggestion.currentDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#718368] uppercase tracking-wider block mb-1">Proposed State</span>
                  <p className="font-mono text-[#557B5C] font-bold">
                    {previewSuggestion.proposedTime || 'Anytime'}
                  </p>
                  <p className="text-[11px] text-[#557B5C]">{previewSuggestion.proposedDate}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-xs text-[#557B5C]">
                <strong>Engine Rationale:</strong> {previewSuggestion.reason}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E0D5]">
              <button
                type="button"
                onClick={() => setPreviewSuggestion(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#F0EBE2] text-[#756E64] text-xs font-semibold hover:text-[#403B34]"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => handleApplySuggestion(previewSuggestion)}
                className="px-4 py-1.5 rounded-xl bg-[#718368] hover:bg-[#557B5C] text-white text-xs font-semibold shadow-xs"
              >
                Apply Change
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Modal>
  );
}
