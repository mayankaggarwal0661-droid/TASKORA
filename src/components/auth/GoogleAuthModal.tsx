'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Info,
  Server,
  Trash2,
  LogOut,
} from 'lucide-react';
import { getFirebaseConfig } from '@/features/auth/firebase-config';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const router = useRouter();
  const { user, signInWithGoogle, signOutUser, saveFirebaseConfig, resetFirebaseConfig, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'auth' | 'firebase'>('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firebase manual config form state
  const existingConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(existingConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(existingConfig.authDomain || 'taskora-web-3ba35.firebaseapp.com');
  const [projectId, setProjectId] = useState(existingConfig.projectId || 'taskora-web-3ba35');
  const [appId, setAppId] = useState(existingConfig.appId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (res.success) {
      onClose();
      router.push('/dashboard');
    }
  };

  const handleOpenWelcomePage = () => {
    onClose();
    router.push('/welcome');
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) return;

    saveFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      appId: appId.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleResetFirebase = () => {
    resetFirebaseConfig();
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setAppId('');
  };

  // Security guard: Diagnostics modal is strictly disabled in production builds
  if (process.env.NODE_ENV !== 'development' || !isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#E7E0D5]">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#E7E0D5] flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#718368]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#403B34] tracking-tight">
              {activeTab === 'auth' ? 'Taskora Authentication' : 'Firebase Cloud Configuration'}
            </h3>
            <p className="text-xs text-[#756E64]">
              {activeTab === 'auth'
                ? 'Manage active session and sign-in methods'
                : 'Internal development diagnostics and environment tokens'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#F0EBE2] p-1 border border-[#E7E0D5] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'auth'
                ? 'bg-white text-[#403B34] shadow-xs'
                : 'text-[#756E64] hover:text-[#403B34]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In & Session</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'firebase'
                ? 'bg-white text-[#403B34] shadow-xs'
                : 'text-[#756E64] hover:text-[#403B34]'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#718368]" />
            <span>Firebase Config</span>
            {isConfigured && (
              <span className="w-2 h-2 rounded-full bg-[#557B5C]" title="Connected" />
            )}
          </button>
        </div>

        {/* TAB 1: AUTH METHODS & ACTIVE SESSION */}
        {activeTab === 'auth' && (
          <div className="space-y-4">
            {user ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E7E0D5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#718368] text-white flex items-center justify-center font-bold text-sm">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#403B34] truncate">
                          {user.displayName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/20 uppercase">
                          {user.provider}
                        </span>
                      </div>
                      <span className="text-xs text-[#756E64] block truncate mt-0.5">
                        {user.email || user.phoneNumber || user.uid}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push('/dashboard');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#718368] text-white text-xs font-semibold hover:bg-[#5F7157] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOutUser();
                      onClose();
                      router.push('/welcome');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F5E6E5] border border-[#D9D0C3] text-[#B95750] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-[#FBF9F5] border border-[#D9D0C3] hover:border-[#718368] text-[#403B34] font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                {/* View all options link */}
                <button
                  type="button"
                  onClick={handleOpenWelcomePage}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#F0EBE2] hover:bg-[#E7E0D5] border border-[#D9D0C3] text-[#403B34] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#718368]" />
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3 h-3 text-[#756E64]" />
                </button>
              </div>
            )}

            {/* Status notice */}
            <div className="p-3 rounded-xl bg-[#EAF0E5]/60 border border-[#718368]/20 flex items-start gap-2.5 text-xs text-[#557B5C]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#718368]" />
              <p className="text-[11px] leading-relaxed">
                Taskora authenticates securely using Firebase project <span className="font-mono font-bold">taskora-web-3ba35</span>.
                All user records are isolated by individual UID.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FIREBASE LIVE CONFIG */}
        {activeTab === 'firebase' && (
          <form onSubmit={handleSaveFirebaseConfig} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-[#F0EBE2]/70 border border-[#E7E0D5] text-[11px] text-[#756E64] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#718368]" />
              <p>
                Credentials for project <strong className="text-[#403B34]">taskora-web-3ba35</strong> are configured via environment variables.
                You can override them below if testing custom project credentials.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-2.5 rounded-xl bg-[#EAF0E5] text-[#557B5C] border border-[#718368]/30 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Configuration saved successfully! Reloading...</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-[#403B34] block mb-1">
                  API Key (NEXT_PUBLIC_FIREBASE_API_KEY) *
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9D0C3] focus:border-[#718368] outline-none font-mono text-xs bg-white text-[#403B34]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#403B34] block mb-1">
                  Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) *
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    if (!authDomain || authDomain.endsWith('.firebaseapp.com')) {
                      setAuthDomain(`${e.target.value}.firebaseapp.com`);
                    }
                  }}
                  placeholder="taskora-web-3ba35"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9D0C3] focus:border-[#718368] outline-none font-mono text-xs bg-white text-[#403B34]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#403B34] block mb-1">
                  Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="taskora-web-3ba35.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9D0C3] focus:border-[#718368] outline-none font-mono text-xs bg-white text-[#403B34]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#403B34] block mb-1">
                  App ID (NEXT_PUBLIC_FIREBASE_APP_ID)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:283263821849:web:..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9D0C3] focus:border-[#718368] outline-none font-mono text-xs bg-white text-[#403B34]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetFirebase}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-[#B95750] hover:bg-[#F5E6E5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="submit"
                className="ml-auto py-2.5 px-4 rounded-xl bg-[#718368] hover:bg-[#5F7157] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
