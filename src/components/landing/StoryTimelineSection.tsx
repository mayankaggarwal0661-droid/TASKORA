'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
import { soundService } from '@/features/audio/sound-service';
import {
  Clock,
  Timer,
  Flame,
  Volume2,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function StoryTimelineSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [soundPlaying, setSoundPlaying] = useState(false);

  const handleToggleSound = () => {
    if (soundPlaying) {
      soundService.stopAmbient();
      setSoundPlaying(false);
    } else {
      soundService.setAmbient('rain', 0.35);
      setSoundPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      soundService.stopAmbient();
    };
  }, []);

  const chapters = [
    {
      id: 'scheduling',
      tabLabel: '01 • Reminders',
      eyebrow: '01 / PRECISION SCHEDULING',
      title: 'Advance Lead Times. Never Miss a Milestone.',
      description: 'Traditional tools alert you when it is already too late. Taskora lets you configure proactive advance reminder alerts 5m, 15m, 30m, and 1h ahead, calculated directly from ISO timestamps.',
      icon: Clock,
      tag: 'Timestamp-Accurate Engine',
      stats: [
        { label: 'Advance Lead Offsets', value: '5m • 15m • 30m • 1h' },
        { label: 'Time Drift Guarantee', value: '0.00s Epoch Accuracy' },
      ],
    },
    {
      id: 'focus',
      tabLabel: '02 • Sound Flow',
      eyebrow: '02 / PROCEDURAL AUDIO ENGINE',
      title: 'Synthesize Deep Flow with Zero File Downloads.',
      description: 'Procedural Web Audio API generates synthetic rainfall, alpha 8Hz binaural beats, and ambient noise in real-time right inside your browser. No gigabyte MP3 files or buffering.',
      icon: Timer,
      tag: 'Web Audio API Synthesis',
      stats: [
        { label: 'Audio Latency', value: 'Zero External Files' },
        { label: 'Cognitive Alpha', value: '8Hz Binaural Beats' },
      ],
    },
    {
      id: 'habits',
      tabLabel: '03 • Habits',
      eyebrow: '03 / HABIT COMPOUNDING',
      title: 'Transform Sporadic Effort into Compounding Rituals.',
      description: 'Build daily momentum without manipulative guilt. Interactive 28-day heatmaps and tangible milestone badges celebrate incremental progress every single day.',
      icon: Flame,
      tag: 'Compounding Heatmaps',
      stats: [
        { label: 'Heatmap Matrix', value: '28-Day Consistency' },
        { label: 'Completion Velocity', value: '+34% Average Boost' },
      ],
    },
  ];

  return (
    <section id="story" className="relative z-10 py-10 sm:py-14 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header & Chapter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
              <span>Core Pillars</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#403B34] tracking-tight">
              Three pillars of calm execution.
            </h2>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 border border-[#E7E0D5] shadow-2xs">
            {chapters.map((chap, idx) => (
              <button
                key={chap.id}
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveStep(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeStep === idx
                    ? 'bg-[#718368] text-white shadow-xs'
                    : 'text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]'
                }`}
              >
                {chap.tabLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Content & Interactive Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Narrative Description */}
          <div className="lg:col-span-6 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3.5"
              >
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#718368]">
                  {chapters[activeStep].eyebrow}
                </span>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#403B34] tracking-tight leading-snug">
                  {chapters[activeStep].title}
                </h3>

                <p className="text-sm sm:text-base text-[#756E64] leading-relaxed">
                  {chapters[activeStep].description}
                </p>

                {/* Chapter Key Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E7E0D5]">
                  {chapters[activeStep].stats.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-[#E7E0D5] shadow-2xs">
                      <div className="text-[10px] text-[#968D81] uppercase tracking-wider font-semibold">{s.label}</div>
                      <div className="text-sm font-bold text-[#403B34] mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Next Chapter Link */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#756E64]">
              <span className="font-medium text-[11px]">Click tabs or jump ahead:</span>
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setActiveStep((prev) => (prev + 1) % chapters.length);
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#718368] hover:text-[#5F7157] cursor-pointer"
              >
                <span>Next Pillar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Transforming Interactive Visual Sandbox Card */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#EAF0E5]/60 via-[#F4E9DE]/40 to-[#E8F0E9]/50 rounded-3xl blur-2xl pointer-events-none" />

            <TiltCard maxTilt={4} className="p-5 sm:p-6 border border-[#E7E0D5] bg-white/95 shadow-lg relative z-10 min-h-[320px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  /* Visual Object 1: Precision Scheduling Console */
                  <motion.div
                    key="visual-step-0"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E0D5]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#718368] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#718368]">
                          Proactive Lead Alert
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#557B5C] bg-[#EAF0E5] px-2.5 py-0.5 rounded-lg border border-[#718368]/30">
                        due in 18m 45s
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30 uppercase">
                          Critical
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30 uppercase">
                          Architecture
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#403B34] tracking-tight">
                        Release Q4 Core Platform Architecture
                      </h4>
                      <p className="text-xs text-[#756E64] mt-0.5">
                        Proactive reminder dispatched at 15m lead buffer via Notification Service.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#E7E0D5] text-center text-xs">
                      <div className="p-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                        <span className="text-[10px] text-[#968D81] block">Lead Time</span>
                        <span className="font-bold text-[#718368]">15m before</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                        <span className="text-[10px] text-[#968D81] block">Recurrence</span>
                        <span className="font-bold text-[#B88762]">Weekly</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                        <span className="text-[10px] text-[#968D81] block">Subtasks</span>
                        <span className="font-bold text-[#557B5C]">3/4 Done</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  /* Visual Object 2: Deep Focus Audio Chamber */
                  <motion.div
                    key="visual-step-1"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E0D5]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#718368] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#718368]">
                          Procedural Sound Synthesizer
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleSound}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#718368] hover:bg-[#5F7157] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${soundPlaying ? 'text-amber-200 animate-pulse' : 'text-white'}`} />
                        <span>{soundPlaying ? 'Pause Audio' : 'Test Sound Engine'}</span>
                      </button>
                    </div>

                    <div className="text-center py-0.5">
                      <div className="text-4xl font-black font-mono text-[#403B34] tracking-tight">
                        24:59
                      </div>
                      <span className="text-[11px] text-[#756E64] font-semibold uppercase tracking-wider mt-0.5 block">
                        Alpha Cognitive Chamber • Procedural Rain
                      </span>
                    </div>

                    {/* Animated procedural sound wave bars */}
                    <div className="flex items-end justify-center gap-1.5 h-8 px-4">
                      {[35, 70, 50, 95, 60, 85, 40, 100, 75, 55, 90, 45, 65].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: soundPlaying ? [`${h * 0.25}%`, `${h}%`, `${h * 0.35}%`] : '15%' }}
                          transition={{ duration: 0.5 + (i % 4) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-1.5 bg-[#718368] rounded-full"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#756E64] pt-2 border-t border-[#E7E0D5]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#718368]" />
                        Web Audio API Sine &amp; Pink Noise
                      </span>
                      <span className="text-[#557B5C] font-semibold">Zero Audio Latency</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  /* Visual Object 3: Compounding Habit Streak Matrix */
                  <motion.div
                    key="visual-step-2"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E0D5]">
                      <div className="flex items-center gap-2 text-[#B88762]">
                        <Flame className="w-4 h-4 animate-pulse text-[#B88762]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#B88762]">
                          Compounding Habit Loop
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#B88762] bg-[#FAF0E6] px-2.5 py-0.5 rounded-lg border border-[#F2DAC3]">
                        21 Day Active Streak
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#403B34] tracking-tight">Morning Deep Architecture Review</h4>
                      <p className="text-xs text-[#756E64] mt-0.5">Consistency check-ins over the past 28 calendar days.</p>
                    </div>

                    {/* Responsive 28-day habit matrix */}
                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 py-1">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-5 sm:h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${
                            i % 5 !== 3
                              ? 'bg-[#718368] text-white shadow-xs'
                              : 'bg-[#F0EBE2] text-[#968D81]'
                          }`}
                          title={`Day ${i + 1}`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#756E64] pt-2 border-t border-[#E7E0D5]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#557B5C]" />
                        92% Completion Rate
                      </span>
                      <span className="text-[#B88762] font-bold">Milestone Reached</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
