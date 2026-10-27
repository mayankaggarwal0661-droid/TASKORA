'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { Task } from '@/types/task';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { RealityEngineService, ScheduleConflict } from '@/features/reality-engine/reality-engine-service';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { AnimatedCheckmark } from '@/components/ui/AnimatedCheckmark';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import {
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Columns,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle2,
  MoveVertical,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivingDayTimelineProps {
  initialDate?: string;
  onOpenRealityEngine?: () => void;
}

export function LivingDayTimeline({ initialDate, onOpenRealityEngine }: LivingDayTimelineProps) {
  const {
    tasks,
    focusSessions,
    todayStr,
    toggleTaskComplete,
    rescheduleTask,
    undoScheduleChange,
    canUndoSchedule,
    openTaskModal,
  } = useTaskora();

  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr || '2026-10-25');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [nowMinutes, setNowMinutes] = useState(840); // default 14:00
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  // Keep nowMinutes updated every minute
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync initial date if provided
  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
  }, [initialDate]);

  // Date Navigation
  const handlePrevDay = () => {
    soundService.playClick();
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDate(
      `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`
    );
  };

  const handleNextDay = () => {
    soundService.playClick();
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    setSelectedDate(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
    );
  };

  const handleToday = () => {
    soundService.playClick();
    setSelectedDate(todayStr || ScheduleService.getTodayDateString());
  };

  // Day Data Filtering
  const dayTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  const scheduledTasks = useMemo(() => {
    return dayTasks
      .filter(t => Boolean(t.dueTime))
      .sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''));
  }, [dayTasks]);

  const unscheduledTasks = useMemo(() => {
    return dayTasks.filter(t => !t.dueTime);
  }, [dayTasks]);

  const dayFocusSessions = useMemo(() => {
    return focusSessions.filter(s => s.completedAt && s.completedAt.startsWith(selectedDate));
  }, [focusSessions, selectedDate]);

  // Reality Engine analysis for this date
  const analysis = useMemo(() => {
    return RealityEngineService.analyzeDay(tasks, focusSessions, selectedDate);
  }, [tasks, focusSessions, selectedDate]);

  // Map conflicts by taskId
  const taskConflictMap = useMemo(() => {
    const map = new Map<string, ScheduleConflict>();
    analysis.conflicts.forEach(c => {
      map.set(c.taskA.id, c);
      map.set(c.taskB.id, c);
    });
    return map;
  }, [analysis.conflicts]);

  // Time hours grid: 07:00 to 22:00
  const hours = useMemo(() => {
    const list: { hour: number; label: string; timeStr: string }[] = [];
    for (let h = 7; h <= 21; h++) {
      list.push({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00`,
        timeStr: `${String(h).padStart(2, '0')}:00`,
      });
    }
    return list;
  }, []);

  const handleToggle = (task: Task) => {
    const willBeComplete = task.status !== 'completed';
    toggleTaskComplete(task.id);
    if (willBeComplete) {
      soundService.playTaskComplete();
      triggerCelebration(0.5, 0.4);
    } else {
      soundService.playClick();
    }
  };

  const handleMoveToSlot = (taskId: string, targetTime: string) => {
    rescheduleTask(taskId, selectedDate, targetTime, undefined, 'Manual timeline rearrangement');
    setMovingTaskId(null);
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E7E0D5] shadow-xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E7E0D5]">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-[#756E64] hover:text-[#403B34] hover:bg-white transition-colors cursor-pointer"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isToday
                  ? 'bg-[#718368] text-white shadow-xs'
                  : 'text-[#756E64] hover:text-[#403B34] hover:bg-white'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-[#756E64] hover:text-[#403B34] hover:bg-white transition-colors cursor-pointer"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#403B34] tracking-tight flex items-center gap-2">
              <span>{ScheduleService.formatFriendlyDate(selectedDate, todayStr)}</span>
              <span className="text-xs font-normal text-[#968D81]">({selectedDate})</span>
            </h2>
            <p className="text-xs text-[#756E64]">
              {scheduledTasks.length} scheduled • {unscheduledTasks.length} unscheduled •{' '}
              {analysis.totalWorkloadMinutes}m planned workload
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Undo Action */}
          {canUndoSchedule && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={() => undoScheduleChange()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EBD9] border border-[#A97535]/30 text-[#A97535] hover:bg-[#EFE3CD] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Revert last schedule modification"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Move</span>
            </motion.button>
          )}

          {/* Reality Engine Quick Trigger */}
          {onOpenRealityEngine && (
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                onOpenRealityEngine();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] hover:bg-[#DDE8D7] text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
              <span>Reality Engine</span>
              {analysis.conflicts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#B95750] animate-pulse" />
              )}
            </button>
          )}

          {/* View Toggle (Visual Timeline vs Accessible List) */}
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E7E0D5]">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setViewMode('timeline');
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'timeline' ? 'text-white' : 'text-[#756E64] hover:text-[#403B34]'
              }`}
            >
              {viewMode === 'timeline' && (
                <motion.div
                  layoutId="timelineModePill"
                  className="absolute inset-0 bg-[#718368] rounded-lg shadow-xs"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <Columns className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Visual Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setViewMode('list');
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'text-white' : 'text-[#756E64] hover:text-[#403B34]'
              }`}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="timelineModePill"
                  className="absolute inset-0 bg-[#718368] rounded-lg shadow-xs"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <List className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Accessible Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conflicts & Capacity Alert Banner (if any) */}
      {analysis.conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#FBF0EE] border border-[#B95750]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B95750] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#B95750]">
                {analysis.conflicts.length} Overlapping Commitment{analysis.conflicts.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-[#756E64] mt-0.5">
                Tasks share the same daylight time window. Click below to inspect resolution options with Reality Engine.
              </p>
            </div>
          </div>
          {onOpenRealityEngine && (
            <button
              type="button"
              onClick={onOpenRealityEngine}
              className="px-3.5 py-1.5 rounded-xl bg-[#B95750] text-white text-xs font-semibold hover:bg-[#A3433C] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              Resolve Overlaps
            </button>
          )}
        </motion.div>
      )}

      {/* Unscheduled Tasks Drawer / Shelf */}
      {unscheduledTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E7E0D5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B88762]" />
              <h3 className="text-xs font-bold text-[#403B34] uppercase tracking-wider">
                Unscheduled Tasks Due This Date ({unscheduledTasks.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#968D81]">Click a task to place on timeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unscheduledTasks.map(task => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-white border border-[#E7E0D5] hover:border-[#718368]/50 shadow-xs transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-[10px] text-[#968D81] font-mono">
                      {task.estimatedMinutes ? `${task.estimatedMinutes}m` : '30m est'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#403B34] truncate">{task.title}</h4>
                </div>

                {/* Quick Schedule Dropdown */}
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      handleMoveToSlot(task.id, e.target.value);
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-[#F0EBE2] border border-[#E7E0D5] text-[#403B34] text-[11px] font-semibold cursor-pointer hover:bg-[#E7E0D5]"
                  aria-label={`Assign time to ${task.title}`}
                >
                  <option value="">+ Assign Time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:30">01:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main View Mode Render */}
      {viewMode === 'timeline' ? (
        /* VISUAL TIMELINE */
        <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-xs relative">
          <div className="space-y-4">
            {hours.map(h => {
              const hourTasks = scheduledTasks.filter(t => {
                const startMins = RealityEngineService.timeToMinutes(t.dueTime);
                if (startMins === null) return false;
                return Math.floor(startMins / 60) === h.hour;
              });

              const hourFocus = dayFocusSessions.filter(s => {
                if (!s.completedAt) return false;
                const d = new Date(s.completedAt);
                return d.getUTCHours() === h.hour || d.getHours() === h.hour;
              });

              // Check if current time falls in this hour
              const isCurrentHour = isToday && Math.floor(nowMinutes / 60) === h.hour;

              return (
                <div
                  key={h.hour}
                  className={`relative flex items-start gap-4 sm:gap-6 min-h-[70px] group p-1.5 rounded-2xl transition-colors duration-300 ${
                    isCurrentHour ? 'bg-[#EAF0E5]/40 border border-[#718368]/25 shadow-2xs' : ''
                  }`}
                >
                  {/* Left Column: Hour Timestamp */}
                  <div className="w-14 sm:w-16 shrink-0 pt-1 text-right">
                    <span className="text-xs font-mono font-bold text-[#756E64]">{h.label}</span>
                  </div>

                  {/* Horizontal Guideline */}
                  <div className="absolute left-16 sm:left-20 right-0 top-3.5 border-t border-[#E7E0D5]/70 pointer-events-none" />

                  {/* Current Time Indicator Line (if this hour matches now) */}
                  {isCurrentHour && (
                    <div
                      className="absolute left-14 sm:left-18 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${((nowMinutes % 60) / 60) * 100}%` }}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#B88762] border-2 border-white shadow-xs -ml-1.5 animate-ping" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B88762] -ml-2.5 shadow-xs" />
                      <div className="h-0.5 flex-1 bg-[#B88762]" />
                      <span className="text-[10px] font-mono font-bold bg-[#B88762] text-white px-2 py-0.5 rounded-full shadow-xs">
                        Now ({RealityEngineService.minutesToTime(nowMinutes)})
                      </span>
                    </div>
                  )}

                  {/* Right Content Area: Scheduled Blocks */}
                  <div className="flex-1 min-w-0 pl-3 sm:pl-4 space-y-2 relative z-10">
                    {hourTasks.length === 0 && hourFocus.length === 0 ? (
                      /* Empty free slot */
                      <div className="h-10 rounded-xl border border-dashed border-[#E7E0D5] hover:border-[#718368]/40 hover:bg-[#FBF9F5] flex items-center justify-between px-3 transition-colors text-xs text-[#968D81]">
                        <span className="text-[11px] font-medium">Free daylight window</span>
                        <button
                          type="button"
                          onClick={() => openTaskModal(null, selectedDate)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] font-semibold text-[#718368] hover:text-[#557B5C] transition-opacity cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Schedule here</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Tasks in this hour */}
                        {hourTasks.map(task => {
                          const conflict = taskConflictMap.get(task.id);
                          const isCompleted = task.status === 'completed';
                          const hasExplicitEstimate = Boolean(task.estimatedMinutes && task.estimatedMinutes > 0);

                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -2, transition: { duration: 0.15 } }}
                              whileTap={{ scale: 0.985 }}
                              className={`p-3.5 rounded-xl border transition-all ${
                                conflict
                                  ? 'bg-[#FBF5F2] border-[#B88762]/60 shadow-xs'
                                  : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#718368]/50 shadow-xs hover:shadow-sm'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                  <AnimatedCheckmark
                                    checked={isCompleted}
                                    size={20}
                                    onClick={() => handleToggle(task)}
                                    ariaLabel={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                                  />

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span
                                        onClick={() => openTaskModal(task)}
                                        className={`text-xs sm:text-sm font-semibold hover:text-[#718368] transition-colors cursor-pointer truncate ${
                                          isCompleted ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                                        }`}
                                      >
                                        {task.title}
                                      </span>
                                      <PriorityBadge priority={task.priority} />
                                      <CategoryBadge category={task.category} />
                                    </div>

                                    <div className="flex items-center gap-2.5 text-[11px] text-[#756E64] flex-wrap">
                                      <span className="flex items-center gap-1 font-mono font-medium text-[#403B34]">
                                        <Clock className="w-3 h-3 text-[#718368]" />
                                        {task.dueTime}
                                      </span>

                                      {/* Duration badge */}
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                          hasExplicitEstimate
                                            ? 'bg-[#EAF0E5] text-[#557B5C]'
                                            : 'bg-[#F4EBD9] text-[#A97535]'
                                        }`}
                                        title={
                                          hasExplicitEstimate
                                            ? 'Verified task duration'
                                            : 'No duration specified. Defaulting to 30m in Reality Engine'
                                        }
                                      >
                                        {hasExplicitEstimate
                                          ? `${task.estimatedMinutes}m duration`
                                          : 'Estimate incomplete (30m)'}
                                      </span>

                                      {/* Conflict Tag */}
                                      {conflict && (
                                        <span className="px-1.5 py-0.5 rounded bg-[#F5E6E5] text-[#B95750] text-[10px] font-bold flex items-center gap-1">
                                          <AlertTriangle className="w-2.5 h-2.5" />
                                          Overlap ({conflict.overlapMinutes}m)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Move Slot Action Dropdown */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  <select
                                    value={task.dueTime || ''}
                                    onChange={e => {
                                      if (e.target.value !== task.dueTime) {
                                        handleMoveToSlot(task.id, e.target.value);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-white border border-[#E7E0D5] text-[11px] font-medium text-[#403B34] cursor-pointer hover:border-[#718368]/40"
                                    title="Move to another daylight slot"
                                    aria-label={`Move time for ${task.title}`}
                                  >
                                    <option value="08:00">Move: 08:00 AM</option>
                                    <option value="09:00">Move: 09:00 AM</option>
                                    <option value="10:00">Move: 10:00 AM</option>
                                    <option value="11:30">Move: 11:30 AM</option>
                                    <option value="13:00">Move: 01:00 PM</option>
                                    <option value="14:30">Move: 02:30 PM</option>
                                    <option value="16:00">Move: 04:00 PM</option>
                                    <option value="17:30">Move: 05:30 PM</option>
                                    <option value="19:00">Move: 07:00 PM</option>
                                  </select>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Focus Sessions logged in this hour */}
                        {hourFocus.map(session => (
                          <div
                            key={session.id}
                            className="p-2.5 rounded-xl bg-[#EAF0E5]/80 border border-[#718368]/30 flex items-center justify-between text-xs text-[#557B5C]"
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-[#718368]" />
                              <span className="font-semibold">
                                Deep Work Focus Block ({Math.round(session.durationSeconds / 60)}m)
                              </span>
                              {session.taskTitle && (
                                <span className="text-[11px] text-[#756E64] truncate max-w-xs">
                                  • {session.taskTitle}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/70 px-1.5 py-0.5 rounded">
                              {session.mode}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ACCESSIBLE LIST / AGENDA ALTERNATIVE */
        <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E7E0D5] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#403B34]">Accessible Daily Schedule</h3>
              <p className="text-xs text-[#756E64]">Screen-reader and keyboard optimized chronological list</p>
            </div>
            <span className="text-xs text-[#968D81] font-mono">{dayTasks.length} Total Commitments</span>
          </div>

          {dayTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#756E64]">
              No commitments recorded for {selectedDate}.
            </div>
          ) : (
            <div className="space-y-3">
              {dayTasks.map((task, idx) => {
                const conflict = taskConflictMap.get(task.id);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#718368]">
                          {task.dueTime ? task.dueTime : 'Unscheduled'}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        <CategoryBadge category={task.category} />
                        {conflict && (
                          <span className="text-[10px] bg-[#F5E6E5] text-[#B95750] px-1.5 py-0.5 rounded font-bold">
                            Conflict ({conflict.overlapMinutes}m)
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#756E64]">
                        Duration: {task.estimatedMinutes ? `${task.estimatedMinutes} minutes` : 'Incomplete (30m default)'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(task)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isCompleted
                            ? 'bg-[#E7E0D5] text-[#756E64]'
                            : 'bg-[#718368] text-white hover:bg-[#557B5C]'
                        }`}
                      >
                        {isCompleted ? 'Mark Todo' : 'Mark Done'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openTaskModal(task)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-xs font-semibold text-[#756E64] hover:text-[#403B34] cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
