'use client';

import React from 'react';
import { Leaf, Sprout } from 'lucide-react';
import { MomentumGarden } from '@/components/garden/MomentumGarden';

export default function GardenPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#E7E0D5]">
        <div className="flex items-center gap-2 text-[#718368] text-xs font-semibold uppercase tracking-wider mb-1">
          <Sprout className="w-3.5 h-3.5" />
          <span>Progress Visualization</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#403B34] tracking-tight">
          Momentum Garden
        </h1>
        <p className="text-sm text-[#756E64] mt-1">
          A living botanical reflection of your real progress — tasks, focus, and habits — not gamification.
        </p>
      </div>

      {/* Garden Panel */}
      <MomentumGarden compact={false} />

      {/* Explanation Section */}
      <div className="rounded-2xl bg-[#F7F4EE] border border-[#E7E0D5] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-4.5 h-4.5 text-[#718368] shrink-0" />
          <h2 className="text-base font-bold text-[#403B34]">How your garden grows</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0E5] flex items-center justify-center">
              <span className="text-base">🌿</span>
            </div>
            <h3 className="text-sm font-bold text-[#403B34]">Sweet Meadow Sage</h3>
            <p className="text-xs text-[#756E64] leading-relaxed">
              Grows with every completed task. Completing 10 tasks brings it to full maturity. Each delivery nourishes its aromatic silver-green foliage.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4EBD9] flex items-center justify-center">
              <span className="text-base">🫒</span>
            </div>
            <h3 className="text-sm font-bold text-[#403B34]">Heritage Olive Bonsai</h3>
            <p className="text-xs text-[#756E64] leading-relaxed">
              Rooted in sustained focus. Reaching 120 logged Pomodoro minutes brings the bonsai to full bloom. Deep work strengthens the woody trunk.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5E6E5] flex items-center justify-center">
              <span className="text-base">🌺</span>
            </div>
            <h3 className="text-sm font-bold text-[#403B34]">Golden Desert Bloom</h3>
            <p className="text-xs text-[#756E64] leading-relaxed">
              Blooms through habit consistency. 15 cumulative routine streak days unlock warm amber blossoms. Never reset — past growth stays permanent.
            </p>
          </div>
        </div>
        <p className="text-xs text-[#968D81] italic pt-2 border-t border-[#E7E0D5]">
          Growth is based only on events your app actually recorded. Missing a day does not remove prior growth. There are no artificial multipliers or coins.
        </p>
      </div>
    </div>
  );
}
