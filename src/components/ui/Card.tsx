'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  elevated?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

export function Card({ elevated = false, glow = false, className = '', children, ...props }: CardProps) {
  const baseClasses = elevated
    ? 'bg-[#FBF9F5] border border-[#D9D0C3] shadow-md text-[#403B34]'
    : 'bg-white border border-[#E7E0D5] shadow-sm text-[#403B34]';

  const glowClass = glow ? 'shadow-lg shadow-[var(--accent-glow,rgba(113,131,104,0.15))] border-[var(--accent-border,rgba(113,131,104,0.4))]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 ${baseClasses} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
