'use client';

import React from 'react';
import dynamic from 'next/dynamic';

function StaticOrbFallback() {
  return (
    <div className="w-full h-80 sm:h-96 md:h-[420px] flex items-center justify-center relative select-none pointer-events-none">
      {/* Background ambient radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-purple-400/25 blur-3xl animate-pulse" />
      
      {/* Translucent SVG Glass Orb Structure */}
      <svg
        width={260}
        height={260}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_35px_rgba(139,92,246,0.35)]"
      >
        <defs>
          <radialGradient id="orbGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#557B5C" stopOpacity="0.8" />
          </radialGradient>
          <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer orbital rings */}
        <ellipse
          cx="100"
          cy="100"
          rx="90"
          ry="35"
          stroke="url(#ringGrad1)"
          strokeWidth="1.5"
          transform="rotate(-25 100 100)"
          strokeDasharray="4 6"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="82"
          ry="30"
          stroke="rgba(196, 181, 253, 0.4)"
          strokeWidth="1"
          transform="rotate(35 100 100)"
        />

        {/* Main translucent glass sphere */}
        <circle cx="100" cy="100" r="56" fill="url(#orbGrad)" />
        <circle
          cx="100"
          cy="100"
          r="56"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1.5"
        />

        {/* Inner geometric core lattice */}
        <polygon
          points="100,56 138,82 138,118 100,144 62,118 62,82"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />
        <line x1="100" y1="56" x2="100" y2="144" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />
        <line x1="62" y1="82" x2="138" y2="118" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />
        <line x1="62" y1="118" x2="138" y2="82" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />

        {/* Specular light highlight reflection */}
        <ellipse cx="82" cy="74" rx="14" ry="7" fill="rgba(255, 255, 255, 0.65)" transform="rotate(-30 82 74)" />
      </svg>
    </div>
  );
}

// Lazy-load the Three.js 3D WebGL Orb without SSR
const DynamicHeroOrb = dynamic(
  () => import('./Hero3DOrb').then(mod => mod.Hero3DOrb),
  {
    ssr: false,
    loading: () => <StaticOrbFallback />,
  }
);

export function Hero3DOrbLazy() {
  return <DynamicHeroOrb />;
}
