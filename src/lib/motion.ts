import { Variants, Transition } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Standard motion tokens for Taskora (Warm Neutral system)
 */
export const MOTION_TRANSITIONS = {
  micro: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } as Transition,
  short: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as Transition,
  standard: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } as Transition,
  layout: { duration: 0.36, ease: [0.16, 1, 0.3, 1] } as Transition,
  springSnappy: { type: 'spring', stiffness: 350, damping: 28 } as Transition,
  springGentle: { type: 'spring', stiffness: 220, damping: 24 } as Transition,
  springBouncy: { type: 'spring', stiffness: 420, damping: 22 } as Transition,
};

export const FADE_IN_UP: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: MOTION_TRANSITIONS.standard },
  exit: { opacity: 0, y: -12, transition: MOTION_TRANSITIONS.short },
};

export const FADE_IN_DOWN: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: MOTION_TRANSITIONS.standard },
  exit: { opacity: 0, y: 12, transition: MOTION_TRANSITIONS.short },
};

export const FADE_IN_SCALE: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: MOTION_TRANSITIONS.springSnappy },
  exit: { opacity: 0, scale: 0.95, transition: MOTION_TRANSITIONS.short },
};

export const SLIDE_IN_RIGHT: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: MOTION_TRANSITIONS.standard },
  exit: { opacity: 0, x: 24, transition: MOTION_TRANSITIONS.short },
};

export const STAGGER_CONTAINER: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const STAGGER_ITEM: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITIONS.springSnappy,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: MOTION_TRANSITIONS.short,
  },
};

export const CARD_HOVER_SPRING = {
  scale: 1.015,
  y: -2,
  transition: { type: 'spring', stiffness: 400, damping: 25 },
};

export const BUTTON_TAP_SPRING = {
  scale: 0.97,
  transition: { type: 'spring', stiffness: 600, damping: 30 },
};

/**
 * Trigger celebratory confetti burst on task or streak completion
 * Uses the Warm Neutral palette (sage green, sienna clay, sunset amber, olive, cream)
 */
export function triggerCelebration(originX = 0.5, originY = 0.6) {
  if (typeof window === 'undefined') return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  confetti({
    particleCount: 50,
    spread: 65,
    origin: { x: originX, y: originY },
    colors: ['#718368', '#557B5C', '#B88762', '#A97535', '#C49746', '#D9D0C3', '#EAF0E5'],
    ticks: 140,
    gravity: 1.15,
    scalar: 0.92,
    disableForReducedMotion: true,
  });
}
