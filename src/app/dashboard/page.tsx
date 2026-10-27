import React from 'react';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { NotificationStatusBanner } from '@/components/dashboard/NotificationStatusBanner';
import { QuickStatsBar } from '@/components/dashboard/QuickStatsBar';
import { NextUpCard } from '@/components/dashboard/NextUpCard';
import { CompletionRingCard } from '@/components/dashboard/CompletionRingCard';
import { WeeklyActivityChart } from '@/components/dashboard/WeeklyActivityChart';
import { TodayTaskList } from '@/components/dashboard/TodayTaskList';
import { RealityEngineWidget } from '@/components/reality/RealityEngineWidget';
import { MomentumGarden } from '@/components/garden/MomentumGarden';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header greeting & quick actions */}
      <GreetingHeader />

      {/* 2. Notification Permission / Status Alert */}
      <NotificationStatusBanner />

      {/* 3. Hero Quick Stats 4-Card Bar */}
      <QuickStatsBar />

      {/* 4. Next Up Spotlight Card with Countdown */}
      <NextUpCard />

      {/* 5. Metrics Grid: Daily Completion Ring + Weekly Activity Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionRingCard />
        <WeeklyActivityChart />
      </div>

      {/* 6. Signature Features: Reality Engine Workload + Momentum Garden side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reality Engine Widget */}
        <RealityEngineWidget />

        {/* Momentum Garden — compact card on dashboard */}
        <MomentumGarden compact={true} />
      </div>

      {/* 7. Today's Full Task List with Tabs for Today, Overdue, and Upcoming */}
      <TodayTaskList />
    </div>
  );
}
