export type RoutineFrequency = 'daily' | 'weekdays' | 'weekly';
export type RoutineTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'productivity' | 'mindset' | 'learning' | 'fitness';
  targetFrequency: RoutineFrequency;
  targetTimeOfDay: RoutineTimeOfDay;
  targetMinutes?: number;
  currentStreak: number;
  bestStreak: number;
  completedDates: string[]; // List of YYYY-MM-DD
  createdAt: string;
  active: boolean;
  colorHex?: string;
  iconName?: string;
}
