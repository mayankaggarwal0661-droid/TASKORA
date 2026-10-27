import React from 'react';
import { TaskCategory, TaskPriority } from '@/types/task';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'sage' | 'clay' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  const variantStyles = {
    default: 'bg-[#F0EBE2] text-[#756E64] border border-[#E7E0D5]',
    sage:    'bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30',
    clay:    'bg-[#F4E9DE] text-[#B88762] border border-[#B88762]/30',
    outline: 'border border-[#D9D0C3] text-[#968D81] bg-transparent',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = {
    critical: {
      label: 'Critical',
      bg: 'bg-[#F5E6E5] text-[#B95750] border-[#B95750]/30',
      dot: 'bg-[#B95750]',
    },
    high: {
      label: 'High',
      bg: 'bg-[#F4EBD9] text-[#A97535] border-[#A97535]/30',
      dot: 'bg-[#A97535]',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-[#EAF0E5] text-[#557B5C] border-[#557B5C]/30',
      dot: 'bg-[#718368]',
    },
    low: {
      label: 'Low',
      bg: 'bg-[#F0EBE2] text-[#756E64] border-[#D9D0C3]',
      dot: 'bg-[#968D81]',
    },
  };

  const item = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-medium border ${item.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TaskCategory }) {
  const config: Record<TaskCategory, { label: string; bg: string }> = {
    work:     { label: 'Work',     bg: 'bg-[#EAF0E5] text-[#557B5C] border-[#718368]/30' },
    personal: { label: 'Personal', bg: 'bg-[#F4E9DE] text-[#B88762] border-[#B88762]/30' },
    health:   { label: 'Health',   bg: 'bg-[#E8F0E9] text-[#557B5C] border-[#557B5C]/30' },
    finance:  { label: 'Finance',  bg: 'bg-[#F4EBD9] text-[#A97535] border-[#A97535]/30' },
    learning: { label: 'Learning', bg: 'bg-[#F0EBE2] text-[#756E64] border-[#D9D0C3]' },
    routine:  { label: 'Routine',  bg: 'bg-[#FBF9F5] text-[#968D81] border-[#E7E0D5]' },
  };

  const item = config[category] || config.work;

  return (
    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-medium border ${item.bg}`}>
      {item.label}
    </span>
  );
}
