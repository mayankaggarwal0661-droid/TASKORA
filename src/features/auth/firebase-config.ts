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

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: 'AIzaSyAr9Xz0uyeaPiy92WFhFo4TyZ4K_DSkWVQ',
  authDomain: DEFAULT_FIREBASE_AUTH_DOMAIN,
  projectId: DEFAULT_FIREBASE_PROJECT_ID,
  storageBucket: DEFAULT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: '283263821849',
  appId: '1:283263821849:web:7962d43333a20839322288',
  measurementId: 'G-094VKMTJ4F',
};

/**
 * Taskora Firebase Configuration
 *
 * Priority order (highest to lowest):
 *   1. NEXT_PUBLIC_ environment variables — used when an API key is present.
 *   2. Custom config persisted in localStorage (user console overrides).
 *   3. Default verified Taskora credentials (taskora-web-3ba35).
 */
export function getFirebaseConfig(): FirebaseConfigOptions {
  const envApiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '').trim();
  const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;

  // If the environment supplies a valid (non-placeholder) API key, use it.
  const envIsValid =
    envApiKey.length > 15 && !envApiKey.includes('Placeholder');

  if (envIsValid) {
    if (typeof window !== 'undefined') {
      try {
        const stale = localStorage.getItem('taskora_custom_firebase_config');
        if (stale) {
          const parsed = JSON.parse(stale);
          if (parsed?.projectId && parsed.projectId !== envProjectId) {
            localStorage.removeItem('taskora_custom_firebase_config');
          }
        }
      } catch {}
    }

    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`;

    return {
      apiKey: envApiKey,
      authDomain,
      projectId: envProjectId,
      storageBucket,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
    };
  }

  // Fall back to any manually saved custom config
  const custom = getCustomFirebaseConfig();
  if (custom) return custom;

  // Authoritative default configuration for taskora-web-3ba35
  return DEFAULT_FIREBASE_CONFIG;
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

const activeConfig = getFirebaseConfig();

// Single authoritative Firebase App initialization
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(activeConfig);

// Single authoritative Firebase Auth instance
export const auth: Auth = getAuth(app);

let persistencePromise: Promise<void> | null = null;

/**
 * Ensures browserLocalPersistence is configured and resolved for the Firebase Auth instance.
 * Must be awaited before sign-in operations or when restoring sessions.
 */
export async function ensureLocalPersistence(authInstance: Auth = auth): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!persistencePromise) {
    persistencePromise = setPersistence(authInstance, browserLocalPersistence).catch((err) => {
      console.warn('[Taskora Auth] Local persistence warning:', err);
    });
  }
  return persistencePromise;
}

// Immediately trigger local persistence registration in browser context
if (typeof window !== 'undefined') {
  ensureLocalPersistence(auth);
}

// Single authoritative Google Auth Provider with account selection prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
