'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const PUBLIC_ROUTES = ['/', '/welcome', '/landing'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthenticated = Boolean(user || isGuest);
  const isProtected = !isPublicRoute;
  const isCheckingOrUnauthorized = isProtected && (loading || !isAuthenticated);

  useEffect(() => {
    if (loading) return;

    // Signed-out visitor attempting to access protected route -> redirect to /welcome
    if (!isAuthenticated && isProtected) {
      try {
        sessionStorage.setItem('taskora_auth_redirect', pathname);
      } catch {}
      router.replace('/welcome');
    }
  }, [loading, isAuthenticated, isProtected, pathname, router]);

  return (
    <>
      {/* Sleek warm glass loader / verification overlay on protected routes */}
      {isCheckingOrUnauthorized && (
        <div
          className="fixed inset-0 z-50 min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          role="status"
          aria-live="polite"
        >
          {/* Soft background glow */}
          <div className="absolute w-96 h-96 rounded-full bg-[#EAF0E5] blur-3xl opacity-60 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 glass-modal p-8 rounded-3xl border border-[#E7E0D5]/90 shadow-2xl flex flex-col items-center max-w-sm w-full"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#718368] flex items-center justify-center text-white shadow-md mb-4 animate-pulse">
              <Leaf className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-[#403B34] tracking-tight">Taskora Workspace</h2>
            <p className="text-xs text-[#756E64] mt-1">
              {loading ? 'Verifying session credentials...' : 'Redirecting to sign-in...'}
            </p>

            <div className="mt-6 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#718368] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#718368] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#718368] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        </div>
      )}

      {/* 
        Always render children so Next.js instant navigation validation can validate
        the route segment without dropping it from the render tree.
        When unauthorized or verifying, keep children visually hidden and inactive.
      */}
      <div
        className={isCheckingOrUnauthorized ? 'hidden' : 'contents'}
        aria-hidden={isCheckingOrUnauthorized ? 'true' : undefined}
      >
        {children}
      </div>
    </>
  );
}
