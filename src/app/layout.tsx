import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#718368',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Taskora — Smart Productivity, Habits & Reminder Ecosystem',
  description:
    'Plan tasks, schedule advance reminders, build daily routines, and master deep focus in a calm, distraction-free workspace.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Taskora',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F4EE] text-[#403B34] selection:bg-[#718368]/20 selection:text-[#403B34]">
        <Script
          id="taskora-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var key = 'taskora_accent_theme';
                var themeId = localStorage.getItem(key);
                if (!themeId) {
                  var state = localStorage.getItem('taskora_ecosystem_v1');
                  if (state) {
                    var parsed = JSON.parse(state);
                    if (parsed && parsed.userProfile && parsed.userProfile.accentColor) {
                      themeId = parsed.userProfile.accentColor;
                    }
                  }
                }
                var map = {
                  'sage': 'sage-green',
                  'sienna': 'sienna-clay',
                  'amber': 'sunset-amber',
                  'emerald': 'forest-olive',
                  'forest': 'forest-olive',
                  'rose': 'terracotta-rose',
                  'violet': 'muted-violet',
                  'warm': 'warm-neutral',
                  'default': 'warm-neutral'
                };
                if (map[themeId]) themeId = map[themeId];
                var themes = {
                  'warm-neutral': { c: '#718368', h: '#5F7157', s: '#EAF0E5', b: 'rgba(113, 131, 104, 0.35)', t: '#557B5C', r: 'rgba(113, 131, 104, 0.4)', g: 'rgba(113, 131, 104, 0.15)', rgb: '113, 131, 104' },
                  'sage-green':   { c: '#718368', h: '#5F7157', s: '#EAF0E5', b: 'rgba(113, 131, 104, 0.35)', t: '#557B5C', r: 'rgba(113, 131, 104, 0.4)', g: 'rgba(113, 131, 104, 0.15)', rgb: '113, 131, 104' },
                  'sienna-clay':  { c: '#B88762', h: '#9E6E4B', s: '#F7EFE8', b: 'rgba(184, 135, 98, 0.35)', t: '#96623E', r: 'rgba(184, 135, 98, 0.4)', g: 'rgba(184, 135, 98, 0.15)', rgb: '184, 135, 98' },
                  'sunset-amber': { c: '#C99A3C', h: '#B08329', s: '#FBF5E6', b: 'rgba(201, 154, 60, 0.35)', t: '#A87A22', r: 'rgba(201, 154, 60, 0.4)', g: 'rgba(201, 154, 60, 0.15)', rgb: '201, 154, 60' },
                  'forest-olive': { c: '#557B5C', h: '#44654A', s: '#E8F0E9', b: 'rgba(85, 123, 92, 0.35)', t: '#416347', r: 'rgba(85, 123, 92, 0.4)', g: 'rgba(85, 123, 92, 0.15)', rgb: '85, 123, 92' },
                  'terracotta-rose': { c: '#B95F60', h: '#A14F50', s: '#F9ECEC', b: 'rgba(185, 95, 96, 0.35)', t: '#9E4647', r: 'rgba(185, 95, 96, 0.4)', g: 'rgba(185, 95, 96, 0.15)', rgb: '185, 95, 96' },
                  'muted-violet': { c: '#8B5CF6', h: '#7544E6', s: '#F2EEFE', b: 'rgba(139, 92, 246, 0.35)', t: '#733FE6', r: 'rgba(139, 92, 246, 0.4)', g: 'rgba(139, 92, 246, 0.15)', rgb: '139, 92, 246' }
                };
                var active = themes[themeId] || themes['warm-neutral'];
                var activeId = themes[themeId] ? themeId : 'warm-neutral';
                var root = document.documentElement;
                root.setAttribute('data-theme', activeId);
                root.style.setProperty('--accent', active.c);
                root.style.setProperty('--accent-hover', active.h);
                root.style.setProperty('--accent-soft', active.s);
                root.style.setProperty('--accent-border', active.b);
                root.style.setProperty('--accent-text', active.t);
                root.style.setProperty('--accent-ring', active.r);
                root.style.setProperty('--accent-glow', active.g);
                root.style.setProperty('--accent-rgb', active.rgb);
                root.style.setProperty('--color-accent-primary', active.c);
                root.style.setProperty('--color-accent-primary-hover', active.h);
                root.style.setProperty('--color-accent-soft', active.s);
              } catch(e) {}
            })()`
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
