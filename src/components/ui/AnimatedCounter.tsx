'use client';

import React, { useEffect, useState, useRef } from 'react';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 600,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // If reduced motion is requested, snap immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const diff = value - startValue;
    if (diff === 0) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(startValue + diff * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
