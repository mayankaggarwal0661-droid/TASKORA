'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskora } from '@/context/TaskoraContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useTaskora();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-[#557B5C] shrink-0" />,
              border: 'border-[#557B5C]/30',
              bg:     'bg-white',
              bar:    'bg-[#557B5C]',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-[#B95750] shrink-0" />,
              border: 'border-[#B95750]/30',
              bg:     'bg-white',
              bar:    'bg-[#B95750]',
            },
            warning: {
              icon: <AlertCircle className="w-5 h-5 text-[#A97535] shrink-0" />,
              border: 'border-[#A97535]/30',
              bg:     'bg-white',
              bar:    'bg-[#A97535]',
            },
            info: {
              icon: <Info className="w-5 h-5 text-[#718368] shrink-0" />,
              border: 'border-[#718368]/30',
              bg:     'bg-white',
              bar:    'bg-[#718368]',
            },
          };

          const style = typeConfig[toast.type || 'info'];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto rounded-2xl border ${style.border} glass-toast shadow-lg overflow-hidden transition-all`}
            >
              <div className={`h-0.5 w-full ${style.bar} opacity-70`} />
              <div className="flex items-start gap-3 p-4">
                {style.icon}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-semibold text-[#403B34] leading-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-xs text-[#756E64] mt-0.5 line-clamp-2">{toast.message}</p>
                  )}
                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        removeToast(toast.id);
                      }}
                      className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg bg-[#718368] hover:bg-[#5F7157] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-[#968D81] hover:text-[#403B34] p-1 rounded-md hover:bg-[#F0EBE2] transition-colors cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
