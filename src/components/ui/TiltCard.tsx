'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  glow?: boolean;
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 4,
  glowColor = 'rgba(113, 131, 104, 0.12)',
  glow = true,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: -100, y: -100, opacity: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rotX);
    setRotateY(rotY);
    setSpotlightPos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setSpotlightPos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl bg-white border border-[#E7E0D5] shadow-sm transition-shadow duration-300 text-[#403B34] ${className}`}
      {...(props as any)}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      {glow && !isTouchDevice && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-0"
          style={{
            opacity: spotlightPos.opacity,
            background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${glowColor}, transparent 75%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
