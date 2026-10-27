import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  Auth,
} from 'firebase/auth';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const STORAGE_KEY_CUSTOM_CONFIG = 'taskora_custom_firebase_config';

/**
 * Checks localStorage for user-provided Firebase configuration
 */
export function getCustomFirebaseConfig(): FirebaseConfigOptions | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.apiKey === 'string' && parsed.apiKey.trim().length > 10) {
      return parsed;
    }
  } catch {}
  return null;
}

/**
 * Saves custom Firebase configuration to browser storage
 */
export function saveCustomFirebaseConfig(config: FirebaseConfigOptions): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save custom Firebase config:', e);
  }
}

/**
 * Clears custom Firebase configuration from browser storage
 */
export function clearCustomFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_CONFIG);
  } catch {}
}

export const DEFAULT_FIREBASE_PROJECT_ID = 'taskora-web-3ba35';
export const DEFAULT_FIREBASE_AUTH_DOMAIN = `${DEFAULT_FIREBASE_PROJECT_ID}.firebaseapp.com`;
export const DEFAULT_FIREBASE_STORAGE_BUCKET = `${DEFAULT_FIREBASE_PROJECT_ID}.firebasestorage.app`;

/**
 * Taskora Firebase Configuration
 *
 * Priority order (highest to lowest):
 *   1. NEXT_PUBLIC_ environment variables — always used when a valid API key is present.
 *   2. Custom config persisted in localStorage (only when no env-var API key is available).
 *
 * This ordering prevents a stale localStorage override from hijacking the configured
 * Firebase project and causing auth/operation-not-allowed for enabled sign-in methods.
 */
export function getFirebaseConfig(): FirebaseConfigOptions {
  const envApiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim();
  const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;

  // If the environment supplies a valid (non-placeholder) API key, always use it.
  const envIsValid =
    envApiKey.length > 15 && !envApiKey.includes('Placeholder');

  if (envIsValid) {
    // If environment variables provide valid credentials, clean up any stale custom localStorage overrides
    if (typeof window !== 'undefined') {
      try {
        const stale = localStorage.getItem('taskora_custom_firebase_config');
        if (stale) {
          const parsed = JSON.parse(stale);
          if (parsed?.projectId && parsed.projectId !== envProjectId) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `[Taskora Firebase] Removing stale localStorage config for project "${parsed.projectId}". ` +
                `Active environment project "${envProjectId}" takes priority.`
              );
            }
            localStorage.removeItem('taskora_custom_firebase_config');
          }
        }
      } catch {
        // ignore JSON parse / localStorage errors
      }
    }

    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`;

    return {
      apiKey: envApiKey,
      authDomain,
      projectId: envProjectId,
      storageBucket,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  // No valid env-var API key — fall back to any manually saved custom config.
  const custom = getCustomFirebaseConfig();
  if (custom) return custom;

  // No env vars and no custom config — return empty shell (will fail isFirebaseConfigured).
  return {
    apiKey: '',
    authDomain: `${envProjectId}.firebaseapp.com`,
    projectId: envProjectId,
    storageBucket: `${envProjectId}.firebasestorage.app`,
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  };
}

/**
 * Checks whether legitimate, non-empty Firebase credentials are provided
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  const apiKey = (config.apiKey || '').trim();
  const projectId = (config.projectId || '').trim();

  return Boolean(
    apiKey &&
    projectId &&
    !apiKey.includes('Placeholder') &&
    apiKey.length > 15
  );
}

// Fallback configuration for preview / local development before console keys are pasted
const fallbackConfig: FirebaseConfigOptions = {
  apiKey: 'AIzaSyTaskoraPlaceholderKeyForDevelopment0',
  authDomain: DEFAULT_FIREBASE_AUTH_DOMAIN,
  projectId: DEFAULT_FIREBASE_PROJECT_ID,
  storageBucket: DEFAULT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: '100000000000',
  appId: '1:100000000000:web:abcdef1234567890abcdef',
};

const activeConfig = isFirebaseConfigured() ? getFirebaseConfig() : fallbackConfig;

// Single authoritative Firebase App initialization
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(activeConfig);

// Single authoritative Firebase Auth instance
export const auth: Auth = getAuth(app);

// Configure session persistence to browserLocalPersistence so session survives refreshes
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase setPersistence warning:', err);
  });
}

// Single authoritative Google Auth Provider with account selection prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
