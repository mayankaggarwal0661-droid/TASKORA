'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function DecorativeParallax() {
  const { scrollY } = useScroll();

  // Subtle parallax speeds for depth layers
  const yLayer1 = useTransform(scrollY, [0, 1200], [0, -90]);
  const yLayer2 = useTransform(scrollY, [0, 1200], [0, -170]);
  const yLayer3 = useTransform(scrollY, [0, 1200], [0, -50]);
  const rotateLayer = useTransform(scrollY, [0, 1200], [0, 35]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 1: Ambient Orbital Vector Rings */}
      <motion.div
        style={{ y: yLayer1 }}
        className="absolute top-28 left-[4%] opacity-25 sm:opacity-35"
      >
        <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="#718368"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            stroke="#B88762"
            strokeWidth="0.85"
          />
          <circle cx="100" cy="20" r="3" fill="#718368" />
          <circle cx="180" cy="100" r="2.5" fill="#B88762" />
          <line x1="90" y1="100" x2="110" y2="100" stroke="#718368" strokeWidth="1" />
          <line x1="100" y1="90" x2="100" y2="110" stroke="#718368" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Layer 2: Precision Geometric Hex Prism (Right side) */}
      <motion.div
        style={{ y: yLayer2, rotate: rotateLayer }}
        className="absolute top-52 right-[5%] opacity-20 sm:opacity-35"
      >
        <svg width="180" height="180" viewBox="0 0 160 160" fill="none">
          <polygon
            points="80,15 140,50 140,110 80,145 20,110 20,50"
            stroke="#718368"
            strokeWidth="1.2"
          />
          <polygon
            points="80,35 120,60 120,100 80,125 40,100 40,60"
            stroke="#D9D0C3"
            strokeWidth="0.8"
            strokeDasharray="3 5"
          />
          <circle cx="80" cy="80" r="4" fill="#B88762" />
        </svg>
      </motion.div>

      {/* Layer 3: Tech Crosshairs & Vector Accent Nodes (Mid) */}
      <motion.div
        style={{ y: yLayer3 }}
        className="absolute top-[720px] left-[7%] opacity-30"
      >
        <svg width="140" height="140" viewBox="0 0 120 120" fill="none">
          {/* Target Reticle */}
          <circle cx="60" cy="60" r="40" stroke="#718368" strokeWidth="0.85" />
          <line x1="10" y1="60" x2="110" y2="60" stroke="#718368" strokeWidth="0.6" strokeDasharray="2 4" />
          <line x1="60" y1="10" x2="60" y2="110" stroke="#718368" strokeWidth="0.6" strokeDasharray="2 4" />
          {/* Corner tick marks */}
          <path d="M 20 30 L 20 20 L 30 20" stroke="#B88762" strokeWidth="1.5" />
          <path d="M 100 30 L 100 20 L 90 20" stroke="#B88762" strokeWidth="1.5" />
          <path d="M 20 90 L 20 100 L 30 100" stroke="#B88762" strokeWidth="1.5" />
          <path d="M 100 90 L 100 100 L 90 100" stroke="#B88762" strokeWidth="1.5" />
        </svg>
      </motion.div>

      {/* Layer 4: Deep Story Section Vector Connector */}
      <motion.div
        style={{ y: yLayer1 }}
        className="absolute top-[1480px] right-[8%] opacity-25"
      >
        <svg width="200" height="200" viewBox="0 0 180 180" fill="none">
          <rect
            x="20"
            y="20"
            width="140"
            height="140"
            rx="28"
            stroke="#718368"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <circle cx="90" cy="90" r="28" stroke="#B88762" strokeWidth="1" />
          <path d="M 90 62 L 90 118" stroke="#D9D0C3" strokeWidth="1" />
          <path d="M 62 90 L 118 90" stroke="#D9D0C3" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
}
