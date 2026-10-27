'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
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
  Lock
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
    <section id="bento" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
          <span>Interactive Architecture & Features</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#403B34] tracking-tight leading-tight">
          Engineered for Pure Flow.
        </h2>
        <p className="text-base sm:text-lg text-[#756E64] mt-4 leading-relaxed">
          Every micro-interaction, sound wave, and notification pipeline is crafted to eliminate cognitive drag and amplify high-leverage execution.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento 1: Configurable Advance Reminders (Spans 2 cols) */}
        <TiltCard className="p-7 md:col-span-2 flex flex-col justify-between relative overflow-hidden group bg-white border border-[#E7E0D5] shadow-sm">
          {/* Subtle Decorative SVG Clock Dial Reticle */}
          <div className="absolute -right-12 -bottom-12 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="#718368" strokeWidth="1.5" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="60" stroke="#B88762" strokeWidth="1" />
              <line x1="100" y1="10" x2="100" y2="30" stroke="#718368" strokeWidth="2" />
              <line x1="100" y1="170" x2="100" y2="190" stroke="#718368" strokeWidth="2" />
              <line x1="10" y1="100" x2="30" y2="100" stroke="#718368" strokeWidth="2" />
              <line x1="170" y1="100" x2="190" y2="100" stroke="#718368" strokeWidth="2" />
            </svg>
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-sm">
                <Bell className="w-6 h-6 text-[#718368]" />
              </div>
              <span className="text-xs font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-3 py-1 rounded-full font-mono">
                5m • 15m • 30m • 1h
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#403B34] tracking-tight">
              Proactive Advance Notifications
            </h3>
            <p className="text-xs sm:text-sm text-[#756E64] mt-2.5 leading-relaxed max-w-xl">
              Don&apos;t get notified when a deadline has already arrived. Taskora calculates precise lead offsets against ISO timestamps and dispatches background alerts through an active Service Worker with scheduled quiet hours.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E7E0D5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#756E64]">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">at_time</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">5m</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#EAF0E5] border border-[#718368]/40 text-[#557B5C] font-bold">15m lead</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FBF9F5] border border-[#E7E0D5] text-[#756E64]">1h</span>
            </div>
            <span className="text-[#557B5C] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#718368]" />
              Service Worker Ready
            </span>
          </div>
        </TiltCard>

        {/* Bento 2: Ambient Procedural Audio Engine */}
        <TiltCard className="p-7 flex flex-col justify-between relative overflow-hidden group bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-sm">
                <Volume2 className="w-6 h-6 text-[#718368]" />
              </div>
              <span className="text-xs font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-3 py-1 rounded-full font-mono">
                Web Audio API
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#403B34] tracking-tight">
              Procedural Soundscapes
            </h3>
            <p className="text-xs text-[#756E64] mt-2 leading-relaxed">
              Real-time mathematical audio synthesis. Zero bloated MP3 downloads. Continuous non-looping rain and 8Hz alpha binaural waves.
            </p>
          </div>

          {/* Interactive Sound Chips */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSound('rain')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeSound === 'rain'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-sm'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                Rainfall
              </button>
              <button
                type="button"
                onClick={() => toggleSound('binaural')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeSound === 'binaural'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-sm'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                Alpha 8Hz
              </button>
              <button
                type="button"
                onClick={() => toggleSound('whitenoise')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeSound === 'whitenoise'
                    ? 'bg-[#718368] text-white border-[#718368] shadow-sm'
                    : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                }`}
              >
                White Noise
              </button>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="flex items-end justify-center gap-1 h-7 pt-1">
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

        {/* Bento 3: Natural Command Palette */}
        <TiltCard className="p-7 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-sm">
                <Command className="w-6 h-6 text-[#718368]" />
              </div>
              <span className="text-xs font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-3 py-1 rounded-full font-mono">
                ⌘K Quick Actions
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#403B34] tracking-tight">
              Instant Command Velocity
            </h3>
            <p className="text-xs text-[#756E64] mt-2 leading-relaxed">
              Navigate anywhere in 50 milliseconds. Search tasks, switch views, start Pomodoro timers, and trigger soundscapes without touching the mouse.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E7E0D5] space-y-2">
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <span className="text-[#756E64] font-medium">Open Command Palette</span>
              <kbd className="font-mono bg-white text-[#403B34] px-2 py-0.5 rounded text-[10px] border border-[#D9D0C3]">⌘K</kbd>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
              <span className="text-[#756E64] font-medium">Quick New Task</span>
              <kbd className="font-mono bg-white text-[#403B34] px-2 py-0.5 rounded text-[10px] border border-[#D9D0C3]">N</kbd>
            </div>
          </div>
        </TiltCard>

        {/* Bento 4: Drift-Free Timestamps (Spans 1 col) */}
        <TiltCard className="p-7 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] border border-[#F2DAC3] text-[#B88762] flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-[#B88762]" />
              </div>
              <span className="text-xs font-bold text-[#B88762] bg-[#FAF0E6] border border-[#F2DAC3] px-3 py-1 rounded-full font-mono">
                Zero Drift
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#403B34] tracking-tight">
              Drift-Free Precision
            </h3>
            <p className="text-xs text-[#756E64] mt-2 leading-relaxed">
              Standard interval countdowns drift when browser tabs are throttled in the background. Taskora computes remaining time against target epoch timestamps.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E7E0D5]">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#968D81]">Target Epoch:</span>
              <span className="text-[#B88762] font-bold">100.0% Exact</span>
            </div>
          </div>
        </TiltCard>

        {/* Bento 5: Real Productivity Velocity Engine (Spans 1 col) */}
        <TiltCard className="p-7 flex flex-col justify-between bg-white border border-[#E7E0D5] shadow-sm">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shadow-sm">
                <BarChart3 className="w-6 h-6 text-[#718368]" />
              </div>
              <span className="text-xs font-bold text-[#557B5C] bg-[#EAF0E5] border border-[#718368]/30 px-3 py-1 rounded-full font-mono">
                Real Velocity
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#403B34] tracking-tight">
              Honest Score Gauge
            </h3>
            <p className="text-xs text-[#756E64] mt-2 leading-relaxed">
              A composite 0–100 rating combining task completion, routine consistency, and active focus minutes. No manipulative fake metrics or vanity scores.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E7E0D5]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#968D81]">Streak Heatmap:</span>
              <span className="text-[#557B5C] font-bold">28-Day Matrix</span>
            </div>
          </div>
        </TiltCard>

        {/* Bento 6: Local-First Security & Export (Spans 3 cols or wide) */}
        <TiltCard className="p-7 md:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden bg-white border border-[#E7E0D5] shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-[#718368] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#718368]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#403B34] tracking-tight">
                100% Client-Side Privacy. Your Data Belongs to You.
              </h3>
              <p className="text-xs sm:text-sm text-[#756E64] mt-1.5 max-w-2xl leading-relaxed">
                Taskora stores all tasks, habits, and preferences in your browser’s indexed local storage. No external telemetry, no remote third-party databases, and full JSON export and restore at any time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5] text-xs font-mono text-[#557B5C] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#718368]" />
              Local-First Sandbox
            </span>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
