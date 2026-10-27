'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  FirebaseConfigOptions,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  ensureLocalPersistence,
} from '@/features/auth/firebase-config';

export interface AuthUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber?: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  provider: 'google' | 'password' | 'phone' | 'guest';
}

interface AuthResult {
  success: boolean;
  error?: string;
}

export interface GuestLockOptions {
  isOpen: boolean;
  featureName?: string;
  benefitDescription?: string;
}

interface AuthContextValue {
  user: AuthUserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isSigningIn: boolean;
  error: string | null;
  isGuest: boolean;
  isVisitor: boolean;
  isAuthenticatedCustomer: boolean;
  isConfigured: boolean;
  guestLock: GuestLockOptions;
  openGuestLock: (featureName?: string, benefitDescription?: string) => void;
  closeGuestLock: () => void;
  // Auth actions
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  signOutUser: () => Promise<AuthResult>;
  continueAsGuest: () => void;
  clearError: () => void;
  saveFirebaseConfig: (config: FirebaseConfigOptions) => void;
  resetFirebaseConfig: () => void;
}

const GUEST_STORAGE_KEY = 'taskora_guest_mode';
export const AUTH_SESSION_HINT_KEY = 'taskora_auth_session_hint';
export const AUTH_UID_KEY = 'taskora_auth_user_uid';

/**
 * Maps Firebase Auth errors to human-friendly messages
 */
function formatAuthError(err: unknown): string {
  const errorObj = err as {
    code?: string;
    message?: string;
    customData?: Record<string, unknown>;
  } | null;

  const code = errorObj?.code || '';
  const message = errorObj?.message || '';

  // Extract any detailed server message from customData or error body
  let serverDetails = message;
  try {
    if (errorObj?.customData) {
      serverDetails += ' ' + JSON.stringify(errorObj.customData);
    }
  } catch {}

  if (process.env.NODE_ENV === 'development') {
    console.warn('[Taskora Auth Error Diagnostic]', {
      code,
      message,
      serverDetails,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'taskora-web-3ba35',
    });
  }

  switch (code) {
    case 'auth/popup-blocked':
      return 'The sign-in pop-up was blocked by your browser. Please allow pop-ups for Taskora and try again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completion. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'A sign-in request is already in progress.';
    case 'auth/unauthorized-domain':
      return process.env.NODE_ENV === 'development'
        ? 'Domain not authorized in Firebase project (taskora-web-3ba35). Please add this domain to Firebase Console → Authentication → Settings → Authorized domains.'
        : 'This domain is not authorized for sign-in. Please contact support or try another browser.';
    case 'auth/operation-not-allowed':
      return process.env.NODE_ENV === 'development'
        ? 'This sign-in method is currently disabled in Firebase Console for project taskora-web-3ba35. Please check Authentication → Sign-in providers.'
        : 'This sign-in method is currently unavailable. Please try another method.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid-please-pass-a-valid-api-key':
      return process.env.NODE_ENV === 'development'
        ? 'Invalid Firebase API Key for project taskora-web-3ba35. Please check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.'
        : 'Authentication service is temporarily unavailable. Please try again later.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account was found with this email. Please check your spelling or create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access to this service has been temporarily restricted. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    default:
      return errorObj?.message || 'An unexpected authentication error occurred. Please try again.';
  }
}

/**
 * Maps a live Firebase User to the Taskora AuthUserProfile model
 */
function mapFirebaseUser(fbUser: FirebaseUser | null): AuthUserProfile | null {
  if (!fbUser) return null;

  const providerData = fbUser.providerData?.[0];
  const providerId = providerData?.providerId;

  let provider: 'google' | 'password' | 'phone' | 'guest' = 'google';
  if (providerId === 'password') {
    provider = 'password';
  } else if (providerId === 'phone' || fbUser.phoneNumber) {
    provider = 'phone';
  } else if (providerId === 'google.com') {
    provider = 'google';
  }

  const defaultName =
    fbUser.displayName ||
    (fbUser.email ? fbUser.email.split('@')[0] : null) ||
    fbUser.phoneNumber ||
    'Taskora User';

  return {
    uid: fbUser.uid,
    displayName: defaultName,
    email: fbUser.email || null,
    phoneNumber: fbUser.phoneNumber || null,
    photoURL: fbUser.photoURL || null,
    isAnonymous: fbUser.isAnonymous,
    provider,
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  // CRITICAL: Always initialize loading to true to prevent premature redirects
  // while Firebase restores session credentials from IndexedDB.
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Safely synchronize guest or active session hint from browser storage post-hydration
  useEffect(() => {
    try {
      const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (guestSaved === 'true') {
        setIsGuest(true);
      }
    } catch {}
  }, []);
  const [isConfiguredState, setIsConfiguredState] = useState(() => isFirebaseConfigured());
  const [guestLock, setGuestLock] = useState<GuestLockOptions>({ isOpen: false });

  const openGuestLock = useCallback((featureName?: string, benefitDescription?: string) => {
    setGuestLock({ isOpen: true, featureName, benefitDescription });
  }, []);

  const closeGuestLock = useCallback(() => {
    setGuestLock(prev => ({ ...prev, isOpen: false }));
  }, []);

  const router = useRouter();
  const redirectCheckedRef = useRef(false);

  const isAuthenticatedCustomer = Boolean(user);
  const isVisitor = !user && !isGuest;

  // 1. Authoritative Firebase Auth State Listener & Session Restoration
  useEffect(() => {
    // Ensure persistence layer is primed
    ensureLocalPersistence(auth).catch(() => {});

    // Process any pending redirect auth result (e.g. from popup fallback or mobile)
    if (!redirectCheckedRef.current && typeof window !== 'undefined') {
      redirectCheckedRef.current = true;
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            setFirebaseUser(result.user);
            setUser(mapFirebaseUser(result.user));
            setIsGuest(false);
            try {
              localStorage.removeItem(GUEST_STORAGE_KEY);
              localStorage.setItem(AUTH_SESSION_HINT_KEY, 'authenticated');
              localStorage.setItem(AUTH_UID_KEY, result.user.uid);
            } catch {}
          }
        })
        .catch((err) => {
          setError(formatAuthError(err));
        });
    }

    // onAuthStateChanged is the authoritative source of truth for session status
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        if (fbUser) {
          setFirebaseUser(fbUser);
          setUser(mapFirebaseUser(fbUser));
          setIsGuest(false);
          try {
            localStorage.removeItem(GUEST_STORAGE_KEY);
            localStorage.setItem(AUTH_SESSION_HINT_KEY, 'authenticated');
            localStorage.setItem(AUTH_UID_KEY, fbUser.uid);
          } catch {}
        } else {
          setFirebaseUser(null);
          setUser(null);
          try {
            localStorage.removeItem(AUTH_SESSION_HINT_KEY);
            localStorage.removeItem(AUTH_UID_KEY);
            const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
            setIsGuest(guestSaved === 'true');
          } catch {
            setIsGuest(false);
          }
        }
        // Session resolution is complete: unblock route guards
        setLoading(false);
      },
      (err) => {
        console.error('Taskora auth observer error:', err);
        setError(formatAuthError(err));
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 2. Google Sign-In with explicit account selection prompt
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setError(null);
    setIsSigningIn(true);

    if (!isFirebaseConfigured()) {
      setIsSigningIn(false);
      const msg = process.env.NODE_ENV === 'development'
        ? 'Firebase Project taskora-web-3ba35 credentials are not configured.'
        : 'Authentication service is temporarily unavailable. Please contact support.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      // Ensure browserLocalPersistence is active before starting sign-in
      await ensureLocalPersistence(auth);

      // Ensure Google account selection prompt is requested
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        setFirebaseUser(result.user);
        setUser(mapFirebaseUser(result.user));
        setIsGuest(false);
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
          localStorage.setItem(AUTH_SESSION_HINT_KEY, 'authenticated');
          localStorage.setItem(AUTH_UID_KEY, result.user.uid);
        } catch {}
        setIsSigningIn(false);
        return { success: true };
      }
      setIsSigningIn(false);
      return { success: false, error: 'No user credentials returned from Google.' };
    } catch (popupError: unknown) {
      const fbErr = popupError as { code?: string };

      // If popup is blocked by the browser, attempt fallback to redirect flow
      if (fbErr?.code === 'auth/popup-blocked') {
        try {
          await ensureLocalPersistence(auth);
          await signInWithRedirect(auth, googleProvider);
          return { success: true };
        } catch (redirectError: unknown) {
          const msg = formatAuthError(redirectError);
          setError(msg);
          setIsSigningIn(false);
          return { success: false, error: msg };
        }
      }

      const msg = formatAuthError(popupError);
      setError(msg);
      setIsSigningIn(false);
      return { success: false, error: msg };
    }
  }, []);

  // 3. Email & Password Sign-In
  const signInWithEmail = useCallback(async (email: string, pass: string): Promise<AuthResult> => {
    setError(null);
    setIsSigningIn(true);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setIsSigningIn(false);
      const msg = 'Please enter your email address.';
      setError(msg);
      return { success: false, error: msg };
    }
    if (!pass) {
      setIsSigningIn(false);
      const msg = 'Please enter your password.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      await ensureLocalPersistence(auth);
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred && cred.user) {
        setFirebaseUser(cred.user);
        setUser(mapFirebaseUser(cred.user));
        setIsGuest(false);
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
          localStorage.setItem(AUTH_SESSION_HINT_KEY, 'authenticated');
          localStorage.setItem(AUTH_UID_KEY, cred.user.uid);
        } catch {}
        setIsSigningIn(false);
        return { success: true };
      }
      setIsSigningIn(false);
      return { success: false, error: 'Failed to sign in.' };
    } catch (err: unknown) {
      const msg = formatAuthError(err);
      setError(msg);
      setIsSigningIn(false);
      return { success: false, error: msg };
    }
  }, []);

  // 4. Email & Password Registration (Create Account)
  const signUpWithEmail = useCallback(
    async (email: string, pass: string, displayName?: string): Promise<AuthResult> => {
      setError(null);
      setIsSigningIn(true);

      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setIsSigningIn(false);
        const msg = 'Please enter a valid email address.';
        setError(msg);
        return { success: false, error: msg };
      }
      if (!pass || pass.length < 6) {
        setIsSigningIn(false);
        const msg = 'Password must be at least 6 characters.';
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        await ensureLocalPersistence(auth);
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (cred && cred.user) {
          if (displayName && displayName.trim()) {
            try {
              await updateProfile(cred.user, { displayName: displayName.trim() });
            } catch (pErr) {
              console.warn('Profile name update warning:', pErr);
            }
          }

          setFirebaseUser(cred.user);
          setUser(mapFirebaseUser(cred.user));
          setIsGuest(false);
          try {
            localStorage.removeItem(GUEST_STORAGE_KEY);
            localStorage.setItem(AUTH_SESSION_HINT_KEY, 'authenticated');
            localStorage.setItem(AUTH_UID_KEY, cred.user.uid);
          } catch {}
          setIsSigningIn(false);
          return { success: true };
        }
        setIsSigningIn(false);
        return { success: false, error: 'Failed to create account.' };
      } catch (err: unknown) {
        const msg = formatAuthError(err);
        setError(msg);
        setIsSigningIn(false);
        return { success: false, error: msg };
      }
    },
    []
  );

  // 5. Password Reset (Forgot Password)
  const sendPasswordReset = useCallback(async (targetEmail: string): Promise<AuthResult> => {
    setError(null);
    setIsSigningIn(true);

    const cleanEmail = targetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsSigningIn(false);
      const msg = 'Please enter a valid email address.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setIsSigningIn(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = formatAuthError(err);
      setError(msg);
      setIsSigningIn(false);
      return { success: false, error: msg };
    }
  }, []);

  // 6. Authoritative Sign Out
  const signOutUser = useCallback(async (): Promise<AuthResult> => {
    setIsSigningIn(false);
    setError(null);

    try {
      if (isFirebaseConfigured()) {
        await signOut(auth);
      }
      setFirebaseUser(null);
      setUser(null);
      setIsGuest(false);
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
        localStorage.removeItem(AUTH_SESSION_HINT_KEY);
        localStorage.removeItem(AUTH_UID_KEY);
        localStorage.removeItem('taskora_google_session');
      } catch {}
      return { success: true };
    } catch (e: unknown) {
      console.error('Firebase signOut error:', e);
      const msg = formatAuthError(e);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // 7. Continue as Guest (local sandbox mode)
  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setUser(null);
    setFirebaseUser(null);
    setError(null);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true');
      localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      localStorage.removeItem(AUTH_UID_KEY);
      localStorage.removeItem('taskora_google_session');
    } catch {}
    router.push('/dashboard');
  }, [router]);

  // 8. Firebase configuration helpers
  const saveFirebaseConfig = useCallback((config: FirebaseConfigOptions) => {
    saveCustomFirebaseConfig(config);
    setIsConfiguredState(isFirebaseConfigured());
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  const resetFirebaseConfig = useCallback(() => {
    clearCustomFirebaseConfig();
    setIsConfiguredState(isFirebaseConfigured());
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isSigningIn,
        error,
        isGuest,
        isVisitor,
        isAuthenticatedCustomer,
        isConfigured: isConfiguredState,
        guestLock,
        openGuestLock,
        closeGuestLock,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOutUser,
        continueAsGuest,
        clearError,
        saveFirebaseConfig,
        resetFirebaseConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
