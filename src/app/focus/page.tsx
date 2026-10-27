'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTaskora } from '@/context/TaskoraContext';
import { FocusModeType, AmbientSoundType } from '@/types/focus';
import { soundService } from '@/features/audio/sound-service';
import { triggerCelebration } from '@/lib/motion';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CloudRain,
  Waves,
  Wind,
  Trees,
  CheckCircle2,
  Timer,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function FocusModeContent() {
  const searchParams = useSearchParams();
  const preselectedTaskId = searchParams.get('taskId');

  const {
    tasks,
    focusSettings,
    focusSessions,
    logFocusSession,
    addToast,
    todayStr
  } = useTaskora();

  // Mode and Timer State
  const [mode, setMode] = useState<FocusModeType>('pomodoro');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(preselectedTaskId || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [breathingAuraEnabled, setBreathingAuraEnabled] = useState(true);

  // Timestamp references to prevent drift
  const targetEndTimeRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number | null>(null);

  // Ambient sound state
  const [ambientType, setAmbientType] = useState<AmbientSoundType>(focusSettings.ambientSound || 'none');
  const [volume, setVolume] = useState(focusSettings.ambientVolume ?? 0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Tab visibility tracking to pause background animations and save CPU
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const totalModeSeconds =
    mode === 'pomodoro'
      ? focusSettings.pomodoroMinutes * 60
      : mode === 'short_break'
      ? focusSettings.shortBreakMinutes * 60
      : mode === 'long_break'
      ? focusSettings.longBreakMinutes * 60
      : 0;

  const isPaused = !isActive && secondsRemaining < totalModeSeconds && secondsRemaining > 0;

  // Sync initial seconds when mode changes
  useEffect(() => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    switch (mode) {
      case 'pomodoro':
        setSecondsRemaining(focusSettings.pomodoroMinutes * 60);
        break;
      case 'short_break':
        setSecondsRemaining(focusSettings.shortBreakMinutes * 60);
        break;
      case 'long_break':
        setSecondsRemaining(focusSettings.longBreakMinutes * 60);
        break;
      case 'stopwatch':
        setSecondsRemaining(0);
        break;
    }
  }, [mode, focusSettings]);

  // Timestamp-based drift-free timer engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      if (mode === 'stopwatch') {
        stopwatchStartTimeRef.current = Date.now() - secondsRemaining * 1000;
      } else {
        targetEndTimeRef.current = Date.now() + secondsRemaining * 1000;
      }

      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          if (stopwatchStartTimeRef.current) {
            const elapsed = Math.floor((Date.now() - stopwatchStartTimeRef.current) / 1000);
            setSecondsRemaining(elapsed);
          }
        } else {
          if (targetEndTimeRef.current) {
            const diff = targetEndTimeRef.current - Date.now();
            const remaining = Math.max(0, Math.ceil(diff / 1000));
            setSecondsRemaining(remaining);

            if (remaining <= 0) {
              // Timer Finished!
              setIsActive(false);
              targetEndTimeRef.current = null;
              soundService.playSessionEnd();
              triggerCelebration(0.5, 0.5);

              // Log session
              const dur = mode === 'pomodoro' ? focusSettings.pomodoroMinutes * 60 : 300;
              const associatedTask = tasks.find(t => t.id === selectedTaskId);
              logFocusSession({
                taskId: selectedTaskId || undefined,
                taskTitle: associatedTask?.title,
                durationSeconds: dur,
                mode: mode,
              });

              addToast({
                title: mode === 'pomodoro' ? 'Focus Session Completed! 🎯' : 'Break Finished!',
                message: mode === 'pomodoro' ? 'Great focus! Take a restorative 5-minute break.' : 'Ready to resume your deep work?',
                type: 'success',
                duration: 6000
              });
            }
          }
        }
      }, 500); // Check every 500ms against exact timestamps
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode, focusSettings, selectedTaskId, tasks, logFocusSession, addToast]);

  // Handle ambient sound engine changes
  useEffect(() => {
    if (isMuted || !isActive) {
      soundService.stopAmbient();
    } else {
      soundService.setAmbient(ambientType, volume);
    }

    return () => {
      soundService.stopAmbient();
    };
  }, [ambientType, volume, isMuted, isActive]);

  const toggleTimer = () => {
    soundService.playClick();
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    soundService.playClick();
    setIsActive(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    switch (mode) {
      case 'pomodoro': setSecondsRemaining(focusSettings.pomodoroMinutes * 60); break;
      case 'short_break': setSecondsRemaining(focusSettings.shortBreakMinutes * 60); break;
      case 'long_break': setSecondsRemaining(focusSettings.longBreakMinutes * 60); break;
      case 'stopwatch': setSecondsRemaining(0); break;
    }
  };

  const skipTimer = () => {
    soundService.playClick();
    setIsActive(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    if (mode === 'pomodoro') setMode('short_break');
    else if (mode === 'short_break') setMode('pomodoro');
    else if (mode === 'long_break') setMode('pomodoro');
  };

  const handleAmbientChange = (type: AmbientSoundType) => {
    soundService.playClick();
    setAmbientType(type);
    if (type !== 'none') {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Circular progress calculations
  const totalDuration = mode === 'pomodoro'
    ? focusSettings.pomodoroMinutes * 60
    : mode === 'short_break'
    ? focusSettings.shortBreakMinutes * 60
    : mode === 'long_break'
    ? focusSettings.longBreakMinutes * 60
    : 3600;

  const progress = totalDuration > 0
    ? mode === 'stopwatch'
      ? Math.min(100, (secondsRemaining / 3600) * 100)
      : Math.max(0, Math.min(100, ((totalDuration - secondsRemaining) / totalDuration) * 100))
    : 0;

  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const todayIso = todayStr;
  const sessionsToday = focusSessions.filter(s => s.completedAt.startsWith(todayIso));
  const focusMinsToday = Math.round(sessionsToday.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F7F4EE] overflow-y-auto max-w-none' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deep Work Chamber</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
            Focus Mode
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBreathingAuraEnabled(!breathingAuraEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              breathingAuraEnabled
                ? 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]/30 shadow-xs'
                : 'bg-[#FBF9F5] text-[#968D81] border-[#E7E0D5]'
            }`}
            title="Toggle Gentle Breathing Ambient Animation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{breathingAuraEnabled ? 'Breathing Aura On' : 'Breathing Aura Off'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-[#756E64] hover:text-[#403B34]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Focus Console */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E7E0D5] shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        {/* Gentle Breathing Aura behind timer */}
        {breathingAuraEnabled && isTabVisible && (
          <motion.div
            animate={
              isActive
                ? { scale: [1, 1.25, 1], opacity: [0.35, 0.75, 0.35] }
                : isPaused
                ? { scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }
                : { scale: 1, opacity: 0.25 }
            }
            transition={{
              duration: isPaused ? 3 : 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none -z-0 transition-colors duration-500 ${
              isPaused ? 'bg-[#F4EBD9]' : 'bg-[#EAF0E5]'
            }`}
          />
        )}

        {/* Mode Selector Buttons with Spring Layout */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F0EBE2] border border-[#E7E0D5] mb-8 relative z-10 flex-wrap justify-center gap-1">
          {(
            [
              { key: 'pomodoro', label: 'Pomodoro (25m)' },
              { key: 'short_break', label: 'Short Break (5m)' },
              { key: 'long_break', label: 'Long Break (15m)' },
              { key: 'stopwatch', label: 'Stopwatch' },
            ] as const
          ).map(m => {
            const isSelected = mode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected ? 'text-white' : 'text-[#756E64] hover:text-[#403B34]'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="focusModeTab"
                    className={`absolute inset-0 rounded-xl shadow-sm -z-10 ${
                      m.key === 'stopwatch' ? 'bg-[#B88762]' : 'bg-[#718368]'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  />
                )}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative my-4 flex items-center justify-center">
          <svg width={320} height={320} className="transform -rotate-90">
            <defs>
              <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent, #718368)" />
                <stop offset="100%" stopColor="var(--accent-hover, #557B5C)" />
              </linearGradient>
            </defs>

            {/* Track */}
            <circle
              cx={160}
              cy={160}
              r={radius}
              stroke="#E7E0D5"
              strokeWidth={14}
              fill="none"
            />

            {/* Progress */}
            <circle
              cx={160}
              cy={160}
              r={radius}
              stroke="url(#focus-gradient)"
              strokeWidth={14}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-black text-[#403B34] font-mono tracking-tight">
              {formattedTime}
            </span>
            {/* Session Status Badge */}
            {isActive ? (
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#557B5C] bg-[#EAF0E5] px-3 py-1 rounded-full border border-[#718368]/20 mt-2 shadow-2xs">
                Session Active
              </span>
            ) : isPaused ? (
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#A97535] bg-[#F4EBD9] px-3 py-1 rounded-full border border-[#B88762]/25 mt-2 shadow-2xs">
                Session Paused
              </span>
            ) : (
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#756E64] bg-[#F0EBE2] px-3 py-1 rounded-full border border-[#E7E0D5] mt-2">
                Ready to Focus
              </span>
            )}

            {/* Animated sound wave bars when audio is active */}
            {isActive && ambientType !== 'none' && !isMuted && (
              <div className="flex items-end justify-center gap-1 h-5 mt-2">
                {[30, 60, 45, 80, 50, 70, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                    transition={{ duration: 0.5 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1 bg-[#718368] rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Attachment Selector */}
        <div className="w-full max-w-md my-6 relative z-10">
          <label className="block text-center text-xs font-semibold text-[#756E64] uppercase tracking-wider mb-2">
            Target Focus Task
          </label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[#403B34] text-xs font-medium focus:border-[#718368] text-center cursor-pointer"
          >
            <option value="">— Unlinked general deep work block —</option>
            {tasks.filter(t => t.status !== 'completed').map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.priority.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Play / Pause / Reset / Skip Controls */}
        <div className="flex items-center gap-4 relative z-10 mt-2">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-[#FBF9F5] text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2] border border-[#E7E0D5] transition-all cursor-pointer"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className="px-8 py-4 rounded-2xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-base flex items-center gap-2.5 shadow-md border border-[#718368] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={skipTimer}
            className="p-3.5 rounded-2xl bg-[#FBF9F5] text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2] border border-[#E7E0D5] transition-all cursor-pointer"
            title="Skip Interval"
            aria-label="Skip Interval"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Procedural Web Audio Ambient Soundscape Player */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E0D5]">
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#718368]" />
              Procedural Ambient Soundscapes
            </h3>
            <p className="text-xs text-[#756E64] mt-0.5">
              Zero-asset Web Audio API synthesizers for deep concentration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 rounded-xl bg-[#FBF9F5] text-[#756E64] hover:text-[#403B34] border border-[#E7E0D5] cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#B95750]" /> : <Volume2 className="w-4 h-4 text-[#718368]" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                soundService.setAmbientVolume(v);
              }}
              className="w-24 accent-[#718368] cursor-pointer"
              aria-label="Ambient volume"
            />
          </div>
        </div>

        {/* 4 Soundscape Choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'rain' as const, label: 'Rain Shower', icon: CloudRain, desc: 'Filtered pink noise drops' },
            { id: 'binaural' as const, label: '8Hz Binaural', icon: Waves, desc: 'Alpha cognitive wave beat' },
            { id: 'whitenoise' as const, label: 'White Noise', icon: Wind, desc: 'Clean background masking' },
            { id: 'forest' as const, label: 'Forest Breeze', icon: Trees, desc: 'Gentle wind & subtle birds' },
          ].map(sound => {
            const isCurrent = ambientType === sound.id;
            const Icon = sound.icon;

            return (
              <button
                key={sound.id}
                type="button"
                onClick={() => handleAmbientChange(sound.id === ambientType ? 'none' : sound.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent && !isMuted
                    ? 'bg-[#EAF0E5] border-[#718368]/40 shadow-xs'
                    : 'bg-[#FBF9F5] border-[#E7E0D5] hover:border-[#D9D0C3]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isCurrent && !isMuted ? 'text-[#718368]' : 'text-[#968D81]'}`} />
                  {isCurrent && !isMuted && (
                    <span className="w-2 h-2 rounded-full bg-[#718368] animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-[#403B34]">{sound.label}</div>
                <div className="text-[10px] text-[#756E64] mt-0.5">{sound.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Session Log History */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E0D5] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5] mb-3">
          <h3 className="text-base font-bold text-[#403B34] tracking-tight">Today's Focus Log</h3>
          <span className="text-xs text-[#718368] font-semibold">
            {focusMinsToday} mins ({sessionsToday.length} sessions)
          </span>
        </div>

        {sessionsToday.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#968D81]">
            No focus blocks completed yet today. Start your first session above!
          </div>
        ) : (
          <div className="space-y-2">
            {sessionsToday.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EAF0E5] text-[#718368] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#403B34]">
                      {session.taskTitle || 'Unlinked Focus Block'}
                    </h4>
                    <span className="text-[10px] text-[#968D81] uppercase font-mono">
                      {session.mode} • {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#403B34]">
                  {Math.round(session.durationSeconds / 60)} mins
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FocusModePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#968D81]">Loading Focus Chamber...</div>}>
      <FocusModeContent />
    </Suspense>
  );
}
