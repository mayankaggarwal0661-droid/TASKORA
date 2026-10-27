'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, Shield, Zap, CheckCircle2 } from 'lucide-react';

export function LandingFooter() {
  const year = 2026;

  return (
    <footer className="relative z-10 border-t border-[#E7E0D5] bg-white text-[#756E64] pt-14 pb-10 overflow-hidden">
      {/* Warm tinted bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-36 bg-[#EAF0E5]/60 blur-[80px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#E7E0D5]">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#718368] flex items-center justify-center shadow-sm group-hover:bg-[#5F7157] transition-colors">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#403B34]">Taskora</span>
            </Link>

            <p className="text-sm text-[#756E64] max-w-xs leading-relaxed">
              A calm, focused productivity ecosystem with advance reminders, habit rituals, and real analytics — no account required.
            </p>

            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0E9] border border-[#557B5C]/25 text-[11px] text-[#557B5C]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#557B5C] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#557B5C]" />
              </span>
              <span className="font-medium">All systems operational • Privacy-first</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#403B34]">Product</h4>
            <ul className="space-y-2 text-xs">
              {[
                ['Dashboard',  '/dashboard'],
                ['All Tasks',  '/tasks'],
                ['Focus Mode', '/focus'],
                ['Routines',   '/routines'],
                ['Calendar',   '/calendar'],
                ['Analytics',  '/analytics'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[#403B34] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#403B34]">Features</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <Zap className="w-3 h-3 text-[#718368]" />
                <span>Web Audio Synthesis</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <CheckCircle2 className="w-3 h-3 text-[#718368]" />
                <span>Drift-Free Timestamps</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <Shield className="w-3 h-3 text-[#718368]" />
                <span>Local-First Storage</span>
              </li>
              <li>
                <Link
                  href="/welcome"
                  className="text-[#718368] font-semibold hover:text-[#5F7157] transition-colors inline-flex items-center gap-1"
                >
                  Launch App <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#968D81]">
          <div className="flex items-center gap-2">
            <span>© {year} Taskora. All rights reserved.</span>
            <span className="hidden sm:inline text-[#D9D0C3]">•</span>
            <span className="hidden sm:inline">Built with Next.js & Framer Motion</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            Press{' '}
            <kbd className="bg-[#F0EBE2] text-[#403B34] px-1.5 py-0.5 rounded font-mono text-[10px] border border-[#D9D0C3] mx-1">
              ⌘K
            </kbd>
            anywhere for Command Palette
          </div>
        </div>
      </div>
    </footer>
  );
}
