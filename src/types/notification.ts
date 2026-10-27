export type LeadTimeOption = 'at_time' | '5m' | '15m' | '30m' | '1h';

export type BuiltInSoundId =
  | 'soft-chime'
  | 'gentle-bell'
  | 'digital-pop'
  | 'wooden-tap'
  | 'glass-sparkle'
  | 'calm-reminder'
  | 'classic-alert'
  | 'silent'
  | 'custom';

export interface CustomSoundMeta {
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface NotificationSettings {
  permission: NotificationPermission;
  browserEnabled: boolean;
  inAppToastEnabled: boolean;
  defaultLeadTime: LeadTimeOption;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  dailyDigestEnabled: boolean;
  dailyDigestTime: string; // "08:30"
  soundAlerts: boolean;
  soundId?: BuiltInSoundId;
  soundVolume?: number; // 0 to 1
  customSound?: CustomSoundMeta | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'routine' | 'streak' | 'achievement' | 'system';
  timestamp: string;
  read: boolean;
  taskId?: string;
}
