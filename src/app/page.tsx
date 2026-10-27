'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FloatingNav } from '@/components/landing/FloatingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { DecorativeParallax } from '@/components/landing/DecorativeParallax';
import { SplitText } from '@/components/landing/SplitText';
import { StoryTimelineSection } from '@/components/landing/StoryTimelineSection';
import { BentoShowcase } from '@/components/landing/BentoShowcase';
import {
  Leaf,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  Flame,
  Timer,
  Bell,
  Calendar,
  Star,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: CheckCircle2,
    title: 'Smart Task Scheduling',
    desc: 'Create tasks with due dates, priorities, subtasks, and recurring rules. Filter and view as list or kanban board.',
  },
  {
    icon: Bell,
    title: 'Advance Reminders',
    desc: 'Get proactive alerts 5 min to 1 hour before deadlines. Configure quiet hours and morning briefings.',
  },
  {
    icon: Flame,
    title: 'Routines & Streaks',
    desc: 'Build daily habits with heatmap tracking and streak milestones. Never break the chain.',
  },
  {
    icon: Timer,
    title: 'Focus Mode',
    desc: 'Pomodoro timer with procedural ambient soundscapes — rain, binaural beats, white noise, forest.',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    desc: 'Real metrics from your actual task deliveries, habit consistency, and deep focus sessions.',
  },
  {
    icon: Calendar,
    title: 'Calendar View',
    desc: 'Monthly overview with per-day agendas. Create tasks directly from any date in the grid.',
  },
];

const proofChips = [
  'Web Audio API Synthesis',
  'Drift-Free Timestamp Engine',
  '100% Client-Side Privacy',
  'No Account Required',
];

export default function LandingPage() {
  const router = useRouter();

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const handleLaunchWorkspace = () => {
    router.push('/welcome');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#403B34] relative overflow-x-hidden selection:bg-[#718368]/20">

      {/* Parallax Vector Accent Graphics */}
      <DecorativeParallax />

      {/* Subtle warm aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[500px] bg-[#EAF0E5]/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-[#F4E9DE]/50 rounded-full blur-[100px]" />
      </div>

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#718368] z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Floating Navigation */}
      <FloatingNav />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] pt-32 sm:pt-36 pb-16 flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto z-10">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E5] border border-[#718368]/30 text-[#557B5C] text-xs font-semibold mb-8 shadow-xs"
        >
          <Leaf className="w-3.5 h-3.5 text-[#718368]" />
          <span>Calm, Focused Productivity — Zero Noise</span>
        </motion.div>

        {/* Staggered SplitText Headline */}
        <div className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl text-[#403B34] leading-[1.08]">
          <SplitText
            text="Your tasks, beautifully organized."
            highlightWords={['beautifully']}
            highlightClassName="text-[#718368] underline decoration-[#EAF0E5] decoration-wavy decoration-4 underline-offset-8"
            delay={0.12}
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-[#756E64] max-w-2xl mt-6 leading-relaxed"
        >
          Taskora combines proactive reminders, daily habit rituals, deep focus sessions, and real analytics — in a warm, distraction-free workspace.
        </motion.p>

        {/* Hero Interactive Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg my-10"
        >
          <div className="relative p-6 bg-white rounded-3xl border border-[#E7E0D5] shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Mock task list preview */}
            <div className="space-y-3">
              {[
                { title: 'Review Q4 project proposal', priority: 'High', done: true },
                { title: 'Morning mindfulness & journaling', priority: 'Routine', done: true },
                { title: 'Send client deliverables by 5pm', priority: 'Critical', done: false },
                { title: 'Deep reading — 30 minutes', priority: 'Learning', done: false },
              ].map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    task.done ? 'bg-[#FBF9F5] border-[#E7E0D5] opacity-60' : 'bg-white border-[#E7E0D5] hover:border-[#718368]/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    task.done ? 'border-[#718368] bg-[#718368]' : 'border-[#D9D0C3]'
                  }`}>
                    {task.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm font-medium flex-1 text-left ${task.done ? 'line-through text-[#968D81]' : 'text-[#403B34]'}`}>
                    {task.title}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    task.priority === 'Critical' ? 'bg-[#F5E6E5] text-[#B95750] border-[#B95750]/30'
                    : task.priority === 'High' ? 'bg-[#F4EBD9] text-[#A97535] border-[#A97535]/30'
                    : 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]/30'
                  }`}>
                    {task.priority}
                  </span>
                </motion.div>
              ))}
            </div>
            {/* Bottom mini-stats */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E7E0D5] text-xs text-[#968D81]">
              <span>2 of 4 tasks complete</span>
              <div className="flex items-center gap-1 text-[#718368] font-semibold">
                <Star className="w-3.5 h-3.5" />
                <span>85 productivity score</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={handleLaunchWorkspace}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white bg-[#718368] hover:bg-[#5F7157] shadow-md border border-[#718368] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#story"
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm text-[#756E64] hover:text-[#403B34] bg-white hover:bg-[#F0EBE2] border border-[#E7E0D5] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#718368]" />
            <span>Interactive Story</span>
          </a>
        </motion.div>

        {/* Proof chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 text-xs text-[#968D81] font-medium"
        >
          {proofChips.map(chip => (
            <span key={chip} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#557B5C]" />
              {chip}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── Scroll-Animated Card Storytelling Section (Restored) ─────────── */}
      <StoryTimelineSection />

      {/* ── Interactive Bento Architecture & Audio Showcase ─────────────── */}
      <BentoShowcase />

      {/* ── Features Section ─────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0E5] border border-[#718368]/25 text-[#557B5C] text-xs font-semibold mb-4"
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Everything you need</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3xl sm:text-4xl font-black text-[#403B34] tracking-tight"
          >
            A complete productivity ecosystem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[#756E64] mt-3 max-w-xl mx-auto"
          >
            Every tool you need to build better days, consistently.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-white rounded-2xl border border-[#E7E0D5] hover:border-[#718368]/40 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] flex items-center justify-center mb-4 group-hover:bg-[#D9E8D3] transition-colors">
                  <Icon className="w-5 h-5 text-[#718368]" />
                </div>
                <h3 className="text-base font-bold text-[#403B34] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#756E64] leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden p-10 sm:p-14 rounded-3xl bg-white border border-[#E7E0D5] shadow-xl text-center"
        >
          {/* Subtle warm glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAF0E5] rounded-full blur-3xl opacity-60 pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F4E9DE] rounded-full blur-3xl opacity-50 pointer-events-none -ml-12 -mb-12" />

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto border border-[#718368]/20">
              <Leaf className="w-7 h-7 text-[#718368]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#403B34] tracking-tight">
              Ready to build better days?
            </h2>
            <p className="text-[#756E64] max-w-lg mx-auto">
              Step into a calm, focused workspace with smart reminders, habit rituals, and real productivity insights. No account required.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchWorkspace}
                className="px-8 py-4 rounded-xl text-base font-bold text-white bg-[#718368] hover:bg-[#5F7157] shadow-md border border-[#718368] transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Taskora Workspace</span>
                <ArrowRight className="w-4 h-4" />
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
