'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = 'max-w-lg',
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 glass-backdrop cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className={`relative w-full ${maxWidth} glass-modal rounded-3xl border border-[#E7E0D5]/90 p-6 shadow-2xl z-10 text-[#403B34]`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                {title && (
                  <h3 className="text-xl font-bold text-[#403B34] tracking-tight">{title}</h3>
                )}
                {description && (
                  <p className="text-sm text-[#756E64] mt-1">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#968D81] hover:text-[#403B34] p-1.5 rounded-lg hover:bg-[#F0EBE2] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
