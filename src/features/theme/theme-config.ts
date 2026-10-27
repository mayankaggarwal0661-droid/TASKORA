/**
 * Taskora Centralized 7-Theme Personalization Architecture
 *
 * Authoritative source of truth for Visual Accent Themes.
 * Defines shared design tokens for all 7 themes:
 * - 1. Sage Green
 * - 2. Sienna Clay
 * - 3. Sunset Amber
 * - 4. Forest Olive
 * - 5. Terracotta Rose
 * - 6. Muted Violet
 * - 7. Warm Neutral (Current Default)
 */

export type CanonicalThemeId =
  | 'sage-green'
  | 'sienna-clay'
  | 'sunset-amber'
  | 'forest-olive'
  | 'terracotta-rose'
  | 'muted-violet'
  | 'warm-neutral';

export type LegacyThemeId = 'sage' | 'sienna' | 'amber' | 'emerald' | 'rose' | 'violet';

export type AnyThemeId = CanonicalThemeId | LegacyThemeId;

export interface ThemeDefinition {
  id: CanonicalThemeId;
  name: string;
  subtitle: string;
  colorHex: string;        // Primary accent
  hoverHex: string;        // Hover accent
  softHex: string;         // Soft tinted background
  borderHex: string;       // Subtle border highlight
  textHex: string;         // Readable text / badge icon color
  ringHex: string;         // Focus ring color
  glowHex: string;         // Radial spotlight glow
  rgb: string;             // Comma-separated R, G, B for CSS opacity calculation
  isDefault?: boolean;
}

export const THEME_DEFINITIONS: Record<CanonicalThemeId, ThemeDefinition> = {
  'warm-neutral': {
    id: 'warm-neutral',
    name: 'Warm Neutral',
    subtitle: 'Classic sage accent & warm cream signature',
    colorHex: '#718368',
    hoverHex: '#5F7157',
    softHex: '#EAF0E5',
    borderHex: 'rgba(113, 131, 104, 0.35)',
    textHex: '#557B5C',
    ringHex: 'rgba(113, 131, 104, 0.4)',
    glowHex: 'rgba(113, 131, 104, 0.15)',
    rgb: '113, 131, 104',
    isDefault: true,
  },
  'sage-green': {
    id: 'sage-green',
    name: 'Sage Green',
    subtitle: 'Calm botanical sage & organic greens',
    colorHex: '#718368',
    hoverHex: '#5F7157',
    softHex: '#EAF0E5',
    borderHex: 'rgba(113, 131, 104, 0.35)',
    textHex: '#557B5C',
    ringHex: 'rgba(113, 131, 104, 0.4)',
    glowHex: 'rgba(113, 131, 104, 0.15)',
    rgb: '113, 131, 104',
  },
  'sienna-clay': {
    id: 'sienna-clay',
    name: 'Sienna Clay',
    subtitle: 'Earthy terracotta clay & desert warmth',
    colorHex: '#B88762',
    hoverHex: '#9E6E4B',
    softHex: '#F7EFE8',
    borderHex: 'rgba(184, 135, 98, 0.35)',
    textHex: '#96623E',
    ringHex: 'rgba(184, 135, 98, 0.4)',
    glowHex: 'rgba(184, 135, 98, 0.15)',
    rgb: '184, 135, 98',
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    subtitle: 'Warm golden amber & evening glow',
    colorHex: '#C99A3C',
    hoverHex: '#B08329',
    softHex: '#FBF5E6',
    borderHex: 'rgba(201, 154, 60, 0.35)',
    textHex: '#A87A22',
    ringHex: 'rgba(201, 154, 60, 0.4)',
    glowHex: 'rgba(201, 154, 60, 0.15)',
    rgb: '201, 154, 60',
  },
  'forest-olive': {
    id: 'forest-olive',
    name: 'Forest Olive',
    subtitle: 'Deep coniferous evergreen & forest canopy',
    colorHex: '#557B5C',
    hoverHex: '#44654A',
    softHex: '#E8F0E9',
    borderHex: 'rgba(85, 123, 92, 0.35)',
    textHex: '#416347',
    ringHex: 'rgba(85, 123, 92, 0.4)',
    glowHex: 'rgba(85, 123, 92, 0.15)',
    rgb: '85, 123, 92',
  },
  'terracotta-rose': {
    id: 'terracotta-rose',
    name: 'Terracotta Rose',
    subtitle: 'Muted dusty rose & delicate blush tint',
    colorHex: '#B95F60',
    hoverHex: '#A14F50',
    softHex: '#F9ECEC',
    borderHex: 'rgba(185, 95, 96, 0.35)',
    textHex: '#9E4647',
    ringHex: 'rgba(185, 95, 96, 0.4)',
    glowHex: 'rgba(185, 95, 96, 0.15)',
    rgb: '185, 95, 96',
  },
  'muted-violet': {
    id: 'muted-violet',
    name: 'Muted Violet',
    subtitle: 'Subtle twilight violet & calm lavender',
    colorHex: '#8B5CF6',
    hoverHex: '#7544E6',
    softHex: '#F2EEFE',
    borderHex: 'rgba(139, 92, 246, 0.35)',
    textHex: '#733FE6',
    ringHex: 'rgba(139, 92, 246, 0.4)',
    glowHex: 'rgba(139, 92, 246, 0.15)',
    rgb: '139, 92, 246',
  },
};

/**
 * Ordered list of all 7 themes for the Settings UI selector
 */
export const THEMES_LIST: ThemeDefinition[] = [
  THEME_DEFINITIONS['warm-neutral'],
  THEME_DEFINITIONS['sage-green'],
  THEME_DEFINITIONS['sienna-clay'],
  THEME_DEFINITIONS['sunset-amber'],
  THEME_DEFINITIONS['forest-olive'],
  THEME_DEFINITIONS['terracotta-rose'],
  THEME_DEFINITIONS['muted-violet'],
];

/**
 * Normalizes any raw theme string (canonical, legacy alias, or undefined) to a valid CanonicalThemeId
 */
export function resolveThemeId(raw?: string | null): CanonicalThemeId {
  if (!raw) return 'warm-neutral';

  const normalized = raw.toLowerCase().trim();

  // Exact canonical match
  if (normalized in THEME_DEFINITIONS) {
    return normalized as CanonicalThemeId;
  }

  // Legacy aliases
  switch (normalized) {
    case 'sage':
      return 'sage-green';
    case 'sienna':
      return 'sienna-clay';
    case 'amber':
      return 'sunset-amber';
    case 'emerald':
    case 'forest':
      return 'forest-olive';
    case 'rose':
      return 'terracotta-rose';
    case 'violet':
      return 'muted-violet';
    case 'warm':
    case 'default':
      return 'warm-neutral';
    default:
      return 'warm-neutral';
  }
}

/**
 * Retrieves the complete ThemeDefinition for any theme identifier
 */
export function getTheme(themeId?: string | null): ThemeDefinition {
  const canonical = resolveThemeId(themeId);
  return THEME_DEFINITIONS[canonical];
}

export const THEME_STORAGE_KEY = 'taskora_accent_theme';

/**
 * Applies the selected theme's tokens to the document element immediately.
 * Sets data-theme attribute and inline CSS variables.
 */
export function applyTheme(themeId: string): ThemeDefinition {
  const theme = getTheme(themeId);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    // 1. Set data-theme attribute for CSS attribute selectors
    root.setAttribute('data-theme', theme.id);

    // 2. Set authoritative CSS variables on :root
    root.style.setProperty('--accent', theme.colorHex);
    root.style.setProperty('--accent-hover', theme.hoverHex);
    root.style.setProperty('--accent-soft', theme.softHex);
    root.style.setProperty('--accent-border', theme.borderHex);
    root.style.setProperty('--accent-ring', theme.ringHex);
    root.style.setProperty('--accent-text', theme.textHex);
    root.style.setProperty('--accent-glow', theme.glowHex);
    root.style.setProperty('--accent-rgb', theme.rgb);

    // Tailwind-specific token bindings
    root.style.setProperty('--color-accent-primary', theme.colorHex);
    root.style.setProperty('--color-accent-primary-hover', theme.hoverHex);
    root.style.setProperty('--color-accent-soft', theme.softHex);

    // 3. Update theme-color meta tag for browser chrome / PWA status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colorHex);
    }

    // 4. Persist to dedicated key for instant zero-flash startup hydration
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch {}
  }

  return theme;
}

/**
 * Retrieves the stored theme from localStorage synchronously (for fast init)
 */
export function getSavedTheme(): CanonicalThemeId {
  if (typeof window === 'undefined') return 'warm-neutral';
  try {
    const direct = localStorage.getItem(THEME_STORAGE_KEY);
    if (direct) return resolveThemeId(direct);

    // Fallback: check profile in full taskora state
    const stateStr = localStorage.getItem('taskora_ecosystem_v1');
    if (stateStr) {
      const state = JSON.parse(stateStr);
      if (state?.userProfile?.accentColor) {
        return resolveThemeId(state.userProfile.accentColor);
      }
    }
  } catch {}
  return 'warm-neutral';
}
