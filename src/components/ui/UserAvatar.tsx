'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ringClass?: string;
  altText?: string;
}

/**
 * Extracts 1 or 2 uppercase initials from a display name.
 * e.g., "Mayank Aggarwal" -> "MA", "Alex" -> "A", "" -> ""
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    const combined = (first + last).toUpperCase();
    if (/^[A-Z0-9]{1,2}$/.test(combined)) {
      return combined;
    }
  }

  const single = trimmed.charAt(0).toUpperCase();
  if (/^[A-Z0-9]$/.test(single)) {
    return single;
  }

  return '';
}

/**
 * Validates that an avatar URL is non-empty, well-formed, and points to a web/local resource.
 */
export function isValidAvatarUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;

  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  );
}

/**
 * Robust UserAvatar component with multi-tier fallback:
 * 1. Valid photoUrl (loads via <img> with no-referrer & CORS support).
 * 2. If photo fails to load (404, CORS, blocked by extension) or is missing -> User Initials.
 * 3. If no name / initials available -> Neutral Profile Icon (<User />).
 *
 * Never renders a native browser broken-image placeholder icon.
 */
export function UserAvatar({
  photoUrl,
  name,
  size = 'sm',
  className = '',
  ringClass = '',
  altText,
}: UserAvatarProps) {
  const cleanUrl = typeof photoUrl === 'string' ? photoUrl.trim() : '';
  const isUrlFormatValid = isValidAvatarUrl(cleanUrl);

  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  const hasError = errorUrl === cleanUrl;
  const isLoaded = loadedUrl === cleanUrl;

  const initials = getInitials(name);
  const displayName = typeof name === 'string' ? name.trim() : '';
  const resolvedAlt = altText || displayName || 'User avatar';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  }[size];

  const shouldRenderImg = isUrlFormatValid && !hasError;

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-[#EAF0E5] text-[#718368] flex items-center justify-center font-bold shrink-0 select-none ${sizeClasses} ${ringClass} ${className}`}
    >
      {shouldRenderImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cleanUrl}
          src={cleanUrl}
          alt={resolvedAlt}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={() => setLoadedUrl(cleanUrl)}
          onError={() => setErrorUrl(cleanUrl)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-150 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Fallback display: initials or neutral user icon */}
      {(!shouldRenderImg || !isLoaded) && (
        <span
          className="flex items-center justify-center w-full h-full"
          suppressHydrationWarning
        >
          {initials ? (
            <span suppressHydrationWarning className="leading-none tracking-tight">
              {initials}
            </span>
          ) : (
            <User className={`${iconSizes} text-[#718368]`} aria-hidden="true" />
          )}
        </span>
      )}
    </div>
  );
}
