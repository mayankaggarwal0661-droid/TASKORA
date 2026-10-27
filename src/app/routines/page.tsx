'use client';

import React, { useState } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { RoutineService } from '@/features/routines/routine-service';
import { Routine, RoutineFrequency, RoutineTimeOfDay } from '@/types/routine';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import {
  Flame,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  Clock,
  Zap,
  Sun,
  Moon,
  Droplets,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function RoutinesPage() {
  const { routines, toggleRoutine, addRoutine, deleteRoutine, todayStr } = useTaskora();
  const { isGuest, openGuestLock } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (isGuest) {
      openGuestLock(
        'Unlock Habit Streaks & Routines',
        'Habit rituals, 28-day consistency heatmaps, and streak tracking require an account to maintain your long-term momentum.'
      );
      return;
    }
    setIsModalOpen(true);
  };

  // New Routine Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'health' | 'productivity' | 'mindset' | 'learning' | 'fitness'>('health');
  const [targetFrequency, setTargetFrequency] = useState<RoutineFrequency>('daily');
  const [targetTimeOfDay, setTargetTimeOfDay] = useState<RoutineTimeOfDay>('morning');
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [colorHex, setColorHex] = useState('#718368');

  const heatmapDays = RoutineService.getHeatmapDays(28, todayStr);

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundService.playClick();
    addRoutine({
      title: title.trim(),
      description: description.trim(),
      category,
      targetFrequency,
      targetTimeOfDay,
      targetMinutes: Number(targetMinutes) || 15,
      active: true,
      colorHex,
      iconName: category === 'health' ? 'Droplets' : category === 'mindset' ? 'Sun' : 'Zap'
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleToggle = (routine: Routine) => {
    const isDone = RoutineService.isCompletedOnDate(routine, todayStr);
    toggleRoutine(routine.id);

    if (!isDone) {
      soundService.playTaskComplete();
      triggerCelebration(0.5, 0.4);
    } else {
      soundService.playClick();
    }
  };

  const getTimeIcon = (slot: RoutineTimeOfDay) => {
    switch (slot) {
      case 'morning': return <Sun className="w-3.5 h-3.5 text-[#B88762]" />;
      case 'evening': return <Moon className="w-3.5 h-3.5 text-[#718368]" />;
      case 'afternoon': return <Sun className="w-3.5 h-3.5 text-[#C49746]" />;
      default: return <Clock className="w-3.5 h-3.5 text-[#756E64]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF0E6] border border-[#B88762]/30 text-[#403B34] shadow-xs">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="w-8 h-8 rounded-xl bg-white text-[#B88762] flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#403B34]">Guest Mode Preview: </span>
              <span className="text-[#756E64]">Habit streaks and 28-day consistency records require an account to save across sessions.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-xs font-bold text-[#B88762] hover:text-[#9A6946] hover:underline shrink-0 ml-auto sm:ml-0 cursor-pointer"
          >
            Enable Habit Streaks →
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-[#B88762]" />
            <span>Habits &amp; Micro-Routines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            Daily Routines
          </h1>
          <p className="text-sm text-[#756E64] mt-1">
            Build compounding consistency through daily habit rituals and streak milestones.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-1" />
          <span>New Routine</span>
        </Button>
      </div>

      {/* Routine Cards Grid */}
      {routines.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-[#E7E0D5] p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF0E6] text-[#B88762] flex items-center justify-center mx-auto mb-3.5">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#403B34]">No routines created yet</h3>
          <p className="text-xs text-[#756E64] mt-1 max-w-sm mx-auto">
            Build compounding consistency through daily habit rituals and track your streak milestones.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="sm" onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-1" />
              Create First Routine
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {routines.map((routine, idx) => {
              const isDoneToday = RoutineService.isCompletedOnDate(routine, todayStr);

              return (
                <motion.div
                  key={routine.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="p-5 rounded-2xl bg-white border border-[#E7E0D5] hover:border-[#D9D0C3] hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
                >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">
                        {getTimeIcon(routine.targetTimeOfDay)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#756E64] capitalize">
                        {routine.targetTimeOfDay} • {routine.targetFrequency}
                      </span>
                    </div>

                    {/* Streak Flame Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF0E6] border border-[#F2DAC3] text-[#B88762] text-xs font-bold shadow-xs">
                      <Flame className="w-3.5 h-3.5 text-[#B88762] animate-pulse" />
                      <span>{routine.currentStreak} Days</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#403B34] tracking-tight">
                    {routine.title}
                  </h3>
                  {routine.description && (
                    <p className="text-xs text-[#756E64] mt-1 line-clamp-2">
                      {routine.description}
                    </p>
                  )}
                </div>

                {/* Bottom Card Controls & Check-in Button */}
                <div className="pt-4 mt-4 border-t border-[#E7E0D5] flex items-center justify-between">
                  <div className="text-xs text-[#968D81]">
                    Best streak: <span className="font-bold text-[#403B34]">{routine.bestStreak} days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playClick();
                        deleteRoutine(routine.id);
                      }}
                      className="p-2 text-[#968D81] hover:text-[#B25E5E] rounded-lg hover:bg-[#F5E6E5]/40 transition-colors cursor-pointer"
                      title="Remove routine"
                      aria-label="Remove routine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(routine)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isDoneToday
                          ? 'bg-[#E8F0E9] text-[#4F6A48] border border-[#C5DBC0]'
                          : 'bg-[#718368] hover:bg-[#557B5C] text-white shadow-xs'
                      }`}
                    >
                      {isDoneToday ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Completed Today!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Check In Today</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      )}

      {/* 28-Day Consistency Heatmap Grid */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight">Consistency Heatmap</h3>
            <p className="text-xs text-[#756E64] mt-0.5">Habit check-in history over the last 28 days</p>
          </div>
          <span className="text-xs text-[#968D81] font-mono">Past 4 Weeks</span>
        </div>

        {routines.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#968D81] border border-dashed border-[#E7E0D5] rounded-xl bg-[#FBF9F5]">
            Create a routine above to track your 28-day habit consistency and streak momentum.
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map(routine => (
              <div key={routine.id} className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-[#403B34] truncate max-w-xs">{routine.title}</span>
                  <span className="text-[11px] text-[#B88762] font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#B88762]" />
                    {routine.currentStreak} streak
                  </span>
                </div>

                {/* 28 day blocks with responsive grid */}
                <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1 sm:gap-1.5">
                  {heatmapDays.map(day => {
                    const isDone = routine.completedDates.includes(day.dateStr);

                    return (
                      <motion.div
                        key={day.dateStr}
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.15 }}
                        className={`h-7 sm:h-8 rounded-md flex items-center justify-center text-[9px] font-bold transition-all cursor-pointer ${
                          isDone
                            ? 'bg-[#718368] text-white shadow-xs'
                            : day.isToday
                            ? 'bg-[#E8F0E9] text-[#718368] border border-[#718368]/40'
                            : 'bg-[#F0EBE2] text-[#968D81] hover:bg-[#E7E0D5]'
                        }`}
                        title={`${routine.title}: ${day.dateStr} ${isDone ? '(Completed)' : '(Missed)'}`}
                      >
                        {day.dayNumber}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Routine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Daily Routine"
        description="Set up a recurring habit ritual to maintain streaks."
      >
        <form onSubmit={handleCreateRoutine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., 20-Minute Deep Reading"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] placeholder-[#968D81] text-sm focus:border-[#718368] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Context or ritual trigger..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] placeholder-[#968D81] text-sm focus:border-[#718368] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1">
                Time of Day
              </label>
              <select
                value={targetTimeOfDay}
                onChange={e => setTargetTimeOfDay(e.target.value as RoutineTimeOfDay)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs focus:border-[#718368] focus:bg-white focus:outline-none"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs focus:border-[#718368] focus:bg-white focus:outline-none"
              >
                <option value="health">Health &amp; Hydration</option>
                <option value="productivity">Productivity</option>
                <option value="mindset">Mindset &amp; Journaling</option>
                <option value="learning">Learning &amp; Reading</option>
                <option value="fitness">Fitness &amp; Movement</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E0D5]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Routine
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
