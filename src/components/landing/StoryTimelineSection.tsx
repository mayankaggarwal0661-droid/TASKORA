'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  ShieldCheck
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function StoryTimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
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

  // GSAP ScrollTrigger Pinning and Scrubbing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = containerRef.current;
    const pinTarget = pinTargetRef.current;
    if (!container || !pinTarget) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=1600',
        pin: pinTarget,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.35) {
            setActiveStep(0);
          } else if (p < 0.7) {
            setActiveStep(1);
          } else {
            setActiveStep(2);
          }
        },
      });
    }, container);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const chapters = [
    {
      id: 'scheduling',
      eyebrow: '01 / PRECISION SCHEDULING',
      title: 'Never Miss a Milestone with Advance Lead Times.',
      description: 'Traditional task managers alert you when it is already too late. Taskora lets you configure proactive advance reminder alerts 5m, 15m, 30m, and 1h ahead, complete with countdowns computed directly from ISO timestamps.',
      icon: Clock,
      tag: 'Timestamp-Accurate Engine',
      stats: [
        { label: 'Advance Lead Times', value: '5m • 15m • 1h' },
        { label: 'Time Drift', value: '0.00s' },
      ],
    },
    {
      id: 'focus',
      eyebrow: '02 / PROCEDURAL AUDIO ENGINE',
      title: 'Synthesize Deep Flow Without External Audio Assets.',
      description: 'Procedural Web Audio API generates synthetic rain showers, alpha 8Hz binaural beats, and gentle wind rustle in real time directly inside your browser. No gigabyte MP3 files or streaming buffering.',
      icon: Timer,
      tag: 'Web Audio API Synthesis',
      stats: [
        { label: 'Audio Engine', value: 'Zero External Files' },
        { label: 'Alpha Brainwave', value: '8Hz Binaural' },
      ],
    },
    {
      id: 'habits',
      eyebrow: '03 / HABIT COMPOUNDING',
      title: 'Transform Sporadic Effort into Compounding Rituals.',
      description: 'Streaks that celebrate daily rituals without manipulative guilt. Interactive 28-day heatmaps and tangible milestone badges keep you compounding personal mastery day after day.',
      icon: Flame,
      tag: 'Compounding Heatmaps',
      stats: [
        { label: 'Heatmap Tracking', value: '28-Day Matrix' },
        { label: 'Completion Velocity', value: '+34% Average' },
      ],
    },
  ];

  return (
    <section id="story" ref={containerRef} className="relative z-10 py-16 md:py-24">
      <div ref={pinTargetRef} className="max-w-6xl mx-auto px-4 sm:px-6 min-h-[580px] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left Column: Chapter Narrative & Step Selector */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
              <span>Scroll-Driven Product Story</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#718368]">
                  {chapters[activeStep].eyebrow}
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#403B34] tracking-tight leading-tight">
                  {chapters[activeStep].title}
                </h2>

                <p className="text-base sm:text-lg text-[#756E64] leading-relaxed max-w-xl">
                  {chapters[activeStep].description}
                </p>

                {/* Chapter Key Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E7E0D5]">
                  {chapters[activeStep].stats.map((s, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white border border-[#E7E0D5] shadow-xs">
                      <div className="text-[11px] text-[#968D81] uppercase tracking-wider font-semibold">{s.label}</div>
                      <div className="text-base font-bold text-[#403B34] mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step Indicators with clickable scrub fallback */}
            <div className="flex items-center gap-3 pt-4">
              {chapters.map((chap, idx) => (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setActiveStep(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeStep === idx
                      ? 'w-12 bg-[#718368] shadow-sm'
                      : 'w-3 bg-[#D9D0C3] hover:bg-[#968D81]'
                  }`}
                  aria-label={`Jump to chapter ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Transforming Interactive Visual Object */}
          <div className="relative">
            {/* Ambient background glow behind transforming visual */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#EAF0E5]/70 via-[#F4E9DE]/50 to-[#E8F0E9]/60 rounded-3xl blur-3xl pointer-events-none" />

            <TiltCard maxTilt={5} className="p-6 md:p-8 border border-[#E7E0D5] bg-white/95 shadow-xl relative z-10 min-h-[380px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  /* Visual Object 1: Precision Scheduling Console */
                  <motion.div
                    key="visual-step-0"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#718368] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#718368]">
                          Next Up Live Spotlight
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#557B5C] bg-[#EAF0E5] px-2.5 py-0.5 rounded-lg border border-[#718368]/30">
                        due in 18m 45s
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5E6E5] text-[#B95750] border border-[#B95750]/30 uppercase">
                          Critical Priority
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30 uppercase">
                          Architecture
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[#403B34] tracking-tight">
                        Release Q4 Core Platform Architecture
                      </h4>
                      <p className="text-xs text-[#756E64] mt-1">
                        Precision reminder dispatched at 15m lead buffer via Notification Service.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E7E0D5] text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                        <span className="text-[10px] text-[#968D81] block">Lead Time</span>
                        <span className="font-bold text-[#718368]">15m before</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
                        <span className="text-[10px] text-[#968D81] block">Recurrence</span>
                        <span className="font-bold text-[#B88762]">Weekly</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E7E0D5]">
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
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#718368] animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#718368]">
                          Procedural Sound Synthesizer
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleSound}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#718368] hover:bg-[#5F7157] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Volume2 className={`w-4 h-4 ${soundPlaying ? 'text-amber-200 animate-pulse' : 'text-white'}`} />
                        <span>{soundPlaying ? 'Pause Audio' : 'Test Sound Engine'}</span>
                      </button>
                    </div>

                    <div className="text-center py-1">
                      <div className="text-5xl font-black font-mono text-[#403B34] tracking-tight">
                        24:59
                      </div>
                      <span className="text-xs text-[#756E64] font-semibold uppercase tracking-widest mt-1 block">
                        Alpha Cognitive Chamber • Procedural Rain
                      </span>
                    </div>

                    {/* Animated procedural sound wave bars */}
                    <div className="flex items-end justify-center gap-1.5 h-10 px-6">
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
                        Web Audio API Sine & Pink Noise
                      </span>
                      <span className="text-[#557B5C] font-semibold">Zero Audio Latency</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  /* Visual Object 3: Compounding Habit Streak Matrix */
                  <motion.div
                    key="visual-step-2"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
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
                      <h4 className="text-lg font-bold text-[#403B34] tracking-tight">Morning Deep Architecture Review</h4>
                      <p className="text-xs text-[#756E64] mt-1">Consistency check-ins over the past 28 calendar days.</p>
                    </div>

                    {/* Responsive 28-day habit matrix */}
                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 py-2">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${
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
