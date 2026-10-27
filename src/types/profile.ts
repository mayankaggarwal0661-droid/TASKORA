import { CanonicalThemeId, LegacyThemeId } from '@/features/theme/theme-config';

export type AccentTheme = CanonicalThemeId | LegacyThemeId;

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  timezone: string;
  accentColor: AccentTheme;
  weeklyGoalHours: number;
  dailyTaskGoal: number;
  createdAt: string;
}

export interface AppToast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}
