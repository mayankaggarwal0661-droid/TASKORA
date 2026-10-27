'use client';

import { useState, useEffect, useRef } from 'react';

interface UseScrollDirectionOptions {
  thresholdDown?: number;
  thresholdUp?: number;
  topOffset?: number;
}

/**
 * Smart direction-aware scroll tracker with hysteresis and reduced-motion detection.
 * Hides headers on downward scroll beyond threshold, reveals immediately on upward scroll,
 * and maintains visibility at the top of the page.
 */
export function useScrollDirection({
  thresholdDown = 10,
  thresholdUp = 6,
  topOffset = 24,
}: UseScrollDirectionOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const lastScrollYRef = useRef(0);
  const isTickingRef = useRef(false);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) setIsVisible(true);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    const updateScrollDirection = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const deltaY = currentScrollY - lastScrollYRef.current;

      setScrollY(currentScrollY);

      if (prefersReducedMotionRef.current) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        isTickingRef.current = false;
        return;
      }

      // Always visible at the top of page
      if (currentScrollY <= topOffset) {
        setIsVisible(true);
      }
      // Scrolling down past threshold
      else if (deltaY > thresholdDown && currentScrollY > 70) {
        setIsVisible(false);
      }
      // Scrolling up even slightly past upward noise threshold
      else if (deltaY < -thresholdUp) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
      isTickingRef.current = false;
    };

    const onScroll = () => {
      if (!isTickingRef.current) {
        window.requestAnimationFrame(updateScrollDirection);
        isTickingRef.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [thresholdDown, thresholdUp, topOffset]);

  return { isVisible, scrollY };
}
