'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WelcomeHeroSceneDynamic = dynamic(
  () => import('./WelcomeHeroScene').then((mod) => mod.WelcomeHeroScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] flex items-center justify-center relative select-none pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#EAF0E5]/60 to-[#F4E9DE]/50 blur-3xl opacity-70 animate-pulse" />
      </div>
    ),
  }
);

interface WelcomeHeroSceneLazyProps {
  className?: string;
}

export function WelcomeHeroSceneLazy({ className = '' }: WelcomeHeroSceneLazyProps) {
  return <WelcomeHeroSceneDynamic className={className} />;
}
