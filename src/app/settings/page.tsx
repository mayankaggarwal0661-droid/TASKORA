'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { THEMES_LIST, resolveThemeId, applyTheme, CanonicalThemeId } from '@/features/theme/theme-config';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { soundService } from '@/features/audio/sound-service';
import {
  User,
  Palette,
  Database,
  Keyboard,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Check,
  ShieldCheck,
  LogOut,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { GoogleAuthModal } from '@/components/auth/GoogleAuthModal';
import { NotificationSoundSettings } from '@/components/settings/NotificationSoundSettings';

export default function SettingsPage() {
  const router = useRouter();
  const {
    userProfile,
    updateProfile,
    exportData,
    importData,
    resetData,
    addToast
  } = useTaskora();

  const { user, isGuest, signOutUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const [name, setName]                       = useState(userProfile.name);
  const [email, setEmail]                     = useState(userProfile.email);
  const [role, setRole]                       = useState(userProfile.role);
  const [timezone, setTimezone]               = useState(userProfile.timezone);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(userProfile.weeklyGoalHours);
  const [dailyTaskGoal, setDailyTaskGoal]     = useState(userProfile.dailyTaskGoal);
  const [accentColor, setAccentColor]         = useState<CanonicalThemeId>(() => resolveThemeId(userProfile.accentColor));

  useEffect(() => {
    if (userProfile.accentColor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccentColor(resolveThemeId(userProfile.accentColor));
    }
  }, [userProfile.accentColor]);

  const [importJsonText, setImportJsonText]   = useState('');
  const [showImportBox, setShowImportBox]     = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    const res = await signOutUser();
    setIsLoggingOut(false);
    if (!res.success) {
      const errMsg = res.error || 'Failed to sign out. Please check your connection and try again.';
      setLogoutError(errMsg);
      addToast({
        title: 'Sign Out Error',
        message: errMsg,
        type: 'error',
      });
      return;
    }
    setIsLogoutModalOpen(false);
    addToast({
      title: 'Signed Out',
      message: 'You have been safely signed out.',
      type: 'info',
    });
    router.push('/welcome');
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-sm focus:border-[#718368] focus:outline-none transition-colors';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      timezone: timezone.trim(),
      weeklyGoalHours: Number(weeklyGoalHours) || 35,
      dailyTaskGoal: Number(dailyTaskGoal) || 5,
      accentColor
    });
    addToast({ title: 'Profile Updated', message: 'Your preferences have been saved.', type: 'success' });
  };

  const handleExport = () => {
    soundService.playClick();
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskora-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast({ title: 'Backup Downloaded', message: 'Workspace JSON saved.', type: 'success' });
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    soundService.playClick();
    const success = importData(importJsonText.trim());
    if (success) {
      setImportJsonText('');
      setShowImportBox(false);
    }
  };

  const handleConfirmReset = () => {
    soundService.playClick();
    resetData();
    setIsResetModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E7E0D5]">
        <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
          <User className="w-3.5 h-3.5" />
          <span>Workspace Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-[#756E64] mt-1">
          Manage your personal information, productivity targets, theme accents, and data backups.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#403B34] tracking-tight">Personal Identity</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Professional Role</label>
            <input type="text" value={role} onChange={e => setRole(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Timezone</label>
            <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Weekly Focus Goal (Hours)</label>
            <input type="number" min="5" max="100" value={weeklyGoalHours} onChange={e => setWeeklyGoalHours(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#756E64] mb-1">Daily Task Delivery Target</label>
            <input type="number" min="1" max="20" value={dailyTaskGoal} onChange={e => setDailyTaskGoal(Number(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E7E0D5] flex justify-end">
          <Button type="submit" variant="primary" size="sm">
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Theme Accent Picker */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#718368]" />
            Visual Accent Theme
          </h3>
          <p className="text-xs text-[#756E64] mt-0.5">
            Choose your signature color highlight for gauges, active tabs, and badges. Changes apply across the entire workspace instantly.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Visual Accent Themes"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {THEMES_LIST.map(opt => {
            const isSelected = accentColor === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Select ${opt.name} theme`}
                onClick={() => {
                  soundService.playClick();
                  setAccentColor(opt.id);
                  applyTheme(opt.id);
                  updateProfile({ accentColor: opt.id });
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  isSelected
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-sm'
                    : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#D9D0C3] hover:bg-[#F7F4EE]'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-black/10 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: opt.colorHex }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-semibold truncate ${isSelected ? 'text-[#403B34]' : 'text-[#756E64]'}`}>
                    {opt.name}
                  </div>
                  {opt.isDefault ? (
                    <span className="text-[10px] text-[#968D81] font-normal block leading-tight">
                      Current Default
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#968D81] font-normal block truncate leading-tight">
                      {opt.colorHex}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[var(--accent)] ml-auto shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#718368]" />
            Keyboard Shortcuts
          </h3>
          <p className="text-xs text-[#756E64] mt-0.5">Power-user accelerators for fast interaction</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            ['Open Command Palette / Search', '⌘ / Ctrl + K'],
            ['Quick Create New Task',         'N'],
            ['Dismiss Modals & Sheets',        'ESC'],
            ['Navigate Command List',          '↑ / ↓ + ↵'],
          ].map(([label, shortcut]) => (
            <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <span className="text-[#403B34] font-medium">{label}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#F0EBE2] text-[#403B34] font-mono text-[11px] border border-[#D9D0C3] shadow-sm">
                {shortcut}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Account & Authentication */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#718368]" />
              Account & Authentication
            </h3>
            <p className="text-xs text-[#756E64] mt-0.5">
              Firebase Authentication session, verified identity, and security tokens.
            </p>
          </div>
          {user ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#557B5C]" />
              {user.provider === 'google'
                ? 'Google Account (Firebase Live)'
                : user.provider === 'password'
                ? 'Email & Password (Firebase Live)'
                : user.provider === 'phone'
                ? 'Phone Verified (Firebase Live)'
                : 'Authenticated Account'}
            </span>
          ) : isGuest ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0EBE2] text-[#756E64] border border-[#E7E0D5] self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A97535]" />
              Guest Session (Demo Mode)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B95750]" />
              Not Signed In
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[#756E64] font-medium block">Active Identity</span>
            <span className="text-[#403B34] font-bold mt-1 block truncate text-sm">
              {user?.displayName || userProfile.name || (isGuest ? 'Guest Explorer' : 'Not signed in')}
            </span>
            <span className="text-[#968D81] font-mono text-[11px] block truncate mt-0.5">
              {user?.email || user?.phoneNumber || (isGuest ? 'Local browser session' : 'None')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
            <span className="text-[#756E64] font-medium block">User UID / Session ID</span>
            <span className="text-[#403B34] font-mono text-[11px] mt-1 block truncate font-semibold">
              {user?.uid || (isGuest ? 'guest-local-session' : 'None')}
            </span>
            <span className="text-[#968D81] text-[11px] block mt-0.5">
              Persistence: Client-Scoped (`INDEXED_DB` / `LOCAL`)
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-[#756E64]">
            {user
              ? `Your Taskora records and preferences are securely isolated under your UID (${user.uid.slice(0, 8)}...).`
              : 'You are currently in guest mode. Sign in to isolate and preserve your private workspace across sessions.'}
          </p>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5"
                title="Development only: Firebase Diagnostics"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#718368]" />
                <span>Dev Diagnostics</span>
              </Button>
            )}

            {user && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Sounds Preference Card */}
      <NotificationSoundSettings />

      {/* Data Management */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-[#718368]" />
            Data Persistence & Portability
          </h3>
          <p className="text-xs text-[#756E64] mt-0.5">
            Export a full JSON backup of your tasks, habits, and preferences, or restore previous data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <Download className="w-4 h-4 text-[#718368]" />
            <span>Export Data (JSON)</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowImportBox(prev => !prev)} className="flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-[#968D81]" />
            <span>Import Data Backup</span>
          </Button>

          <Button variant="danger" size="sm" onClick={() => setIsResetModalOpen(true)} className="flex items-center gap-1.5 ml-auto">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Workspace Data</span>
          </Button>
        </div>

        {showImportBox && (
          <div className="pt-3 border-t border-[#E7E0D5] space-y-3">
            <label className="block text-xs font-semibold text-[#756E64] uppercase tracking-wider">
              Paste Taskora Backup JSON
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Paste exported Taskora JSON content here..."
              className="w-full p-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-xs font-mono text-[#403B34] placeholder-[#968D81] focus:border-[#718368] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowImportBox(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleImportSubmit}>Validate & Restore</Button>
            </div>
          </div>
        )}
      </div>

      {/* Log Out Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Log Out of Taskora?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-xs space-y-2">
            <p className="font-semibold text-[#403B34]">
              You will be signed out of your session ({user?.displayName || user?.email || user?.phoneNumber}).
            </p>
            <p className="text-[#756E64] leading-relaxed">
              Your tasks, habit streaks, and focus sessions remain safely stored and isolated under your account. You will be redirected to the welcome page.
            </p>
          </div>

          {logoutError && (
            <div className="p-3 rounded-xl bg-[#F5E6E5] border border-[#B95750]/30 text-[#B95750] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Sign Out Notice</span>
                <span>{logoutError}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Stay Signed In
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isLoggingOut}
              onClick={handleConfirmLogout}
              className="flex items-center gap-1.5"
            >
              {isLoggingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? 'Logging Out...' : 'Yes, Log Out'}</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Clear All Workspace Data?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5E6E5] border border-[#B95750]/30 text-[#B95750] text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#B95750] mt-0.5" />
            <div>
              <div className="font-bold text-[#403B34]">This will permanently clear all active tasks, routines, and focus sessions for this account, leaving a clean workspace.</div>
              <div className="mt-1 text-[#756E64]">We recommend exporting a JSON backup first if you wish to preserve any data.</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>Yes, Clear Workspace</Button>
          </div>
        </div>
      </Modal>

      {/* Development-Only Diagnostics Modal */}
      {process.env.NODE_ENV === 'development' && (
        <GoogleAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
