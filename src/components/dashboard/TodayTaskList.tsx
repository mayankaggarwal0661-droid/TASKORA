'use client';

import React, { useState } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedCheckmark } from '@/components/ui/AnimatedCheckmark';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import { Task } from '@/types/task';
import {
  Clock,
  Plus,
  Calendar,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TodayTaskList() {
  const { tasks, toggleTaskComplete, openTaskModal, todayStr } = useTaskora();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming'>('today');

  const { overdue, dueToday, upcoming } = ScheduleService.categorizeTasks(tasks, todayStr);

  const tabList = [
    { key: 'today' as const, label: "Today's Agenda", count: dueToday.length, alert: false },
    { key: 'overdue' as const, label: 'Overdue', count: overdue.length, alert: overdue.length > 0 },
    { key: 'upcoming' as const, label: 'Upcoming', count: upcoming.length, alert: false },
  ];

  let displayTasks: Task[] = [];
  if (activeTab === 'today') displayTasks = dueToday;
  else if (activeTab === 'overdue') displayTasks = overdue;
  else displayTasks = upcoming;

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

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] space-y-4 shadow-sm">
      {/* Header and Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E0D5]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0EBE2] border border-[#E7E0D5]">
          {tabList.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveTab(tab.key);
                }}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isActive ? 'text-white' : 'text-[#756E64] hover:text-[#403B34]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTodayTab"
                    className="absolute inset-0 bg-[#718368] rounded-lg shadow-xs"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    tab.alert
                      ? 'bg-[#F5E6E5] text-[#B95750]'
                      : isActive
                      ? 'bg-[#5F7157] text-white'
                      : 'bg-[#E7E0D5] text-[#756E64]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => openTaskModal()}
          className="text-[#718368] hover:text-[#5F7157] text-xs self-start sm:self-auto font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Task Items List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {displayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F0EBE2] text-[#968D81] flex items-center justify-center mx-auto mb-3">
                <ListTodo className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#403B34]">No tasks in this section</h4>
              <p className="text-xs text-[#756E64] mt-1 max-w-sm mx-auto">
                {activeTab === 'overdue'
                  ? 'Great job! You have cleared all past due priorities.'
                  : 'Everything is organized. Click below to schedule a new task.'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openTaskModal()}
                className="mt-4"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Schedule Task
              </Button>
            </motion.div>
          ) : (
            displayTasks.map((task, index) => {
              const isOverdue = ScheduleService.isTaskOverdue(task, todayStr);
              const isCompleted = task.status === 'completed';

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                    isCompleted
                      ? 'bg-[#F7F4EE]/60 border-[#E7E0D5]/70 opacity-80'
                      : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#718368]/50 hover:shadow-sm hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    {/* SVG Morphing Animated Checkmark */}
                    <AnimatedCheckmark
                      checked={isCompleted}
                      size={22}
                      onClick={() => handleToggle(task)}
                      ariaLabel={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                    />

                    {/* Task Title & Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => openTaskModal(task)}
                          className={`text-sm font-semibold hover:text-[#718368] transition-colors cursor-pointer truncate ${
                            isCompleted ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        <CategoryBadge category={task.category} />
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#968D81]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#968D81]" />
                          {ScheduleService.formatFriendlyDate(task.dueDate, todayStr)}
                        </span>
                        {task.dueTime && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#B95750] font-semibold' : ''}`}>
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        {task.subtasks.length > 0 && (
                          <span>
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                          </span>
                        )}
                        {task.recurrence !== 'none' && (
                          <span className="capitalize text-[#718368] font-medium">
                            ↻ {task.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Edit Action */}
                  <button
                    type="button"
                    onClick={() => openTaskModal(task)}
                    className="p-1.5 rounded-lg text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer shrink-0"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
