'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  gradientId?: string;
  startColor?: string;
  endColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  gradientId = 'progress-gradient',
  startColor = 'var(--accent, #718368)',
  endColor = 'var(--accent-hover, #557B5C)',
  children,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E7E0D5"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic progress stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* Centered label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children || (
          <span className="text-xl font-bold text-[#403B34] tracking-tight">
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </div>
  );
}
