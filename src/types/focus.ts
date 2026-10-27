export type FocusModeType = 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';
export type AmbientSoundType = 'none' | 'rain' | 'binaural' | 'whitenoise' | 'forest';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationSeconds: number;
  completedAt: string; // ISO date
  mode: FocusModeType;
  notes?: string;
}

export interface FocusSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number; // 0.0 to 1.0
}
