'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Signature subtle page transition: fade + 10px vertical ease
 * Fast (220ms), zero layout shift, respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
