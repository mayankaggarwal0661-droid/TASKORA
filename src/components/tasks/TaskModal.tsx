'use client';

import React, { useState, useEffect } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TaskCategory, TaskPriority, RecurrenceRule, AdvanceReminder, SubTask } from '@/types/task';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import {
  Calendar,
  Clock,
  Repeat,
  Bell,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Flag
} from 'lucide-react';

export function TaskModal() {
  const {
    isTaskModalOpen,
    closeTaskModal,
    editingTask,
    addTask,
    updateTask,
    deleteTask
  } = useTaskora();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(ScheduleService.FALLBACK_DATE);
  const [dueTime, setDueTime] = useState('14:00');
  const [timezone, setTimezone] = useState('UTC');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [reminder, setReminder] = useState<AdvanceReminder>('15m');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(30);

  // Sync state when editingTask or opened
  useEffect(() => {
    if (editingTask && editingTask.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '12:00');
      setTimezone(editingTask.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      setRecurrence(editingTask.recurrence);
      setReminder(editingTask.reminder);
      setEstimatedMinutes(editingTask.estimatedMinutes !== undefined ? editingTask.estimatedMinutes : 30);
      setSubtasks(editingTask.subtasks || []);
    } else {
      // Clean defaults for new task
      setTitle('');
      setDescription('');
      setCategory('work');
      setPriority('medium');
      setDueDate(editingTask?.dueDate || ScheduleService.getTodayDateString());
      setDueTime('14:00');
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      setRecurrence('none');
      setReminder('15m');
      setEstimatedMinutes(30);
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
  }, [editingTask, isTaskModalOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item: SubTask = {
      id: 'sub-' + Date.now().toString(36),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks(prev => [...prev, item]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate,
        dueTime,
        timezone,
        recurrence,
        reminder,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'todo',
        dueDate,
        dueTime,
        timezone,
        recurrence,
        reminder,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
        subtasks,
      });
    }

    closeTaskModal();
  };

  const handleDelete = () => {
    if (editingTask && editingTask.id) {
      deleteTask(editingTask.id);
      closeTaskModal();
    }
  };

  const categories: { key: TaskCategory; label: string }[] = [
    { key: 'work', label: 'Work' },
    { key: 'personal', label: 'Personal' },
    { key: 'health', label: 'Health' },
    { key: 'finance', label: 'Finance' },
    { key: 'learning', label: 'Learning' },
    { key: 'routine', label: 'Routine' },
  ];

  const priorities: { key: TaskPriority; label: string; activeColor: string }[] = [
    { key: 'critical', label: 'Critical', activeColor: 'border-[#B95750]/40 bg-[#F5E6E5] text-[#B95750]' },
    { key: 'high', label: 'High', activeColor: 'border-[#A97535]/40 bg-[#F4EBD9] text-[#A97535]' },
    { key: 'medium', label: 'Medium', activeColor: 'border-[#718368]/40 bg-[#EAF0E5] text-[#557B5C]' },
    { key: 'low', label: 'Low', activeColor: 'border-[#D9D0C3] bg-[#F0EBE2] text-[#756E64]' },
  ];

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={editingTask?.id ? 'Edit Task' : 'Schedule New Task'}
      description="Define task parameters, reminders, recurrence, and action items."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Title input */}
        <div>
          <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1.5">
            Task Title <span className="text-[#B95750]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Deliver Quarterly Architecture Presentation"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] focus:border-[#718368] focus:ring-1 focus:ring-[#718368]/30 text-[#403B34] placeholder-[#968D81] text-sm font-medium transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add relevant links, notes, or execution details..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] focus:border-[#718368] focus:ring-1 focus:ring-[#718368]/30 text-[#403B34] placeholder-[#968D81] text-sm resize-none transition-all"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    category === c.key
                      ? 'bg-[#EAF0E5] border-[#718368]/40 text-[#557B5C] font-semibold shadow-xs'
                      : 'bg-[#FBF9F5] border-[#E7E0D5] text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {priorities.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    priority === p.key
                      ? p.activeColor
                      : 'bg-[#FBF9F5] border-[#E7E0D5] text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date, Time & Timezone */}
        <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-semibold text-[#756E64] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#718368]" />
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368]"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-[11px] font-semibold text-[#756E64] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#718368]" />
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368]"
              />
            </div>

            {/* Estimated Duration */}
            <div className="sm:col-span-2 pt-2 border-t border-[#E7E0D5]/70">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[#756E64] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B88762]" />
                  Estimated Duration
                </label>
                <span className="text-[11px] font-mono font-medium text-[#718368]">
                  {estimatedMinutes ? `${estimatedMinutes} mins` : 'No estimate (defaults to 30m in Reality Engine)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[15, 30, 45, 60, 90, 120].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEstimatedMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      estimatedMinutes === mins
                        ? 'bg-[#718368] text-white border-[#718368] shadow-xs'
                        : 'bg-white border-[#E7E0D5] text-[#756E64] hover:border-[#718368]/40 hover:text-[#403B34]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    placeholder="Custom"
                    value={estimatedMinutes || ''}
                    onChange={e => setEstimatedMinutes(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-20 px-2 py-1 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368]"
                  />
                  <span className="text-xs text-[#968D81]">mins</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Recurrence */}
            <div>
              <label className="block text-[11px] font-semibold text-[#756E64] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-[#718368]" />
                Repeat Schedule
              </label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceRule)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Every Weekday (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-[11px] font-semibold text-[#756E64] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#A97535]" />
                Advance Reminder
              </label>
              <select
                value={reminder}
                onChange={e => setReminder(e.target.value as AdvanceReminder)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368]"
              >
                <option value="at_time">At time of event</option>
                <option value="5m">5 minutes before</option>
                <option value="15m">15 minutes before</option>
                <option value="30m">30 minutes before</option>
                <option value="1h">1 hour before</option>
                <option value="1d">1 day before</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-[11px] font-semibold text-[#756E64] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#718368]" />
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368] truncate"
              />
            </div>
          </div>
        </div>

        {/* Optional Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#756E64] uppercase tracking-wider">
              Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </label>
          </div>

          {/* Subtask list */}
          <div className="space-y-1.5 mb-2.5">
            {subtasks.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] group"
              >
                <button
                  type="button"
                  onClick={() => handleToggleSubtask(s.id)}
                  className="flex items-center gap-2 text-xs text-left text-[#403B34] hover:text-[#718368] cursor-pointer"
                >
                  {s.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#557B5C] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#968D81] shrink-0" />
                  )}
                  <span className={s.completed ? 'line-through text-[#968D81]' : ''}>{s.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(s.id)}
                  className="text-[#968D81] hover:text-[#B95750] p-1 transition-colors cursor-pointer"
                  title="Remove subtask"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add a checklist item (press Enter)..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs placeholder-[#968D81] focus:border-[#718368]"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddSubtask}
              className="shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E7E0D5] flex items-center justify-between gap-3">
          {editingTask?.id ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingTask?.id ? 'Save Changes' : 'Schedule Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
