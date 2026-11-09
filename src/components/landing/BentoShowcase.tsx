'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
import BellToggle from '@/components/ui/BellToggle';
import { soundService } from '@/features/audio/sound-service';
import {
  Bell,
  Volume2,
  BarChart3,
  ShieldCheck,
  Clock,
  Sparkles,
  Command,
  CheckCircle2,
  Lock,
  Timer,
  Flame,
  Layers
} from 'lucide-react';

export function BentoShowcase() {
  const [activeSound, setActiveSound] = useState<'rain' | 'binaural' | 'whitenoise' | null>(null);

  const toggleSound = (sound: 'rain' | 'binaural' | 'whitenoise') => {
    if (activeSound === sound) {
      soundService.stopAmbient();
      setActiveSound(null);
    } else {
      soundService.setAmbient(sound, 0.35);
      setActiveSound(sound);
    }
  };

  return (
    <section id="features" className="py-10 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6 relative z-10 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
          <span>Complete Ecosystem</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#403B34] tracking-tight leading-snug">
          Engineered for flow. Zero noise.
        </h2>
        <p className="text-xs sm:text-sm text-[#756E64] mt-2 leading-relaxed">
          Every micro-interaction, sound wave, and notification pipeline is crafted to eliminate cognitive drag and amplify high-leverage execution.
        </p>
      </div>

      {/* Compact Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Bento 1: Proactive Advance Notifications (Spans 2 cols on md+) */}
        <TiltCard className="p-6 md:col-span-2 flex flex-col justify-between relative overflow-hidden group bg-white border border-[#E7E0D5] shadow-sm">
          {/* Subtle Decorative Clock Reticle */}
          <div className="absolute -right-10 -bottom-10 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="#718368" strokeWidth="1.5" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="60" stroke="#B88762" strokeWidth="1" />
              <line x1="100" y1="10" x2="100" y2="30" stroke="#718368" strokeWidth="2" />
              <line x1="100" y1="170" x2="100" y2="190" stroke="#718368" strokeWidth="2" />
              <line x1="10" y1="100" x2="30" y2="100" stroke="#718368" strokeWidth="2" />
              <line x1="170" y1="100" x2="190" y2="100" stroke="#718368" strokeWidth="2" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-2xs">
                <Bell className="w-5 h-5 text-[#718368]" />
              </div>
              <BellToggle
                offLabel="Notify 15m prior"
                onLabel="15m lead active"
                size="sm"
                defaultPressed={true}
                count={2}
                badge={true}
                waves={true}
                color="#557B5C"
                background="#EAF0E5"
                onColor="#ffffff"
                onBackground="#718368"
                badgeColor="#B88762"
                onChange={() => {
                  soundService.playClick();
                }}
              />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#403B34] tracking-tight">
              Proactive Advance Notifications
            </h3>
            <p className="text-xs sm:text-sm text-[#756E64] mt-1.5 leading-relaxed max-w-xl">
              Don&apos;t get notified when a deadline has already arrived. Taskora calculates precise lead offsets against ISO timestamps and dispatches background alerts through an active Service Worker with scheduled quiet hours.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E7E0D5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#756E64]">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">at_time</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">5m</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EAF0E5] border border-[#718368]/40 text-[#557B5C] font-bold">15m lead</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">1h</span>
            </div>
            <span className="text-[#557B5C] font-semibold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#718368]" />
              Service Worker &amp; Push Ready
            </span>
          </div>
        </TiltCard>

        {/* Bento 2: Ambient Procedural Audio Engine */}
        <TiltCard className="p-6 flex flex-col justify-between relative overflow-hidden group bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-2xs">
                <Volume2 className="w-5 h-5 text-[#718368]" />
              </div>
              <span className="text-[11px] font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-2.5 py-0.5 rounded-full font-mono">
                Web Audio
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#403B34] tracking-tight">
              Procedural Soundscapes
            </h3>
            <p className="text-xs text-[#756E64] mt-1 leading-relaxed">
              Real-time mathematical audio synthesis. Zero bloated MP3 files. Continuous non-looping rain, 8Hz alpha waves, and white noise.
            </p>
          </div>

          {/* Interactive Sound Chips */}
          <div className="mt-5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleSound('rain')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  activeSound === 'rain'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-xs'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                Rainfall
              </button>
              <button
                type="button"
                onClick={() => toggleSound('binaural')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  activeSound === 'binaural'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-xs'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                Alpha 8Hz
              </button>
              <button
                type="button"
                onClick={() => toggleSound('whitenoise')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  activeSound === 'whitenoise'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-xs'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                White Noise
              </button>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="flex items-end justify-center gap-1 h-6">
              {[30, 60, 45, 80, 50, 75, 40, 90, 65, 35, 70, 55].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: activeSound ? [`${h * 0.25}%`, `${h}%`, `${h * 0.35}%`] : '16%',
                  }}
                  transition={{
                    duration: 0.5 + (i % 4) * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`w-1 rounded-full ${
                    activeSound ? 'bg-[#718368]' : 'bg-[#D9D0C3]'
                  }`}
                />
              ))}
            </div>
          </div>
        </TiltCard>

        {/* Bento 3: Compounding Habit Matrix */}
        <TiltCard className="p-6 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] border border-[#F2DAC3] text-[#B88762] flex items-center justify-center shadow-2xs">
                <Flame className="w-5 h-5 text-[#B88762]" />
              </div>
              <span className="text-[11px] font-bold text-[#B88762] bg-[#FAF0E6] border border-[#F2DAC3] px-2.5 py-0.5 rounded-full font-mono">
                28-Day Matrix
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#403B34] tracking-tight">
              Habits &amp; Streaks
            </h3>
            <p className="text-xs text-[#756E64] mt-1 leading-relaxed">
              Anchor daily rituals without toxic guilt. Responsive heatmaps and milestone celebrations reward persistent focus.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
            <span className="text-[#968D81]">Consistency Rate:</span>
            <span className="text-[#B88762] font-bold font-mono">92% Retained</span>
          </div>
        </TiltCard>

        {/* Bento 4: Calibrated Focus Sanctuary */}
        <TiltCard className="p-6 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-2xs">
                <Timer className="w-5 h-5 text-[#718368]" />
              </div>
              <span className="text-[11px] font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-2.5 py-0.5 rounded-full font-mono">
                Pomodoro
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#403B34] tracking-tight">
              Calibrated Pomodoro
            </h3>
            <p className="text-xs text-[#756E64] mt-1 leading-relaxed">
              Scientific 25/5 intervals with optional long-break cycles and distraction-free fullscreen Zen mode.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
            <span className="text-[#968D81]">Timer Mode:</span>
            <span className="text-[#557B5C] font-semibold">Adaptive Breaks</span>
          </div>
        </TiltCard>

        {/* Bento 5: Instant Command Velocity (⌘K) */}
        <TiltCard className="p-6 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-2xs">
                <Command className="w-5 h-5 text-[#718368]" />
              </div>
              <span className="text-[11px] font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-2.5 py-0.5 rounded-full font-mono">
                ⌘K Velocity
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#403B34] tracking-tight">
              Instant Command Speed
            </h3>
            <p className="text-xs text-[#756E64] mt-1 leading-relaxed">
              Navigate anywhere in 50 milliseconds. Search tasks, switch views, start timers, and trigger sounds without touching the mouse.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
            <span className="text-[#968D81]">Shortcut:</span>
            <kbd className="font-mono bg-[#FBF9F5] text-[#403B34] px-2 py-0.5 rounded text-[10px] border border-[#D9D0C3]">⌘K</kbd>
          </div>
        </TiltCard>

        {/* Bento 6: Local-First Privacy & UID Cloud Sync (Spans 1 or 3 cols) */}
        <TiltCard className="p-6 md:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden bg-white border border-[#E7E0D5] shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#718368]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#403B34] tracking-tight">
                100% Client-Side Privacy. Your Data Belongs to You.
              </h3>
              <p className="text-xs text-[#756E64] mt-1 max-w-2xl leading-relaxed">
                Taskora stores all tasks, habits, and preferences in your browser’s indexed local storage with zero tracking. Connect Firebase for seamless, encrypted multi-device sync whenever you are ready.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-[11px] font-mono text-[#557B5C] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#718368]" />
              Local-First Sandbox
            </span>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
