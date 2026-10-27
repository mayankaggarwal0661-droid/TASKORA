'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, Menu, X } from 'lucide-react';

export function FloatingNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchWorkspace = () => router.push('/welcome');

  const navLinks = [
    { label: 'Interactive Story', href: '#story' },
    { label: 'Architecture', href: '#bento' },
    { label: 'Features', href: '#features' },
    { label: 'Workspace', href: '/welcome' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 max-w-5xl mx-auto px-4 sm:px-6">
      <nav
        className={`flex items-center justify-between px-4 sm:px-6 py-3 rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'glass-surface border border-[#D9D0C3]/90 shadow-lg shadow-[#403B34]/8'
            : 'glass-surface border border-[#E7E0D5]/90 shadow-md'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#718368] flex items-center justify-center shadow-sm group-hover:bg-[#5F7157] transition-colors">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#403B34]">Taskora</span>
          </div>
        </Link>

        {/* Desktop Nav Anchors */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[#756E64]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#403B34] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#718368] after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/welcome"
            className="text-xs font-semibold px-3 py-1.5 text-[#756E64] hover:text-[#403B34] transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={handleLaunchWorkspace}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#718368] hover:bg-[#5F7157] border border-[#718368] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#756E64] hover:text-[#403B34] hover:bg-[#F0EBE2] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mt-2 p-4 rounded-2xl glass-surface-elevated border border-[#E7E0D5]/90 shadow-xl space-y-3"
          >
            <div className="flex flex-col space-y-1 text-sm font-medium text-[#756E64] pb-3 border-b border-[#E7E0D5]">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[#F0EBE2] hover:text-[#403B34] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <Link
                href="/welcome"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-[#756E64] hover:text-[#403B34] rounded-lg hover:bg-[#F0EBE2] transition-colors"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); handleLaunchWorkspace(); }}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#718368] hover:bg-[#5F7157] flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
