'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
}

export function SplitText({
  text,
  className = '',
  highlightWords = [],
  highlightClassName = 'text-[#718368]',
  delay = 0.1,
}: SplitTextProps) {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 24,
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block flex-wrap ${className}`}
    >
      {words.map((word, index) => {
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
        const isHighlighted = highlightWords.some(hw => hw.toLowerCase() === cleanWord.toLowerCase());

        return (
          <motion.span
            key={`${word}-${index}`}
            variants={wordVariants}
            className={`inline-block mr-[0.25em] last:mr-0 ${
              isHighlighted ? highlightClassName : ''
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}
