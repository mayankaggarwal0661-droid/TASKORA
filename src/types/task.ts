export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning' | 'routine';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type RecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export type AdvanceReminder = 'at_time' | '5m' | '15m' | '30m' | '1h' | '1d';

export type ReminderStatus =
  | 'scheduled'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'missed'
  | 'cancelled'
  | 'snoozed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  timezone: string;
  recurrence: RecurrenceRule;
  reminder: AdvanceReminder;
  reminderStatus?: ReminderStatus;
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
}

export interface TaskFilterOptions {
  searchQuery: string;
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  status?: TaskStatus | 'all';
  dateFilter?: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
  sortBy?: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
