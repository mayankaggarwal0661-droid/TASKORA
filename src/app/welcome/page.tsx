'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  X,
  Compass,
  Lock,
  Mail,
  KeyRound,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Check,
  Layers,
  Flame,
  Headphones,
  Calendar,
  Zap,
} from 'lucide-react';
import { WelcomeHeroSceneLazy } from '@/components/welcome/WelcomeHeroSceneLazy';

type AuthMethod = 'menu' | 'email';
type EmailMode = 'signin' | 'signup' | 'forgot';

export default function WelcomePage() {
  const {
    user,
    loading,
    isSigningIn,
    error,
    clearError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signOutUser,
    continueAsGuest,
  } = useAuth();

  const router = useRouter();

  // Navigation & view modes
  const [authMethod, setAuthMethod] = useState<AuthMethod>('menu');
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [isTourMode, setIsTourMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTourMode(new URLSearchParams(window.location.search).get('mode') === 'tour');
    }
  }, []);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formValidationMsg, setFormValidationMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  // Navigate to destination on successful login
  const handleAuthSuccess = (msg?: string) => {
    if (msg) setAuthSuccessNotice(msg);
    let target = '/dashboard';
    try {
      const saved = sessionStorage.getItem('taskora_auth_redirect');
      if (saved && !['/', '/welcome', '/landing'].includes(saved)) {
        target = saved;
        sessionStorage.removeItem('taskora_auth_redirect');
      }
    } catch {}
    setTimeout(() => {
      router.push(target);
    }, msg ? 400 : 0);
  };

  // Google sign in handler
  const handleGoogleClick = async () => {
    setFormValidationMsg(null);
    setResetSuccessMsg(null);
    clearError();
    const res = await signInWithGoogle();
    if (res.success) {
      handleAuthSuccess('Welcome! Entering your workspace...');
    }
  };

  // Email sign in / sign up / password reset handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationMsg(null);
    setResetSuccessMsg(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormValidationMsg('Please enter a valid email address.');
      return;
    }

    if (emailMode === 'forgot') {
      const res = await sendPasswordReset(cleanEmail);
      if (res.success) {
        setResetSuccessMsg(`Password reset instructions have been sent to ${cleanEmail}. Check your inbox.`);
      }
      return;
    }

    if (!password || password.length < 6) {
      setFormValidationMsg('Password must be at least 6 characters long.');
      return;
    }

    if (emailMode === 'signup') {
      if (password !== confirmPassword) {
        setFormValidationMsg('Passwords do not match. Please re-type your password.');
        return;
      }
      const res = await signUpWithEmail(cleanEmail, password, displayName.trim());
      if (res.success) {
        handleAuthSuccess('Account created! Entering workspace...');
      }
    } else {
      const res = await signInWithEmail(cleanEmail, password);
      if (res.success) {
        handleAuthSuccess('Signed in! Entering workspace...');
      }
    }
  };

  // Switch account action (signs out current user and reveals choice menu)
  const handleSwitchAccount = async () => {
    setFormValidationMsg(null);
    setResetSuccessMsg(null);
    clearError();
    await signOutUser();
    setAuthMethod('menu');
  };

  // Back to main options list
  const handleBackToMenu = () => {
    setAuthMethod('menu');
    setFormValidationMsg(null);
    setResetSuccessMsg(null);
    clearError();
  };

  // Smooth scroll to authentication console
  const scrollToAuth = () => {
    const card = document.getElementById('auth-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Subtle pulse highlight
      card.classList.add('ring-2', 'ring-[#718368]/40');
      setTimeout(() => {
        card.classList.remove('ring-2', 'ring-[#718368]/40');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#403B34] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#718368]/20">
      {/* ─── Layer 1 & 2: Atmospheric Ambient Background Glows ──────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Sage Top-Left Radial Glow */}
        <div className="absolute -top-40 -left-20 w-[680px] h-[550px] bg-[#EAF0E5]/80 rounded-full blur-[140px]" />
        {/* Warm Ivory / Peach Bottom-Right Ambient */}
        <div className="absolute top-1/3 -right-32 w-[620px] h-[600px] bg-[#F4E9DE]/75 rounded-full blur-[150px]" />
        {/* Subtle Central Accent Lighting */}
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[450px] bg-[#718368]/10 rounded-full blur-[130px]" />
      </div>

      {/* ─── Navigation Header ──────────────────────────────────────────────── */}
      <header className="relative z-20 px-6 sm:px-12 py-5 sm:py-6 flex items-center justify-between border-b border-[#E7E0D5]/50 backdrop-blur-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#718368] flex items-center justify-center text-white shadow-sm group-hover:bg-[#5F7157] group-hover:scale-105 transition-all duration-300">
            <Leaf className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#403B34] leading-tight">Taskora</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#756E64]/80">Ecosystem</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#756E64] hover:text-[#403B34] px-3.5 py-2 rounded-xl hover:bg-[#F0EBE2] border border-transparent hover:border-[#E7E0D5] transition-all duration-200"
          >
            <Compass className="w-4 h-4 text-[#718368]" />
            <span className="hidden sm:inline">Product Tour</span>
            <span className="sm:hidden">Tour</span>
          </Link>

          <button
            type="button"
            onClick={continueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#403B34] bg-white hover:bg-[#FBF9F5] px-3.5 py-2 rounded-xl border border-[#D9D0C3] hover:border-[#718368] shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
          >
            <span>Guest Access</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#718368]" />
          </button>
        </div>
      </header>

      {/* ─── Hero Section: Split Composition ────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ── LEFT COLUMN: Brand Manifesto, Value Prop & Direct CTAs ──────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Ambient Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 text-xs font-semibold mb-6 shadow-2xs w-fit">
              <span className="w-2 h-2 rounded-full bg-[#718368] animate-pulse" />
              <span>A Calm, Living Productivity Universe</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#403B34] tracking-tight leading-[1.12]">
              Your day, with{' '}
              <span className="text-[#718368] italic font-serif relative inline-block">
                more intention.
                <span className="absolute bottom-1.5 left-0 w-full h-[3px] bg-[#718368]/25 rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#756E64] mt-5 sm:mt-6 leading-relaxed max-w-2xl font-normal">
              Bring tasks, habits, and focused work together in one serene workspace. Plan with clarity, sustain momentum, and protect your deepest attention without artificial friction.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none">
              <button
                type="button"
                onClick={scrollToAuth}
                className="px-7 py-3.5 rounded-2xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-sm shadow-md hover:shadow-lg shadow-[#718368]/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]"
              >
                <span>Get Started — It&apos;s Free</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={continueAsGuest}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FBF9F5] border border-[#D9D0C3] hover:border-[#718368] text-[#403B34] font-semibold text-sm shadow-2xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Explore as Guest</span>
                <Compass className="w-4 h-4 text-[#756E64]" />
              </button>
            </div>

            {/* 3 Compact Benefit Badges */}
            <div className="mt-10 sm:mt-12 pt-8 border-t border-[#E7E0D5]/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#718368]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#403B34]">Plan with clarity</h2>
                  <p className="text-[11px] text-[#756E64] mt-0.5 leading-snug">Priority matrix &amp; adaptive daily agendas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#718368]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#403B34]">Build lasting habits</h2>
                  <p className="text-[11px] text-[#756E64] mt-0.5 leading-snug">Streak loops with zero anxiety</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4 text-[#718368]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#403B34]">Focus deeply</h2>
                  <p className="text-[11px] text-[#756E64] mt-0.5 leading-snug">Calibrated Pomodoro &amp; ambient audio</p>
                </div>
              </div>
            </div>

            {/* Zero Friction Trust Pill */}
            <div className="mt-6 flex items-center gap-2 text-[11px] text-[#968D81]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#718368]" />
              <span>Private &amp; UID-isolated • No credit card required • Instant access</span>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Three.js 3D Universe + Integrated Auth Console ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative w-full"
          >
            {/* Layer 5: Three.js Interactive Hero 3D Sculpture */}
            <div className="absolute -top-12 -bottom-12 -left-12 -right-12 pointer-events-none z-0 opacity-90 sm:opacity-100 overflow-hidden">
              <WelcomeHeroSceneLazy />
            </div>

            {/* Layer 6: Integrated Authentication Console Card */}
            <div
              id="auth-card"
              className="relative z-10 w-full max-w-md bg-white/88 backdrop-blur-xl rounded-3xl border border-[#E7E0D5]/90 p-7 sm:p-9 shadow-2xl shadow-[#403B34]/6 transition-all duration-300"
            >
              {/* Subtle Top Accent Accent Bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#718368] rounded-full opacity-80" />

              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 text-[11px] font-semibold mb-2.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#718368]" />
                  <span>{isTourMode ? 'Product Showcase & Tour' : 'Personal Productivity Hub'}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-[#403B34] tracking-tight">
                  {isTourMode ? 'Experience Taskora' : 'Welcome to Taskora'}
                </h2>
                <p className="text-xs text-[#756E64] mt-1.5 leading-relaxed">
                  {isTourMode
                    ? 'Explore our serene workspace as a guest, or connect your account to save streaks.'
                    : 'Sign in to access your synchronized agenda, habits, and focus logs.'}
                </p>
              </div>

              {/* Success Notice / Notification */}
              {authSuccessNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-2xl bg-[#EAF0E5] border border-[#718368]/30 text-xs flex items-center gap-2 text-[#557B5C]"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#718368]" />
                  <span className="font-semibold">{authSuccessNotice}</span>
                </motion.div>
              )}

              {/* Error Notice */}
              {(error || formValidationMsg || resetSuccessMsg) && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-5 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-2xs ${
                    resetSuccessMsg
                      ? 'bg-[#EAF0E5] border-[#718368]/30 text-[#557B5C]'
                      : 'bg-[#F5E6E5] border-[#B95750]/30 text-[#B95750]'
                  }`}
                >
                  {resetSuccessMsg ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#718368]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="font-semibold leading-tight">{resetSuccessMsg ? 'Password Reset' : 'Notice'}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#403B34]/80">
                      {resetSuccessMsg || formValidationMsg || error}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setFormValidationMsg(null);
                      setResetSuccessMsg(null);
                    }}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      resetSuccessMsg ? 'hover:bg-[#718368]/10' : 'hover:bg-[#B95750]/10'
                    }`}
                    aria-label="Dismiss notice"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* Active Firebase Session Card (shown when an authenticated session already exists) */}
              {!loading && user && authMethod === 'menu' && (
                <div className="mb-5 p-4 rounded-2xl bg-[#FBF9F5] border border-[#E7E0D5] shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-[#718368]" />
                      <span>Active Session Detected</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#968D81] tracking-wider font-mono">
                      {user.provider}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#718368] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-[#403B34] truncate block">
                        {user.displayName || 'Taskora Member'}
                      </span>
                      <span className="text-[11px] text-[#756E64] block truncate font-mono">
                        {user.email || user.phoneNumber || user.uid}
                      </span>
                    </div>
                  </div>

                  {/* Actions for current account */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span>Continue as {user.displayName?.split(' ')[0] || user.displayName || 'Current Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleSwitchAccount}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-[#F0EBE2] border border-[#D9D0C3] text-[#403B34] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#718368]" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => signOutUser()}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-[#F5E6E5] border border-[#D9D0C3] text-[#B95750] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 1: Main Sign-In Choices */}
              {authMethod === 'menu' && (
                <div className="space-y-3">
                  {!loading && user && (
                    <div className="relative flex items-center justify-center my-3">
                      <div className="border-t border-[#E7E0D5] w-full" />
                      <span className="bg-white/90 px-3 text-[10px] font-medium text-[#968D81] tracking-wider relative">
                        Or sign in with another account
                      </span>
                    </div>
                  )}

                  {/* Option 1: Continue with Google */}
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={handleGoogleClick}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FBF9F5] border border-[#D9D0C3] hover:border-[#718368] text-[#403B34] font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
                  >
                    {isSigningIn ? (
                      <div className="w-4 h-4 border-2 border-[#718368] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    )}
                    <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
                  </button>

                  {/* Option 2: Sign in with Email and Password */}
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={() => {
                      clearError();
                      setFormValidationMsg(null);
                      setResetSuccessMsg(null);
                      setEmailMode('signin');
                      setAuthMethod('email');
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FBF9F5] border border-[#D9D0C3] hover:border-[#718368] text-[#403B34] font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
                  >
                    <Mail className="w-4 h-4 text-[#718368] shrink-0" />
                    <span>Sign in with Email and Password</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-[#E7E0D5] w-full" />
                    <span className="bg-white/90 px-3 text-[10px] font-medium text-[#968D81] uppercase tracking-wider relative">
                      or
                    </span>
                  </div>

                  {/* Guest Session Action */}
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="w-full py-3 px-4 rounded-2xl bg-[#F0EBE2] hover:bg-[#E7E0D5] border border-[#D9D0C3] text-[#403B34] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    <span>Explore Workspace as Guest</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#756E64]" />
                  </button>
                </div>
              )}

              {/* VIEW 2: Email Authentication Form */}
              <AnimatePresence mode="wait">
                {authMethod === 'email' && (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Mode switcher tabs (hidden when in forgot mode) */}
                    {emailMode !== 'forgot' ? (
                      <div className="flex rounded-xl bg-[#F0EBE2] p-1 border border-[#E7E0D5] text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMode('signin');
                            setFormValidationMsg(null);
                            setResetSuccessMsg(null);
                            clearError();
                          }}
                          className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                            emailMode === 'signin'
                              ? 'bg-white text-[#403B34] shadow-2xs'
                              : 'text-[#756E64] hover:text-[#403B34]'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailMode('signup');
                            setFormValidationMsg(null);
                            setResetSuccessMsg(null);
                            clearError();
                          }}
                          className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                            emailMode === 'signup'
                              ? 'bg-white text-[#403B34] shadow-2xs'
                              : 'text-[#756E64] hover:text-[#403B34]'
                          }`}
                        >
                          Create Account
                        </button>
                      </div>
                    ) : (
                      <div className="text-left pb-1">
                        <h3 className="text-sm font-bold text-[#403B34]">Reset your password</h3>
                        <p className="text-[11px] text-[#756E64] mt-0.5">
                          Enter your registered email and we will send a password reset link.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      {/* Display Name on Sign Up */}
                      {emailMode === 'signup' && (
                        <div className="relative">
                          <User className="w-4 h-4 text-[#968D81] absolute left-3 top-3" />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Full Name"
                            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#D9D0C3] focus:border-[#718368] focus:ring-1 focus:ring-[#718368] outline-none bg-white text-[#403B34]"
                          />
                        </div>
                      )}

                      {/* Email Input */}
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#968D81] absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address (e.g. alex@example.com)"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#D9D0C3] focus:border-[#718368] focus:ring-1 focus:ring-[#718368] outline-none bg-white text-[#403B34]"
                        />
                      </div>

                      {/* Password Input */}
                      {emailMode !== 'forgot' && (
                        <div>
                          <div className="relative">
                            <KeyRound className="w-4 h-4 text-[#968D81] absolute left-3 top-3" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={emailMode === 'signup' ? 'Password (min. 6 characters)' : 'Password'}
                              className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-[#D9D0C3] focus:border-[#718368] focus:ring-1 focus:ring-[#718368] outline-none bg-white text-[#403B34]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-[#968D81] hover:text-[#403B34] p-0.5 cursor-pointer"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Forgot password trigger */}
                          {emailMode === 'signin' && (
                            <div className="text-right mt-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailMode('forgot');
                                  setFormValidationMsg(null);
                                  setResetSuccessMsg(null);
                                  clearError();
                                }}
                                className="text-[11px] text-[#718368] hover:text-[#5F7157] font-medium transition-colors cursor-pointer"
                              >
                                Forgot password?
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Confirm Password on Sign Up */}
                      {emailMode === 'signup' && (
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#968D81] absolute left-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#D9D0C3] focus:border-[#718368] focus:ring-1 focus:ring-[#718368] outline-none bg-white text-[#403B34]"
                          />
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full py-3 px-4 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                      >
                        {isSigningIn ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>
                          {isSigningIn
                            ? emailMode === 'signup'
                              ? 'Creating Account...'
                              : emailMode === 'forgot'
                              ? 'Sending Reset Link...'
                              : 'Signing In...'
                            : emailMode === 'signup'
                            ? 'Create Taskora Account'
                            : emailMode === 'forgot'
                            ? 'Send Password Reset Link'
                            : 'Sign In with Email'}
                        </span>
                      </button>

                      {/* Back to sign in from forgot password */}
                      {emailMode === 'forgot' && (
                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEmailMode('signin');
                              setFormValidationMsg(null);
                              setResetSuccessMsg(null);
                              clearError();
                            }}
                            className="text-xs text-[#718368] hover:text-[#5F7157] font-semibold cursor-pointer"
                          >
                            Remember your password? Sign in
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Back to menu button */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleBackToMenu}
                        className="text-xs text-[#756E64] hover:text-[#403B34] font-medium underline underline-offset-4 cursor-pointer"
                      >
                        ← Back to sign-in choices
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy & Security Footnote */}
              <div className="mt-6 pt-5 border-t border-[#E7E0D5]/70 flex items-center justify-center gap-3 text-[11px] text-[#968D81]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#718368]" />
                  End-to-End Encrypted Session
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#718368]" />
                  Private &amp; Scoped by UID
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Feature Showcase Section (Below Hero) ────────────────────────── */}
        <section className="mt-24 sm:mt-32 pt-16 border-t border-[#E7E0D5]/80">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#718368] block mb-2">
              The Taskora Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#403B34] tracking-tight">
              Crafted for deep work, not endless lists.
            </h2>
            <p className="text-sm text-[#756E64] mt-3 leading-relaxed">
              Three foundational pillars designed to eliminate mental clutter, foster lasting consistency, and protect your focused attention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Intelligent Living Agenda */}
            <div className="p-7 rounded-3xl bg-white/70 border border-[#E7E0D5]/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-[#718368]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6 text-[#718368]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#718368] block mb-1">
                  Task Management
                </span>
                <h3 className="text-lg font-bold text-[#403B34] tracking-tight mb-2">
                  Organize with intention
                </h3>
                <p className="text-xs text-[#756E64] leading-relaxed mb-4">
                  Prioritize high-impact work using dynamic tags, priority quadrants, and natural scheduling that effortlessly adapts to your workday rhythm.
                </p>
              </div>
              <ul className="text-xs text-[#403B34] space-y-2 pt-4 border-t border-[#E7E0D5]/60 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Priority-weighted matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Interactive day planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Fluid drag-and-drop workflow</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Resilient Habit Engine */}
            <div className="p-7 rounded-3xl bg-white/70 border border-[#E7E0D5]/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-[#718368]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 text-[#718368]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#718368] block mb-1">
                  Habits &amp; Routines
                </span>
                <h3 className="text-lg font-bold text-[#403B34] tracking-tight mb-2">
                  Build momentum that lasts
                </h3>
                <p className="text-xs text-[#756E64] leading-relaxed mb-4">
                  Anchor your day with morning and evening rituals. Celebrate incremental progress with visual streak tracking designed without punishing friction.
                </p>
              </div>
              <ul className="text-xs text-[#403B34] space-y-2 pt-4 border-t border-[#E7E0D5]/60 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Morning &amp; evening ritual loops</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Resilient streak retention</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Milestone progress celebrations</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Deep Focus Sanctuary */}
            <div className="p-7 rounded-3xl bg-white/70 border border-[#E7E0D5]/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-[#718368]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#557B5C] flex items-center justify-center shadow-2xs mb-5 group-hover:scale-105 transition-transform">
                  <Headphones className="w-6 h-6 text-[#718368]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#718368] block mb-1">
                  Flow State
                </span>
                <h3 className="text-lg font-bold text-[#403B34] tracking-tight mb-2">
                  Calm, uninterrupted focus
                </h3>
                <p className="text-xs text-[#756E64] leading-relaxed mb-4">
                  Lock into productive flow with scientific Pomodoro intervals paired with calibrated ambient soundscapes like gentle rainfall and forest breezes.
                </p>
              </div>
              <ul className="text-xs text-[#403B34] space-y-2 pt-4 border-t border-[#E7E0D5]/60 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Customizable work &amp; break timers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Built-in rain &amp; nature audio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                  <span>Fullscreen minimalist Zen mode</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Conversion Prompt */}
          <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-[#EAF0E5]/60 border border-[#718368]/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#403B34]">Ready to experience intentional productivity?</h3>
              <p className="text-xs sm:text-sm text-[#756E64] mt-1">
                Join thousands building calm, disciplined habits without burnout.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={scrollToAuth}
                className="px-6 py-3 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={continueAsGuest}
                className="px-5 py-3 rounded-xl bg-white hover:bg-[#FBF9F5] border border-[#D9D0C3] text-[#403B34] font-semibold text-xs transition-all cursor-pointer"
              >
                <span>Launch Guest Tour</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 sm:px-12 py-6 border-t border-[#E7E0D5]/70 text-center text-xs text-[#968D81] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#718368]" />
          <span>Taskora — Smart Productivity, Habits &amp; Reminder Ecosystem © 2026</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>End-to-End Encrypted</span>
          <span>•</span>
          <span>Private by Design</span>
          <span>•</span>
          <span>Zero Telemetry Clutter</span>
        </div>
      </footer>
    </div>
  );
}
