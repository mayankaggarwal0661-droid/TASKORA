'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedCheckmark } from '@/components/ui/AnimatedCheckmark';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import { Task } from '@/types/task';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { tasks, toggleTaskComplete, openTaskModal, todayStr: contextTodayStr } = useTaskora();

  const [currentDate, setCurrentDate] = useState(() => new Date('2026-10-25T00:00:00Z'));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-10-25');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date());
    setSelectedDateStr(ScheduleService.getTodayDateString());
  }, []);

  // Month navigation
  const prevPeriod = () => {
    soundService.playClick();
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextPeriod = () => {
    soundService.playClick();
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const jumpToToday = () => {
    soundService.playClick();
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(ScheduleService.getTodayDateString());
  };

  // Month calendar grid computation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= (remaining >= 7 ? remaining - 7 : remaining); i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Tasks map by date string
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  // Selected date tasks
  const selectedDayTasks = tasksByDate[selectedDateStr] || [];
  const todayStr = contextTodayStr || ScheduleService.FALLBACK_DATE;

  const handleToggle = (task: Task) => {
    const willBeComplete = task.status !== 'completed';
    toggleTaskComplete(task.id);
    if (willBeComplete) {
      soundService.playTaskComplete();
      triggerCelebration(0.7, 0.4);
    } else {
      soundService.playClick();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Schedule Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E7E0D5]">
            <button
              type="button"
              onClick={prevPeriod}
              className="p-1.5 rounded-lg text-[#756E64] hover:text-[#403B34] hover:bg-[#F7F4EE] cursor-pointer"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-[#756E64] hover:text-[#403B34] hover:bg-[#F7F4EE] cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextPeriod}
              className="p-1.5 rounded-lg text-[#756E64] hover:text-[#403B34] hover:bg-[#F7F4EE] cursor-pointer"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openTaskModal(null, selectedDateStr)}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Main Grid + Selected Day Agenda Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 pb-3 border-b border-[#E7E0D5] text-center text-xs font-bold text-[#968D81] uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid with Month Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-2 pt-3"
            >
              {calendarDays.map((day, idx) => {
                const dayTasks = tasksByDate[day.dateStr] || [];
                const isSelected = day.dateStr === selectedDateStr;
                const isToday = day.dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedDateStr(day.dateStr);
                    }}
                    className={`relative min-h-[82px] sm:min-h-[96px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF0E5] border-[#718368]'
                        : isToday
                        ? 'bg-[#F4EBD9]/60 border-[#A97535]/40'
                        : day.isCurrentMonth
                        ? 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#718368]/40'
                        : 'bg-[#F7F4EE]/40 border-transparent opacity-40 hover:opacity-75'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="calendarSelectedRing"
                        className="absolute inset-0 border-2 border-[#718368] rounded-xl pointer-events-none"
                        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-[#718368] text-white shadow-xs'
                            : isSelected
                            ? 'text-[#557B5C] font-black'
                            : 'text-[#403B34]'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E7E0D5] text-[#756E64]">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task pills inside day cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map(t => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                            t.status === 'completed'
                              ? 'bg-[#F0EBE2] text-[#968D81] line-through'
                              : t.priority === 'critical'
                              ? 'bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30'
                              : 'bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-[#968D81]' : 'bg-[#718368]'}`} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[9px] text-[#756E64] pl-1">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected Day Agenda Drawer (1 Col) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E0D5] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5] mb-4">
              <div>
                <span className="text-xs font-semibold text-[#968D81] uppercase tracking-wider block">
                  Selected Day Agenda
                </span>
                <h3 className="text-lg font-bold text-[#403B34] tracking-tight mt-0.5">
                  {ScheduleService.formatFriendlyDate(selectedDateStr)} ({selectedDateStr})
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openTaskModal(null, selectedDateStr)}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* List of Tasks for this day */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {selectedDayTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center text-xs text-[#756E64]"
                  >
                    <CalendarIcon className="w-8 h-8 text-[#968D81] mx-auto mb-2" />
                    <p className="font-semibold text-[#403B34]">No tasks scheduled</p>
                    <p className="mt-1">Enjoy free time or plan tasks for this day.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTaskModal(null, selectedDateStr)}
                      className="mt-3 text-xs"
                    >
                      + Add Task for this day
                    </Button>
                  </motion.div>
                ) : (
                  selectedDayTasks.map(task => {
                    const isCompleted = task.status === 'completed';

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] hover:border-[#718368]/30 transition-all space-y-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <AnimatedCheckmark
                            checked={isCompleted}
                            size={20}
                            onClick={() => handleToggle(task)}
                            ariaLabel={`Toggle ${task.title}`}
                          />

                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => openTaskModal(task)}
                              className={`text-xs sm:text-sm font-semibold hover:text-[#718368] transition-colors cursor-pointer truncate ${
                                isCompleted ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <PriorityBadge priority={task.priority} />
                              <CategoryBadge category={task.category} />
                              {task.dueTime && (
                                <span className="flex items-center gap-1 text-[11px] text-[#756E64]">
                                  <Clock className="w-3 h-3 text-[#718368]" />
                                  {task.dueTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E0D5] text-xs text-[#756E64] flex items-center justify-between">
            <span>{selectedDayTasks.filter(t => t.status === 'completed').length} of {selectedDayTasks.length} Completed</span>
            <span
              className="text-[#718368] font-semibold cursor-pointer hover:text-[#5F7157] transition-colors"
              onClick={() => openTaskModal(null, selectedDateStr)}
            >
              + Schedule
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
