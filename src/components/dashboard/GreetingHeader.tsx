'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskora } from '@/context/TaskoraContext';
import { useAuth } from '@/context/AuthContext';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { Button } from '@/components/ui/Button';
import { Plus, Timer, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function GreetingHeader() {
  const router = useRouter();
  const { userProfile, tasks, routines, focusSessions, openTaskModal, addToast } = useTaskora();
  const { user, signOutUser } = useAuth();
  const [greeting, setGreeting] = useState('Welcome back');
  const [dateString, setDateString] = useState('');
  const [isStartingTour, setIsStartingTour] = useState(false);

  const handleStartShowcaseTour = async () => {
    if (user) {
      setIsStartingTour(true);
      const res = await signOutUser();
      setIsStartingTour(false);
      if (!res.success) {
        addToast({
          title: 'Sign Out Error',
          message: res.error || 'Failed to sign out before launching Showcase Tour.',
          type: 'error',
        });
        return;
      }
    }
    router.push('/welcome?mode=tour');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
      else if (hour >= 17 && hour < 22) setGreeting('Good evening');
      else setGreeting('Rest & recharge');

      setDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };

    updateTime();
  }, []);

  const { score, label } = AnalyticsService.calculateProductivityScore(tasks, routines, focusSessions);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E7E0D5]"
    >
      <div>
        <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{dateString || 'Today'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
          {greeting},{' '}
          <span className="text-[#718368]">
            {userProfile.name}
          </span>
        </h1>
        <p className="text-sm text-[#756E64] mt-1">
          Here is your daily productivity briefing and scheduled priorities.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Product Showcase Tour Button */}
        <button
          type="button"
          onClick={handleStartShowcaseTour}
          disabled={isStartingTour}
          className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F0EBE2] border border-[#E7E0D5] text-[#756E64] hover:text-[#403B34] transition-all text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
          title="Explore Product Showcase Tour"
        >
          {isStartingTour ? (
            <div className="w-3.5 h-3.5 border-2 border-[#718368] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-[#718368]" />
          )}
          <span>{isStartingTour ? 'Signing out...' : 'Showcase Tour'}</span>
        </button>

        {/* Productivity Score Pill */}
        <Link
          href="/analytics"
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-[#E7E0D5] hover:border-[#718368]/40 shadow-sm transition-colors group"
          title="View Productivity Analytics"
        >
          <div className="w-7 h-7 rounded-lg bg-[#EAF0E5] text-[#718368] flex items-center justify-center font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#968D81]">Score</div>
            <div className="text-xs font-bold text-[#403B34] group-hover:text-[#718368] transition-colors">
              {score}/100 • {label}
            </div>
          </div>
        </Link>

        {/* Focus Mode button */}
        <Link href="/focus">
          <Button variant="secondary" size="sm" className="hidden sm:flex">
            <Timer className="w-4 h-4 text-[#718368]" />
            <span>Focus Mode</span>
          </Button>
        </Link>

        {/* Quick Add Task */}
        <Button variant="primary" size="sm" onClick={() => openTaskModal()}>
          <Plus className="w-4 h-4" />
          <span>Quick Task</span>
        </Button>
      </div>
    </motion.div>
  );
}
