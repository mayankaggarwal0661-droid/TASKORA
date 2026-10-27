'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { soundService } from '@/features/audio/sound-service';
import {
  Lock,
  Sparkles,
  ArrowRight,
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export function GuestLockModal() {
  const { guestLock, closeGuestLock, signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  if (!guestLock.isOpen) return null;

  const handleGoogle = async () => {
    setIsSigningIn(true);
    soundService.playClick();
    const res = await signInWithGoogle();
    setIsSigningIn(false);
    if (res.success) {
      closeGuestLock();
    }
  };

  const handleEmailRedirect = () => {
    soundService.playClick();
    closeGuestLock();
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('taskora_auth_redirect', window.location.pathname);
      }
    } catch {}
    router.push('/welcome');
  };

  const featureTitle = guestLock.featureName || 'Make this progress yours';
  const benefitText =
    guestLock.benefitDescription ||
    'Sign in with Google or Email to unlock permanent cloud sync, unlimited tasks, habit streaks, and access across all your devices.';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-lock-title"
      >
        {/* Soft Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            soundService.playClick();
            closeGuestLock();
          }}
          className="fixed inset-0 bg-[#403B34]/30 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-[#E7E0D5] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#403B34] z-10 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#718368]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#B88762]/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              closeGuestLock();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#968D81] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header & Icon */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 350, damping: 20 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#718368] to-[#8FA585] text-white flex items-center justify-center shadow-md mb-4 relative"
            >
              <Lock className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C49746] flex items-center justify-center shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.div>

            <span className="text-[11px] font-bold tracking-wider uppercase text-[#718368] bg-[#EAF0E5] px-2.5 py-0.5 rounded-full border border-[#718368]/20 mb-2">
              Free Account Feature
            </span>

            <h2 id="guest-lock-title" className="text-xl sm:text-2xl font-bold tracking-tight text-[#403B34]">
              {featureTitle}
            </h2>

            <p className="text-xs sm:text-sm text-[#756E64] mt-2 leading-relaxed">
              {benefitText}
            </p>
          </div>

          {/* Core Benefits Checklist */}
          <div className="my-5 p-3.5 rounded-2xl bg-[#F7F4EE] border border-[#E7E0D5]/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#403B34]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#718368] shrink-0" />
              <span>Preserve all current temporary tasks upon sign-in</span>
            </div>
            <div className="flex items-center gap-2 text-[#403B34]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#718368] shrink-0" />
              <span>Full habit tracking streaks &amp; deep focus history</span>
            </div>
            <div className="flex items-center gap-2 text-[#403B34]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#718368] shrink-0" />
              <span>Synced across all your phones, tablets &amp; laptops</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={isSigningIn}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-[#FBF9F5] text-[#403B34] border border-[#D9D0C3] hover:border-[#718368] shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Email / Password Sign In */}
            <button
              type="button"
              onClick={handleEmailRedirect}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-[#718368] hover:bg-[#5F7157] text-white shadow-sm transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Sign in with Email &amp; Password</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Dismiss return to guest */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                closeGuestLock();
              }}
              className="text-xs font-medium text-[#968D81] hover:text-[#403B34] transition-colors cursor-pointer underline decoration-[#D9D0C3] underline-offset-4"
            >
              Continue exploring as guest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
