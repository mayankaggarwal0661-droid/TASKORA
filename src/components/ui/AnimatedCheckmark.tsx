'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedCheckmarkProps {
  checked: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function AnimatedCheckmark({
  checked,
  size = 20,
  className = '',
  onClick,
  ariaLabel = 'Toggle completion',
}: AnimatedCheckmarkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#718368]/40 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Background base circle */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          className="transition-colors duration-200"
          stroke={checked ? 'var(--accent, #718368)' : '#D9D0C3'}
          strokeWidth="2"
          fill={checked ? 'var(--accent, #718368)' : 'transparent'}
          initial={false}
          animate={{
            scale: checked ? [1, 1.1, 1] : 1,
            fill: checked ? 'var(--accent, #718368)' : 'transparent',
            stroke: checked ? 'var(--accent, #718368)' : '#D9D0C3',
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Morphing check path with stroke-dashoffset */}
        <motion.path
          d="M7 12.5L10.5 16L17 8.5"
          fill="transparent"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
            delay: checked ? 0.05 : 0,
          }}
        />
      </svg>
    </button>
  );
}
