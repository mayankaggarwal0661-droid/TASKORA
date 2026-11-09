'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, Shield, Zap, CheckCircle2, Heart } from 'lucide-react';

export function LandingFooter() {
  const year = 2026;

  return (
    <footer className="relative z-10 border-t border-[#E7E0D5] bg-white/92 backdrop-blur-md text-[#756E64] pt-10 pb-8 overflow-hidden">
      {/* Warm tinted bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-28 bg-[#EAF0E5]/60 blur-[70px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#E7E0D5]">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#718368] flex items-center justify-center shadow-xs group-hover:bg-[#5F7157] transition-colors">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#403B34]">Taskora</span>
            </Link>

            <p className="text-xs sm:text-sm text-[#756E64] max-w-sm leading-relaxed">
              A calm, focused productivity ecosystem with advance reminders, habit rituals, and real analytics — no account required.
            </p>

            {/* Compact Status & Contributor Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E9] border border-[#557B5C]/25 text-[11px] text-[#557B5C]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#557B5C] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#557B5C]" />
                </span>
                <span className="font-medium">All systems operational • Privacy-first</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#F2DAC3] text-[11px] text-[#A97535]">
                <Heart className="w-3 h-3 text-[#B88762] fill-[#B88762]/30" />
                <span className="font-medium">Maintained by Aditi Singh</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#403B34]">Product</h4>
            <ul className="space-y-1.5 text-xs">
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

          {/* Architecture Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#403B34]">Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <Zap className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                <span>Web Audio Synthesis</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                <span>Drift-Free Timestamps</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#756E64]">
                <Shield className="w-3.5 h-3.5 text-[#718368] shrink-0" />
                <span>Local-First &amp; Firebase</span>
              </li>
              <li className="pt-1">
                <Link
                  href="/welcome"
                  className="text-[#718368] font-semibold hover:text-[#5F7157] transition-colors inline-flex items-center gap-1 text-xs"
                >
                  Launch App <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#968D81]">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span>© {year} Taskora. All rights reserved.</span>
            <span className="hidden sm:inline text-[#D9D0C3]">•</span>
            <span>Crafted with care by <strong className="font-semibold text-[#557B5C]">Aditi Singh</strong> &amp; the Taskora team</span>
            <span className="hidden md:inline text-[#D9D0C3]">•</span>
            <span className="hidden md:inline">Next.js &amp; Framer Motion</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] shrink-0">
            Press{' '}
            <kbd className="bg-[#F0EBE2] text-[#403B34] px-1.5 py-0.5 rounded font-mono text-[10px] border border-[#D9D0C3] mx-1">
              ⌘K
            </kbd>
            for Command Palette
          </div>
        </div>
      </div>
    </footer>
  );
}
