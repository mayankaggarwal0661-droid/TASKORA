'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring,rgba(113,131,104,0.4))] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
      icon: 'p-2.5 w-10 h-10',
    };

    const variantStyles = {
      primary:
        'bg-[var(--accent,#718368)] hover:bg-[var(--accent-hover,#5F7157)] active:bg-[var(--accent-hover,#4E5E47)] text-white shadow-sm border border-[var(--accent,#718368)] active:scale-[0.98]',
      secondary:
        'bg-white text-[#403B34] hover:bg-[#F0EBE2] border border-[#E7E0D5] active:bg-[#E7E0D5]',
      outline:
        'bg-transparent text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2] border border-[#D9D0C3] hover:border-[var(--accent,#718368)]',
      ghost:
        'bg-transparent text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2]',
      danger:
        'bg-[#F5E6E5] text-[#B95750] hover:bg-[#F0D0CE] border border-[#B95750]/30 active:bg-[#ECC5C2]',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.985 }}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
