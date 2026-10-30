'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTaskora } from '@/context/TaskoraContext';
import { ScheduleService } from '@/features/scheduling/schedule-service';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task';
import { PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AnimatedCheckmark } from '@/components/ui/AnimatedCheckmark';
import { triggerCelebration } from '@/lib/motion';
import { soundService } from '@/features/audio/sound-service';
import {
  Search,
  Plus,
  Filter,
  LayoutList,
  Columns3,
  Calendar,
  Clock,
  Bell,
  Trash2,
  Edit2,
  Repeat,
  Circle,
  AlertTriangle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AllTasksPage() {
  const {
    tasks,
    toggleTaskComplete,
    toggleSubtask,
    updateTask,
    deleteTask,
    openTaskModal,
    addToast,
    todayStr
  } = useTaskora();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  // Delete confirmation modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Deep-link handling: If URL has ?taskId=..., automatically open that task
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const targetTaskId = params.get('taskId');
    if (targetTaskId && tasks.length > 0) {
      const target = tasks.find(t => t.id === targetTaskId);
      if (target) {
        openTaskModal(target);
      }
    }
  }, [tasks, openTaskModal]);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Priority
    if (selectedPriority !== 'all') {
      result = result.filter(t => t.priority === selectedPriority);
    }

    // Status
    if (selectedStatus !== 'all') {
      result = result.filter(t => t.status === selectedStatus);
    }

    // Sort
    const priorityWeights: Record<TaskPriority, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return `${a.dueDate} ${a.dueTime || '00:00'}`.localeCompare(`${b.dueDate} ${b.dueTime || '00:00'}`);
    });

    return result;
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  // Grouped tasks for List View
  const groupedTasks = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    filteredTasks.forEach(task => {
      if (task.status === 'completed') {
        completed.push(task);
      } else if (ScheduleService.isTaskOverdue(task, todayStr)) {
        overdue.push(task);
      } else if (task.dueDate === todayStr) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { overdue, today, upcoming, completed };
  }, [filteredTasks, todayStr]);

  // Kanban column tasks
  const kanbanColumns = useMemo(() => {
    return {
      todo: filteredTasks.filter(t => t.status === 'todo'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      completed: filteredTasks.filter(t => t.status === 'completed'),
    };
  }, [filteredTasks]);

  const categories: { key: TaskCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'work', label: 'Work' },
    { key: 'personal', label: 'Personal' },
    { key: 'health', label: 'Health' },
    { key: 'finance', label: 'Finance' },
    { key: 'learning', label: 'Learning' },
    { key: 'routine', label: 'Routine' },
  ];

  const priorities: { key: TaskPriority | 'all'; label: string }[] = [
    { key: 'all', label: 'All Priorities' },
    { key: 'critical', label: 'Critical' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  const handleToggle = (task: Task) => {
    const willBeComplete = task.status !== 'completed';
    toggleTaskComplete(task.id);

    if (willBeComplete) {
      soundService.playTaskComplete();
      triggerCelebration(0.5, 0.4);
      addToast({ title: 'Task Completed! 🎉', message: task.title, type: 'success' });
    } else {
      soundService.playClick();
      addToast({ title: 'Task Reopened', message: task.title, type: 'info' });
    }
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    addToast({ title: 'Task Deleted', message: taskToDelete.title, type: 'warning' });
    setTaskToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            All Tasks
          </h1>
          <p className="text-sm text-[#756E64] mt-1">
            Organize, prioritize, and track your schedule with customizable filters and views.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E7E0D5] relative">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setViewMode('list');
              }}
              className={`relative z-10 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'text-white'
                  : 'text-[#756E64] hover:text-[#403B34]'
              }`}
              title="List View"
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="viewModePill"
                  className="absolute inset-0 bg-[#718368] rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                />
              )}
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setViewMode('kanban');
              }}
              className={`relative z-10 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'text-white'
                  : 'text-[#756E64] hover:text-[#403B34]'
              }`}
              title="Kanban Board View"
            >
              {viewMode === 'kanban' && (
                <motion.div
                  layoutId="viewModePill"
                  className="absolute inset-0 bg-[#718368] rounded-lg shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                />
              )}
              <Columns3 className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => openTaskModal()}>
            <Plus className="w-4 h-4 mr-1" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#968D81] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, or subtasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FBF9F5] border border-[#E7E0D5] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#403B34] placeholder-[#968D81] focus:outline-none focus:border-[#718368]/60"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#756E64] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#FBF9F5] border border-[#E7E0D5] rounded-xl px-3 py-2 text-xs text-[#403B34] focus:outline-none focus:border-[#718368]/60 cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E7E0D5]">
          <span className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="bg-[#FBF9F5] border border-[#E7E0D5] rounded-lg px-2.5 py-1 text-xs text-[#403B34] focus:outline-none focus:border-[#718368] cursor-pointer"
          >
            {categories.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value as any)}
            className="bg-[#FBF9F5] border border-[#E7E0D5] rounded-lg px-2.5 py-1 text-xs text-[#403B34] focus:outline-none focus:border-[#718368] cursor-pointer"
          >
            {priorities.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>

          {/* Reset filters */}
          {(selectedCategory !== 'all' || selectedPriority !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#718368] hover:text-[#5F7157] font-semibold px-2 py-0.5 rounded cursor-pointer"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-[#756E64]">
            Showing <strong className="text-[#403B34]">{filteredTasks.length}</strong> tasks
          </span>
        </div>
      </div>

      {/* Main View Switcher */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          /* LIST VIEW */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-white border border-[#E7E0D5] p-8 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center mx-auto mb-3.5">
                  <ListTodo className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#403B34]">No tasks yet</h3>
                <p className="text-xs text-[#756E64] mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                    ? 'No tasks match your selected filter criteria. Try clearing your filters.'
                    : 'Your schedule is completely clear. Start organizing your priorities by creating your first task.'}
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedPriority('all');
                        setSelectedStatus('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => openTaskModal()}>
                      <Plus className="w-4 h-4 mr-1" />
                      Create First Task
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Overdue Section */}
                {groupedTasks.overdue.length > 0 && (
                  <TaskSectionGroup
                    title="Overdue Tasks"
                    badgeColor="bg-[#F5E6E5] text-[#B95750] border-[#B95750]/30"
                    count={groupedTasks.overdue.length}
                    tasks={groupedTasks.overdue}
                    onToggle={handleToggle}
                    toggleSubtask={toggleSubtask}
                    openTaskModal={openTaskModal}
                    onDelete={task => setTaskToDelete(task)}
                  />
                )}

                {/* Today Section */}
                {groupedTasks.today.length > 0 && (
                  <TaskSectionGroup
                    title="Today's Priorities"
                    badgeColor="bg-[#EAF0E5] text-[#557B5C] border-[#718368]/30"
                    count={groupedTasks.today.length}
                    tasks={groupedTasks.today}
                    onToggle={handleToggle}
                    toggleSubtask={toggleSubtask}
                    openTaskModal={openTaskModal}
                    onDelete={task => setTaskToDelete(task)}
                  />
                )}

                {/* Upcoming Section */}
                {groupedTasks.upcoming.length > 0 && (
                  <TaskSectionGroup
                    title="Upcoming Tasks"
                    badgeColor="bg-[#F0EBE2] text-[#756E64] border-[#D9D0C3]"
                    count={groupedTasks.upcoming.length}
                    tasks={groupedTasks.upcoming}
                    onToggle={handleToggle}
                    toggleSubtask={toggleSubtask}
                    openTaskModal={openTaskModal}
                    onDelete={task => setTaskToDelete(task)}
                  />
                )}

                {/* Completed Section */}
                {groupedTasks.completed.length > 0 && (
                  <TaskSectionGroup
                    title="Completed Tasks"
                    badgeColor="bg-[#E8F0E9] text-[#557B5C] border-[#557B5C]/30"
                    count={groupedTasks.completed.length}
                    tasks={groupedTasks.completed}
                    onToggle={handleToggle}
                    toggleSubtask={toggleSubtask}
                    openTaskModal={openTaskModal}
                    onDelete={task => setTaskToDelete(task)}
                  />
                )}
              </>
            )}
          </motion.div>
        ) : (
          /* KANBAN BOARD VIEW */
          <motion.div
            key="kanban-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Column: To Do */}
            <KanbanColumn
              title="To Do"
              status="todo"
              count={kanbanColumns.todo.length}
              tasks={kanbanColumns.todo}
              onMoveStatus={(taskId, newStatus) => {
                updateTask(taskId, { status: newStatus });
                soundService.playClick();
              }}
              onToggle={handleToggle}
              openTaskModal={openTaskModal}
              onDelete={task => setTaskToDelete(task)}
            />

            {/* Column: In Progress */}
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              count={kanbanColumns.in_progress.length}
              tasks={kanbanColumns.in_progress}
              onMoveStatus={(taskId, newStatus) => {
                updateTask(taskId, { status: newStatus });
                soundService.playClick();
              }}
              onToggle={handleToggle}
              openTaskModal={openTaskModal}
              onDelete={task => setTaskToDelete(task)}
            />

            {/* Column: Completed */}
            <KanbanColumn
              title="Completed"
              status="completed"
              count={kanbanColumns.completed.length}
              tasks={kanbanColumns.completed}
              onMoveStatus={(taskId, newStatus) => {
                updateTask(taskId, { status: newStatus });
                if (newStatus === 'completed') {
                  triggerCelebration(0.5, 0.4);
                  soundService.playTaskComplete();
                } else {
                  soundService.playClick();
                }
              }}
              onToggle={handleToggle}
              openTaskModal={openTaskModal}
              onDelete={task => setTaskToDelete(task)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="Confirm Task Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5E6E5] border border-[#B95750]/30 text-[#B95750] text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#B95750]" />
            <div>
              <div className="font-bold text-[#403B34]">Are you sure you want to delete this task?</div>
              <div className="mt-1 text-[#756E64]">"{taskToDelete?.title}"</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface TaskSectionGroupProps {
  title: string;
  badgeColor: string;
  count: number;
  tasks: Task[];
  onToggle: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  openTaskModal: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TaskSectionGroup({
  title,
  badgeColor,
  count,
  tasks,
  onToggle,
  toggleSubtask,
  openTaskModal,
  onDelete,
}: TaskSectionGroupProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-[#403B34] tracking-tight">{title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {count}
        </span>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => {
          const isCompleted = task.status === 'completed';
          const isOverdue = ScheduleService.isTaskOverdue(task);

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.22, delay: index * 0.02 }}
              className={`p-4 rounded-xl border transition-all duration-200 group ${
                isCompleted
                  ? 'bg-[#F7F4EE]/60 border-[#E7E0D5]/70 opacity-80'
                  : 'bg-white border-[#E7E0D5] hover:border-[#718368]/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* SVG Morphing Checkmark */}
                  <AnimatedCheckmark
                    checked={isCompleted}
                    size={22}
                    onClick={() => onToggle(task)}
                    ariaLabel={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        onClick={() => openTaskModal(task)}
                        className={`text-sm sm:text-base font-semibold hover:text-[#718368] transition-colors cursor-pointer ${
                          isCompleted ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                        }`}
                      >
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <CategoryBadge category={task.category} />
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#756E64] line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-3 text-xs text-[#968D81]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#968D81]" />
                        {ScheduleService.formatFriendlyDate(task.dueDate)}
                      </span>
                      {task.dueTime && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#B95750] font-semibold' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {task.dueTime}
                        </span>
                      )}
                      {task.recurrence !== 'none' && (
                        <span className="flex items-center gap-1 text-[#718368] font-medium capitalize">
                          <Repeat className="w-3.5 h-3.5" />
                          {task.recurrence}
                        </span>
                      )}
                      {task.reminder && (task.reminder as string) !== 'none' && (
                        <span className="flex items-center gap-1 text-[#A97535] font-medium" title={`Reminder: ${task.reminder} before`}>
                          <Bell className="w-3.5 h-3.5" />
                          <span>{task.reminder}</span>
                          {task.reminderStatus && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-[#F4EBD9] text-[#A97535] border border-[#A97535]/30">
                              {task.reminderStatus}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Subtasks checklist */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E7E0D5] space-y-1">
                        <div className="text-[11px] font-semibold text-[#968D81] uppercase tracking-wider">
                          Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {task.subtasks.map(s => (
                            <div
                              key={s.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                soundService.playClick();
                                toggleSubtask(task.id, s.id);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  soundService.playClick();
                                  toggleSubtask(task.id, s.id);
                                }
                              }}
                              className="flex items-center gap-2 text-xs text-left p-1 rounded hover:bg-[#F0EBE2] text-[#756E64] hover:text-[#403B34] cursor-pointer select-none"
                            >
                              <AnimatedCheckmark
                                checked={s.completed}
                                size={16}
                                ariaLabel={`Toggle subtask ${s.title}`}
                              />
                              <span className={s.completed ? 'line-through text-[#968D81]' : ''}>
                                {s.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Menu */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openTaskModal(task)}
                    className="p-1.5 rounded-lg text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] cursor-pointer"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="p-1.5 rounded-lg text-[#968D81] hover:text-[#B95750] hover:bg-[#F5E6E5] cursor-pointer"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  count: number;
  tasks: Task[];
  onMoveStatus: (id: string, newStatus: TaskStatus) => void;
  onToggle: (task: Task) => void;
  openTaskModal: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function KanbanColumn({
  title,
  status,
  count,
  tasks,
  onMoveStatus,
  onToggle,
  openTaskModal,
  onDelete,
}: KanbanColumnProps) {
  const columnHeaders: Record<TaskStatus, { badge: string; bg: string }> = {
    todo: { badge: 'bg-[#F0EBE2] text-[#756E64] border-[#D9D0C3]', bg: 'bg-[#FBF9F5]' },
    in_progress: { badge: 'bg-[#F4EBD9] text-[#A97535] border-[#A97535]/30', bg: 'bg-[#FBF9F5]' },
    completed: { badge: 'bg-[#E8F0E9] text-[#557B5C] border-[#557B5C]/30', bg: 'bg-[#FBF9F5]' },
  };

  const currentConfig = columnHeaders[status];

  return (
    <div className={`p-4 rounded-2xl ${currentConfig.bg} border border-[#E7E0D5] flex flex-col h-[75vh]`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E7E0D5]">
        <h3 className="text-sm font-bold text-[#403B34] tracking-tight">{title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${currentConfig.badge}`}>
          {count}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-xs text-[#968D81] border border-dashed border-[#D9D0C3] rounded-xl bg-[#F7F4EE]">
            No tasks in this lane
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-xl bg-white border border-[#E7E0D5] hover:border-[#718368]/50 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={task.priority} />
                  <CategoryBadge category={task.category} />
                </div>

                <h4
                  onClick={() => openTaskModal(task)}
                  className={`text-sm font-semibold text-[#403B34] hover:text-[#718368] cursor-pointer ${
                    status === 'completed' ? 'line-through text-[#968D81]' : ''
                  }`}
                >
                  {task.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-[#968D81] pt-2 border-t border-[#E7E0D5]">
                  <span>{ScheduleService.formatFriendlyDate(task.dueDate)}</span>
                  
                  {/* Movement actions */}
                  <div className="flex items-center gap-1">
                    {status === 'todo' && (
                      <button
                        type="button"
                        onClick={() => onMoveStatus(task.id, 'in_progress')}
                        className="px-2 py-0.5 rounded bg-[#F4EBD9] text-[#A97535] text-[10px] font-semibold hover:bg-[#ECD9BE] cursor-pointer"
                      >
                        Start →
                      </button>
                    )}
                    {status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => onMoveStatus(task.id, 'completed')}
                        className="px-2 py-0.5 rounded bg-[#E8F0E9] text-[#557B5C] text-[10px] font-semibold hover:bg-[#D2E4D4] cursor-pointer"
                      >
                        Done ✓
                      </button>
                    )}
                    {status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => onMoveStatus(task.id, 'todo')}
                        className="px-2 py-0.5 rounded bg-[#F0EBE2] text-[#756E64] text-[10px] font-semibold hover:bg-[#E7E0D5] cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="p-1 rounded text-[#968D81] hover:text-[#B95750] cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
