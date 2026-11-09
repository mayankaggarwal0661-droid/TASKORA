'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { FloatingNav } from '@/components/landing/FloatingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SplitText } from '@/components/landing/SplitText';
import { StoryTimelineSection } from '@/components/landing/StoryTimelineSection';
import { BentoShowcase } from '@/components/landing/BentoShowcase';
import { TiltCard } from '@/components/ui/TiltCard';
import { DitherVeil } from '@/components/ui/DitherVeil';
import { soundService } from '@/features/audio/sound-service';
import {
  Leaf,
  ArrowRight,
  CheckCircle2,
  Bell,
  Star,
  Sparkles,
  Compass,
  Volume2,
  Flame,
  Clock,
  ShieldCheck
} from 'lucide-react';

const proofChips = [
  'Proactive 15m Alerts',
  'Procedural Web Audio',
  '100% Client-Side Privacy',
  'Instant Guest Access',
];

interface MockTask {
  id: number;
  title: string;
  priority: 'Critical' | 'High' | 'Routine';
  due: string;
  leadTime?: string;
  done: boolean;
}

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { user, continueAsGuest } = useAuth();

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Interactive mock tasks in hero preview
  const [mockTasks, setMockTasks] = useState<MockTask[]>([
    {
      id: 1,
      title: 'Review Q4 system architecture',
      priority: 'High',
      due: '11:00 AM',
      done: true,
    },
    {
      id: 2,
      title: 'Design token parity & verification',
      priority: 'Critical',
      due: 'In 28m',
      leadTime: 'ðŸ”” 15m lead alert',
      done: false,
    },
    {
      id: 3,
      title: 'Evening mindfulness & habit reflection',
      priority: 'Routine',
      due: '6:30 PM',
      done: false,
    },
  ]);

  const [heroAudioActive, setHeroAudioActive] = useState(false);

  const toggleMockTask = (id: number) => {
    soundService.playClick();
    setMockTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const toggleHeroAudio = () => {
    if (heroAudioActive) {
      soundService.stopAmbient();
      setHeroAudioActive(false);
    } else {
      soundService.setAmbient('rain', 0.3);
      setHeroAudioActive(true);
    }
  };

  const handleLaunchWorkspace = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/welcome');
    }
  };

  const handleGuestAccess = async () => {
    try {
      await continueAsGuest();
      router.push('/dashboard');
    } catch {
      router.push('/welcome');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#403B34] relative overflow-x-hidden selection:bg-[#718368]/20">


      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#718368] z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Floating Navigation */}
      <FloatingNav />

      {/* â”€â”€ Compact 2-Column Hero Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section
        id="overview"
        ref={heroRef}
        className="relative z-10 w-full min-h-screen min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#F7F4EE] pt-24 sm:pt-28 pb-12 scroll-mt-24"
      >
        {/* Layer 1 (Lowest, z-0): Base Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#F7F4EE]" aria-hidden="true">
          <img
            src="/workspace-hero.jpg"
            alt="Warm workspace office desk with open laptop, coffee cup, notebook, and plant"
            className="w-full h-full object-cover select-none"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Layer 2 (Above base image, z-[1]): DitherVeil Interactive Canvas Effect */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
          <DitherVeil
            src="/workspace-hero.jpg"
            fit="cover"
            pattern="floyd"
            palette="duotone"
            pixelSize={2}
            inkColor="#718368"
            paperColor="#F7F4EE"
            rimColor="#B88762"
            rim={0.1}
            revealRadius={220}
            softness={0.65}
            linger={0.8}
            contrast={1.15}
            brightness={0}
            clickBurst={false}
            wander={false}
            targetRef={heroRef}
            className="w-full h-full"
            fallback={
              <div
                className="w-full h-full bg-[#F7F4EE]"
                style={{
                  backgroundImage: 'radial-gradient(#718368 1.2px, transparent 1.2px)',
                  backgroundSize: '16px 16px',
                  opacity: 0.4,
                }}
              />
            }
          />
        </div>

        {/* Layer 3 (Above effect, below content, z-[2]): Subtle warm directional readability overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#F7F4EE]/90 via-[#F7F4EE]/50 to-transparent pointer-events-none z-[2]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          {/* â”€â”€ Left Column: Concise Content, Headlines & CTAs â”€â”€ */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold mb-3.5 shadow-2xs w-fit"
            >
              <Leaf className="w-3.5 h-3.5 text-[#718368]" />
              <span>Calm, Focused Productivity â€” Zero Noise</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-[#403B34] leading-[1.12]">
              <SplitText
                text="Your tasks & habits, beautifully organized."
                highlightWords={['beautifully']}
                highlightClassName="text-[#718368] underline decoration-[#EAF0E5] decoration-wavy decoration-4 underline-offset-6"
                delay={0.08}
              />
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base lg:text-lg text-[#756E64] max-w-xl mt-3.5 sm:mt-4 leading-relaxed font-normal"
            >
              Taskora combines proactive advance reminders, daily habit rituals, Pomodoro flow, and procedural soundscapes â€” in a warm, distraction-free workspace.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 sm:mt-7"
            >
              <button
                type="button"
                onClick={handleLaunchWorkspace}
                className="px-6 py-3.5 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#FBF9F5] text-[#403B34] font-semibold text-xs sm:text-sm border border-[#D9D0C3] hover:border-[#718368] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 text-[#718368]" />
                <span>Explore as Guest</span>
              </button>
            </motion.div>

            {/* Quick auth prompt link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 text-xs text-[#756E64]"
            >
              <span>Have an account? </span>
              <Link
                href="/welcome"
                className="text-[#718368] font-semibold hover:text-[#5F7157] underline underline-offset-2"
              >
                Sign in with Google or Email
              </Link>
            </motion.div>

            {/* Proof chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 pt-5 border-t border-[#E7E0D5] text-[11px] text-[#968D81] font-medium"
            >
              {proofChips.map((chip) => (
                <span key={chip} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#557B5C] shrink-0" />
                  <span>{chip}</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* â”€â”€ Right Column: Compact Product Preview Card â”€â”€ */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <TiltCard
              maxTilt={4}
              className="w-full max-w-md p-5 sm:p-6 bg-white/95 rounded-3xl border border-[#E7E0D5] shadow-xl relative overflow-hidden backdrop-blur-sm"
            >
              {/* Card Header: Live Agenda & Streaks */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#557B5C] animate-pulse" />
                  <span className="text-xs font-bold text-[#403B34]">Today&apos;s Focus</span>
                  <span className="text-[10px] text-[#968D81] font-mono">â€¢ Active Agenda</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF0E6] border border-[#F2DAC3] text-[10px] font-bold text-[#B88762]">
                  <Flame className="w-3 h-3 text-[#B88762]" />
                  <span>5d Streak</span>
                </div>
              </div>

              {/* Next Up Live Banner */}
              <div className="mt-3.5 p-3 rounded-2xl bg-[#EAF0E5]/70 border border-[#718368]/25 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#557B5C]">
                    <Clock className="w-3 h-3 text-[#718368]" />
                    <span>Next Milestone</span>
                  </div>
                  <p className="text-xs font-bold text-[#403B34] truncate">
                    Platform Architecture Review
                  </p>
                  <p className="text-[10px] text-[#557B5C] font-semibold">
                    ðŸ”” Advance reminder scheduled 15m prior
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white text-[#557B5C] px-2 py-1 rounded-lg border border-[#718368]/25 shrink-0 shadow-2xs">
                  in 28m
                </span>
              </div>

              {/* Interactive Mock Tasks List */}
              <div className="mt-3.5 space-y-2">
                {mockTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleMockTask(task.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      task.done
                        ? 'bg-[#FBF9F5] border-[#E7E0D5] opacity-65'
                        : 'bg-white border-[#E7E0D5] hover:border-[#718368]/50 hover:shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        task.done
                          ? 'border-[#718368] bg-[#718368]'
                          : 'border-[#D9D0C3] hover:border-[#718368]'
                      }`}
                    >
                      {task.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          task.done ? 'line-through text-[#968D81]' : 'text-[#403B34]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.leadTime && !task.done && (
                        <span className="text-[10px] text-[#A97535] font-medium block">
                          {task.leadTime}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 border ${
                        task.priority === 'Critical'
                          ? 'bg-[#F5E6E5] text-[#B95750] border-[#B95750]/30'
                          : task.priority === 'High'
                          ? 'bg-[#F4EBD9] text-[#A97535] border-[#A97535]/30'
                          : 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Widget: Audio Chamber & Velocity Score */}
              <div className="mt-3.5 pt-3 border-t border-[#E7E0D5] flex items-center justify-between text-xs">
                {/* Audio pill with live toggle */}
                <button
                  type="button"
                  onClick={toggleHeroAudio}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    heroAudioActive
                      ? 'bg-[#718368] text-white border-[#718368]'
                      : 'bg-[#FBF9F5] text-[#756E64] border-[#E7E0D5] hover:text-[#403B34]'
                  }`}
                  title="Toggle Web Audio rainfall sound"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${heroAudioActive ? 'animate-pulse text-amber-200' : ''}`} />
                  <span>{heroAudioActive ? 'Rain Active' : 'Rain Audio'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-[#557B5C] font-semibold text-[11px]">
                  <Star className="w-3.5 h-3.5 text-[#A97535] fill-[#A97535]" />
                  <span>88 Productivity Velocity</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Core Product Story & Pillars Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <StoryTimelineSection />

      {/* â”€â”€ Interactive Bento Architecture & Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <BentoShowcase />

      {/* â”€â”€ Compact Conversion CTA Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative z-10 py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-white border border-[#E7E0D5] shadow-lg text-center"
        >
          {/* Subtle warm glow */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-[#EAF0E5] rounded-full blur-3xl opacity-60 pointer-events-none -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#F4E9DE] rounded-full blur-3xl opacity-50 pointer-events-none -ml-10 -mb-10" />

          <div className="relative z-10 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto border border-[#718368]/20">
              <Leaf className="w-5 h-5 text-[#718368]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#403B34] tracking-tight">
              Ready to build better days?
            </h2>

            <p className="text-xs sm:text-sm text-[#756E64] max-w-md mx-auto leading-relaxed">
              Step into a calm, focused workspace with proactive reminders, habit rituals, and real productivity insights. No account required.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLaunchWorkspace}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Taskora Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FBF9F5] text-[#403B34] text-xs sm:text-sm font-semibold border border-[#D9D0C3] hover:border-[#718368] transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Compass className="w-4 h-4 text-[#718368]" />
                <span>Explore as Guest</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
