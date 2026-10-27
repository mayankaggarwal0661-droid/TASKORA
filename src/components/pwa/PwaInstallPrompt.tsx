'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Share, CheckCircle2, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt({ inline = false }: { inline?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // If already running inside standalone app, show active status if inline
  if (isStandalone || isInstalled) {
    if (!inline) return null;
    return (
      <div className="p-4 rounded-2xl bg-[#E8F0E9] border border-[#557B5C]/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D2E4D4] text-[#557B5C] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#403B34]">Taskora App Installed</h4>
            <p className="text-xs text-[#756E64] mt-0.5">
              Running as a standalone Progressive Web App with native OS integration.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D2E4D4] text-[#557B5C]">
          PWA Active
        </span>
      </div>
    );
  }

  if (isDismissed && !inline) return null;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        inline
          ? 'p-5 bg-white border-[#E7E0D5] shadow-sm'
          : 'p-4 bg-[#FBF9F5] border-[#D9D0C3] shadow-md fixed bottom-4 right-4 max-w-sm z-40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0E5] text-[#718368] flex items-center justify-center shrink-0">
            {isIos ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#403B34]">
              {isIos ? 'Install Taskora on iOS' : 'Install Desktop / Mobile App'}
            </h4>
            <p className="text-xs text-[#756E64] mt-1 leading-relaxed">
              {isIos ? (
                <>
                  To enable background push notifications on iOS, tap the Safari <strong>Share</strong> button{' '}
                  <Share className="w-3 h-3 inline text-[#718368]" /> and select{' '}
                  <strong>Add to Home Screen</strong>.
                </>
              ) : (
                'Install Taskora for quick offline access, seamless native notification alerts, and a standalone workspace.'
              )}
            </p>
          </div>
        </div>

        {!inline && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-[#968D81] hover:text-[#403B34] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {deferredPrompt ? (
          <Button variant="primary" size="sm" onClick={handleInstallClick} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-1.5" />
            Install Taskora PWA
          </Button>
        ) : isIos ? (
          <span className="text-xs text-[#718368] font-medium bg-[#EAF0E5] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
            <Share className="w-3.5 h-3.5" />
            Share → Add to Home Screen
          </span>
        ) : (
          <span className="text-xs text-[#756E64] bg-[#F0EBE2] px-3 py-1.5 rounded-lg">
            Use browser menu (⋮ or ⊕) → Install App
          </span>
        )}
      </div>
    </div>
  );
}
