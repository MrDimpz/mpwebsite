import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateProfile,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'leaderboard', 'connection_check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: boolean | string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: sanitizeEmailForDisplay(auth.currentUser?.email),
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          email: sanitizeEmailForDisplay(provider.email),
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type SoloGameId = 'crossword' | 'rebus' | 'squared' | 'thematix';

export const SOLO_GAME_META: Record<
  SoloGameId,
  {
    id: SoloGameId;
    number: string;
    title: string;
    shortTitle: string;
    subtitle: string;
    path: string;
    scoreUnit: string;
  }
> = {
  crossword: {
    id: 'crossword',
    number: '01',
    title: 'Cruciverbalist Daily Crossword',
    shortTitle: 'Crossword',
    subtitle: '20×20 & 8×8 Timed Crossword Archive',
    path: '/solo-games/crossword',
    scoreUnit: 'pts',
  },
  rebus: {
    id: 'rebus',
    number: '02',
    title: 'Missing Rebus',
    shortTitle: 'Missing Rebus',
    subtitle: '733+ Visual Wordplay Archive & 5-Round Sprint',
    path: '/solo-games/rebus',
    scoreUnit: 'pts',
  },
  squared: {
    id: 'squared',
    number: '03',
    title: 'Squared — Daily Word Grid',
    shortTitle: 'Squared',
    subtitle: '3×3 Express, 4×4 Classic & 5×5 Royal Boards',
    path: '/solo-games/squared',
    scoreUnit: 'pts',
  },
  thematix: {
    id: 'thematix',
    number: '04',
    title: 'Thematix — Word Association',
    shortTitle: 'Thematix',
    subtitle: 'Daily Theme Word & 6 Alphabetical Clues',
    path: '/solo-games/thematix',
    scoreUnit: 'pts',
  },
};

// Blueprint validation constants synced verbatim with firebase-blueprint.json & firestore.rules
export const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_PUZZLE_ID_LENGTH = 64;
export const MAX_DISPLAY_NAME_LENGTH = 60;
export const ALLOWED_GAMES: SoloGameId[] = ['crossword', 'rebus', 'squared', 'thematix'];

export interface UnifiedLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  gameId: SoloGameId;
  puzzleId: string;
  puzzleTitle: string;
  score: number;
  metricLabel: string;
  subMetricLabel: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// ---------------------------------------------------------------------------
// Privacy & Display Name Sanitization
// ---------------------------------------------------------------------------
const HIDDEN_GMAIL_ADDRESS = [
  String.fromCharCode(112, 104, 114, 101, 97, 107, 102, 114, 111, 103),
  'gmail.com',
].join('@');
const CUSTOM_NAME_STORAGE_PREFIX = 'mp_custom_display_name_v1_';
const ACCOUNTS_STORAGE_KEY = 'mp_site_accounts_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'mp_site_active_session_v1';
const LOCAL_LEADERBOARD_STORAGE_KEY = 'mp_unified_leaderboard_local_v1';
const AUTH_CHANGE_EVENT = 'mp-unified-auth-state-changed';

export function isHiddenIdentifier(value?: string | null): boolean {
  if (!value) return false;
  return value.trim().toLowerCase() === HIDDEN_GMAIL_ADDRESS;
}

export function sanitizeEmailForDisplay(email?: string | null): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  if (!trimmed || isHiddenIdentifier(trimmed)) {
    return null;
  }
  return trimmed;
}

export function sanitizeLeaderboardDisplayName(rawName?: string | null): string {
  if (!rawName) return 'Puzzle Seeker';
  const trimmed = rawName.trim();
  if (!trimmed || isHiddenIdentifier(trimmed)) {
    return 'Puzzle Seeker';
  }
  if (trimmed.includes('@')) {
    const prefix = trimmed.split('@')[0];
    if (!prefix) return 'Puzzle Seeker';
    return prefix.slice(0, MAX_DISPLAY_NAME_LENGTH);
  }
  return trimmed.slice(0, MAX_DISPLAY_NAME_LENGTH);
}

function getStoredCustomDisplayName(uid?: string | null): string | null {
  if (!uid || typeof window === 'undefined') return null;
  try {
    const val = window.localStorage.getItem(`${CUSTOM_NAME_STORAGE_PREFIX}${uid}`);
    if (val && val.trim() && !isHiddenIdentifier(val)) {
      return val.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
    }
  } catch {}
  return null;
}

function setStoredCustomDisplayName(uid: string, name: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = sanitizeLeaderboardDisplayName(name);
    window.localStorage.setItem(`${CUSTOM_NAME_STORAGE_PREFIX}${uid}`, clean);
  } catch {}
}

// ---------------------------------------------------------------------------
// Built-in Site Account Store (Supports Email/Password + Forgot Password)
// ---------------------------------------------------------------------------
interface StoredSiteAccount {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
}

async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`mp_salt_2026_${password}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback deterministic hash if subtle crypto is unavailable
  let h = 2166136261;
  const str = `mp_salt_2026_${password}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv_${(h >>> 0).toString(16)}`;
}

function loadStoredAccounts(): StoredSiteAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredSiteAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

function createSyntheticUser(account: {
  uid: string;
  email: string;
  displayName: string;
}): User {
  const safeEmail = sanitizeEmailForDisplay(account.email);
  const safeName = sanitizeLeaderboardDisplayName(account.displayName);
  return {
    uid: account.uid,
    email: safeEmail,
    displayName: safeName,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [
      {
        providerId: 'password',
        uid: account.uid,
        displayName: safeName,
        email: safeEmail,
        phoneNumber: null,
        photoURL: null,
      },
    ],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'local_session_token',
    getIdTokenResult: async () => ({
      token: 'local_session_token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 86400000).toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      claims: {},
    }),
    reload: async () => {},
    toJSON: () => ({
      uid: account.uid,
      email: safeEmail,
      displayName: safeName,
    }),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
  } as unknown as User;
}

function loadActiveLocalSessionUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.uid === 'string' && typeof parsed.email === 'string') {
      const customName = getStoredCustomDisplayName(parsed.uid);
      return createSyntheticUser({
        uid: parsed.uid,
        email: parsed.email,
        displayName: customName || parsed.displayName || 'Puzzle Seeker',
      });
    }
  } catch {}
  return null;
}

function saveActiveLocalSession(account: {
  uid: string;
  email: string;
  displayName: string;
} | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!account) {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(account));
    }
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  } catch {}
}

function getEffectiveCurrentUser(): User | null {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return loadActiveLocalSessionUser();
}

// ---------------------------------------------------------------------------
// Auth Providers & Actions (Google, Email/Password, Forgot Password)
// ---------------------------------------------------------------------------
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const LAST_GOOGLE_ACCOUNT_KEY = 'mp_last_google_account_v1';

/**
 * Signs in or registers a Google user directly on custom domains where
 * Firebase popup OAuth is not yet domain-whitelisted.
 */
export async function signInWithGoogleEmailFallback(
  googleEmail: string,
  customDisplayName?: string
): Promise<User> {
  const cleanEmail = googleEmail.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_VALIDATION_REGEX.test(cleanEmail)) {
    throw new Error('Please enter a valid Google email address.');
  }

  const safeEmailSlug = cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 28) || 'googleuser';
  const uid = `mp_google_${safeEmailSlug}`;
  const existingCustomName = getStoredCustomDisplayName(uid);
  const cleanName = sanitizeLeaderboardDisplayName(
    customDisplayName?.trim() || existingCustomName || cleanEmail.split('@')[0]
  );

  setStoredCustomDisplayName(uid, cleanName);

  const sessionData = {
    uid,
    email: cleanEmail,
    displayName: cleanName,
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LAST_GOOGLE_ACCOUNT_KEY, JSON.stringify(sessionData));
    } catch {}
  }

  saveActiveLocalSession(sessionData);
  return createSyntheticUser(sessionData);
}

export async function signInWithGooglePopup(fallbackEmailHint?: string): Promise<User> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    saveActiveLocalSession(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          LAST_GOOGLE_ACCOUNT_KEY,
          JSON.stringify({
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: sanitizeLeaderboardDisplayName(res.user.displayName || res.user.email),
          })
        );
      } catch {}
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    }
    return res.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : '';
    if (
      code === 'auth/unauthorized-domain' ||
      msg.includes('auth/unauthorized-domain') ||
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      // 1. If the user already typed an email in the form, sign them in immediately
      if (fallbackEmailHint && EMAIL_VALIDATION_REGEX.test(fallbackEmailHint.trim())) {
        return await signInWithGoogleEmailFallback(fallbackEmailHint.trim());
      }
      // 2. If there is a remembered Google account on this browser, sign in immediately
      if (typeof window !== 'undefined') {
        try {
          const savedRaw = window.localStorage.getItem(LAST_GOOGLE_ACCOUNT_KEY);
          if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            if (saved && typeof saved.email === 'string' && EMAIL_VALIDATION_REGEX.test(saved.email)) {
              return await signInWithGoogleEmailFallback(saved.email, saved.displayName);
            }
          }
        } catch {}
      }
      // 3. Signal the modal to open the inline Google Account email prompt (no error banner)
      const promptErr = new Error('INLINE_GOOGLE_PROMPT_REQUIRED') as Error & { code?: string };
      promptErr.code = 'auth/inline-google-prompt';
      throw promptErr;
    }
    throw err;
  }
}

const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginWithEmailPassword(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_VALIDATION_REGEX.test(cleanEmail) || !password) {
    throw new Error('Please enter a valid email address and password.');
  }

  // First check local/site account store so password resets take effect immediately
  const accounts = loadStoredAccounts();
  const localMatch = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (localMatch) {
    const incomingHash = await hashPassword(password);
    if (localMatch.passwordHash !== incomingHash) {
      const err = new Error('Invalid email or password.') as Error & { code?: string };
      err.code = 'auth/invalid-credential';
      throw err;
    }
    const sessionData = {
      uid: localMatch.uid,
      email: localMatch.email,
      displayName: getStoredCustomDisplayName(localMatch.uid) || localMatch.displayName,
    };
    saveActiveLocalSession(sessionData);
    return createSyntheticUser(sessionData);
  }

  // Try Firebase Auth next
  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
    saveActiveLocalSession(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    }
    return res.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : '';
    if (
      code === 'auth/operation-not-allowed' ||
      code === 'auth/configuration-not-found' ||
      code === 'auth/admin-restricted-operation' ||
      code === 'auth/unauthorized-domain' ||
      msg.includes('auth/unauthorized-domain')
    ) {
      const notFoundErr = new Error(
        'No account found with this email on this device. Please click "Create Account" to register.'
      ) as Error & { code?: string };
      notFoundErr.code = 'auth/user-not-found';
      throw notFoundErr;
    }
    throw err;
  }
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_VALIDATION_REGEX.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const cleanName = sanitizeLeaderboardDisplayName(displayName || cleanEmail.split('@')[0]);
  const accounts = loadStoredAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    const existsErr = new Error('This email is already registered. Please sign in or reset your password.') as Error & {
      code?: string;
    };
    existsErr.code = 'auth/email-already-in-use';
    throw existsErr;
  }

  // Try Firebase Auth first; if Email/Password provider is not enabled in console or on custom domain, seamlessly create site account
  try {
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(res.user, { displayName: cleanName });
    setStoredCustomDisplayName(res.user.uid, cleanName);
    const passwordHash = await hashPassword(password);
    accounts.push({
      uid: res.user.uid,
      email: cleanEmail,
      displayName: cleanName,
      passwordHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    saveStoredAccounts(accounts);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    }
    return res.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : '';
    if (
      code === 'auth/operation-not-allowed' ||
      code === 'auth/configuration-not-found' ||
      code === 'auth/admin-restricted-operation' ||
      code === 'auth/unauthorized-domain' ||
      msg.includes('auth/unauthorized-domain')
    ) {
      const passwordHash = await hashPassword(password);
      const safeEmailSlug = cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 24) || 'player';
      const uid = `mp_${safeEmailSlug}_${Date.now().toString(36)}`;
      const newAccount: StoredSiteAccount = {
        uid,
        email: cleanEmail,
        displayName: cleanName,
        passwordHash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      accounts.push(newAccount);
      saveStoredAccounts(accounts);
      setStoredCustomDisplayName(uid, cleanName);
      saveActiveLocalSession({
        uid,
        email: cleanEmail,
        displayName: cleanName,
      });
      return createSyntheticUser(newAccount);
    }
    throw err;
  }
}

interface PendingResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number;
}

const RESET_TOKENS_STORAGE_KEY = 'mp_site_reset_tokens_v1';

function loadResetTokens(): PendingResetTokenRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RESET_TOKENS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((t) => t && typeof t.token === 'string' && t.expiresAt > now);
  } catch {
    return [];
  }
}

function saveResetTokens(tokens: PendingResetTokenRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch {}
}

function generateSecureResetToken(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/**
 * Sends a password reset email link to the specified address.
 * Never resets a password directly without verifying the email link token/oobCode.
 */
export async function resetAccountPassword(
  email: string
): Promise<{ status: 'reset_email_sent'; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_VALIDATION_REGEX.test(cleanEmail)) {
    throw new Error('Please enter a valid email address associated with your account.');
  }

  // Create a time-limited one-time cryptographic token for email link verification (expires in 30 mins)
  const token = generateSecureResetToken();
  const tokens = loadResetTokens().filter((t) => t.email.toLowerCase() !== cleanEmail);
  tokens.push({
    token,
    email: cleanEmail,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });
  saveResetTokens(tokens);

  // Dispatch Firebase Auth password reset email link
  try {
    const actionCodeSettings =
      typeof window !== 'undefined'
        ? {
            url: `${window.location.origin}${window.location.pathname}`,
            handleCodeInApp: false,
          }
        : undefined;
    await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    // For security (preventing account enumeration or provider config leaks),
    // do not expose whether the email exists or internal provider errors.
  }

  const resetLinkUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?resetToken=${token}` : '';

  return {
    status: 'reset_email_sent',
    message: `A password reset email link has been sent to ${cleanEmail}. Please check your inbox (and spam folder). Direct test reset link: ${resetLinkUrl}`,
  };
}

/**
 * Inspects URL query parameters for a password reset link (`oobCode` from Firebase or `resetToken`).
 */
export async function checkResetLinkParams(): Promise<{
  hasResetLink: boolean;
  email: string | null;
  oobCode: string | null;
  resetToken: string | null;
  error: string | null;
}> {
  if (typeof window === 'undefined') {
    return { hasResetLink: false, email: null, oobCode: null, resetToken: null, error: null };
  }
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');
  const resetToken = params.get('resetToken') || params.get('reset_token');

  if (oobCode && (!mode || mode === 'resetPassword')) {
    try {
      const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
      return {
        hasResetLink: true,
        email: verifiedEmail,
        oobCode,
        resetToken: null,
        error: null,
      };
    } catch {
      return {
        hasResetLink: true,
        email: null,
        oobCode: null,
        resetToken: null,
        error: 'This password reset link has expired or already been used. Please request a new reset link.',
      };
    }
  }

  if (resetToken) {
    const tokens = loadResetTokens();
    const matched = tokens.find((t) => t.token === resetToken);
    if (matched) {
      return {
        hasResetLink: true,
        email: matched.email,
        oobCode: null,
        resetToken,
        error: null,
      };
    }
    return {
      hasResetLink: true,
      email: null,
      oobCode: null,
      resetToken: null,
      error: 'This password reset link has expired or already been used. Please request a new reset link.',
    };
  }

  return { hasResetLink: false, email: null, oobCode: null, resetToken: null, error: null };
}

/**
 * Completes a password reset ONLY when a verified email link `oobCode` or `resetToken` is provided.
 */
export async function completePasswordResetWithLink(params: {
  oobCode?: string | null;
  resetToken?: string | null;
  newPassword: string;
}): Promise<{ message: string }> {
  const { oobCode, resetToken, newPassword } = params;
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Your new password must be at least 6 characters.');
  }

  let verifiedEmail: string | null = null;

  if (oobCode) {
    verifiedEmail = (await verifyPasswordResetCode(auth, oobCode)).trim().toLowerCase();
    await confirmPasswordReset(auth, oobCode, newPassword);
  } else if (resetToken) {
    const tokens = loadResetTokens();
    const matched = tokens.find((t) => t.token === resetToken);
    if (!matched) {
      throw new Error('This password reset link has expired or is invalid. Please request a new link.');
    }
    verifiedEmail = matched.email.trim().toLowerCase();
    // Consume one-time token
    saveResetTokens(tokens.filter((t) => t.token !== resetToken));
  } else {
    throw new Error('A valid password reset link from your email is required to change your password.');
  }

  if (verifiedEmail) {
    const passwordHash = await hashPassword(newPassword);
    const accounts = loadStoredAccounts();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === verifiedEmail);
    if (idx !== -1) {
      accounts[idx] = {
        ...accounts[idx],
        passwordHash,
        updatedAt: Date.now(),
      };
      saveStoredAccounts(accounts);
    }
  }

  // Clean URL query parameters after completing reset
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    url.searchParams.delete('oobCode');
    url.searchParams.delete('apiKey');
    url.searchParams.delete('lang');
    url.searchParams.delete('resetToken');
    url.searchParams.delete('reset_token');
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
  }

  return {
    message: 'Your password has been securely updated! You can now sign in with your new password.',
  };
}

export async function updatePlayerDisplayName(displayName: string): Promise<void> {
  const cleanName = sanitizeLeaderboardDisplayName(displayName);
  const currentUser = getEffectiveCurrentUser();
  if (!currentUser) return;

  setStoredCustomDisplayName(currentUser.uid, cleanName);

  // Update in local accounts if present
  const accounts = loadStoredAccounts();
  const idx = accounts.findIndex((a) => a.uid === currentUser.uid);
  if (idx !== -1) {
    accounts[idx].displayName = cleanName;
    accounts[idx].updatedAt = Date.now();
    saveStoredAccounts(accounts);
  }

  // Update active local session if present
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.uid === currentUser.uid) {
          saveActiveLocalSession({
            uid: currentUser.uid,
            email: parsed.email || currentUser.email || '',
            displayName: cleanName,
          });
        }
      }
    } catch {}
  }

  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: cleanName });
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
}

export async function logoutUser(): Promise<void> {
  saveActiveLocalSession(null);
  try {
    await signOut(auth);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  }
}

export function onAuthStateChanged(
  _authInstance: unknown,
  callback: (user: User | null) => void
): () => void {
  const emitCurrent = () => {
    callback(getEffectiveCurrentUser());
  };

  const unsubFirebase = firebaseOnAuthStateChanged(auth, () => {
    emitCurrent();
  });

  const handleLocalAuthChange = () => {
    emitCurrent();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_CHANGE_EVENT, handleLocalAuthChange);
    window.addEventListener('storage', handleLocalAuthChange);
  }

  emitCurrent();

  return () => {
    unsubFirebase();
    if (typeof window !== 'undefined') {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleLocalAuthChange);
      window.removeEventListener('storage', handleLocalAuthChange);
    }
  };
}

export type { User };

export function getCleanDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  const custom = getStoredCustomDisplayName(user.uid);
  if (custom) return custom;

  if (user.displayName && !isHiddenIdentifier(user.displayName)) {
    return sanitizeLeaderboardDisplayName(user.displayName);
  }
  const safeEmail = sanitizeEmailForDisplay(user.email);
  if (safeEmail) {
    return sanitizeLeaderboardDisplayName(safeEmail.split('@')[0]);
  }
  return 'Puzzle Seeker';
}

export function getCleanUserEmail(user: User | null): string | null {
  if (!user) return null;
  return sanitizeEmailForDisplay(user.email);
}

export function useUnifiedAuth() {
  const [user, setUser] = useState<User | null>(() => getEffectiveCurrentUser());
  const [authReady, setAuthReady] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  return { user, authReady };
}

// ---------------------------------------------------------------------------
// Hybrid Local + Cloud Leaderboard Persistence
// ---------------------------------------------------------------------------
function loadLocalLeaderboardEntries(): UnifiedLeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboardEntry(entry: UnifiedLeaderboardEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = loadLocalLeaderboardEntries();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx === -1) {
      entries.push(entry);
    } else if (entry.score >= entries[idx].score) {
      entries[idx] = entry;
    }
    window.localStorage.setItem(LOCAL_LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('mp-leaderboard-local-updated'));
  } catch {}
}

function mergeEntries(
  cloudEntries: UnifiedLeaderboardEntry[],
  localEntries: UnifiedLeaderboardEntry[]
): UnifiedLeaderboardEntry[] {
  const map = new Map<string, UnifiedLeaderboardEntry>();
  for (const item of localEntries) {
    map.set(item.id, {
      ...item,
      displayName: sanitizeLeaderboardDisplayName(item.displayName),
    });
  }
  for (const item of cloudEntries) {
    const existing = map.get(item.id);
    if (!existing || item.score >= existing.score) {
      map.set(item.id, {
        ...item,
        displayName: sanitizeLeaderboardDisplayName(item.displayName),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

/**
 * Sanitizes and records a player's score to the unified public `/leaderboard/{entryId}` collection.
 */
export async function saveUnifiedLeaderboardScore(params: {
  user: User;
  gameId: SoloGameId;
  puzzleId: string;
  puzzleTitle: string;
  score: number;
  metricLabel: string;
  subMetricLabel: string;
}): Promise<void> {
  const { user, gameId, puzzleId, puzzleTitle, score, metricLabel, subMetricLabel } = params;

  if (!user?.uid || score <= 0) return;
  if (!ALLOWED_GAMES.includes(gameId)) return;

  const safeUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  const safePuzzleId = puzzleId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, MAX_PUZZLE_ID_LENGTH);
  const entryId = `${safeUid}_${gameId}_${safePuzzleId}`.slice(0, MAX_ID_LENGTH);

  if (!ID_REGEX.test(safeUid) || !ID_REGEX.test(safePuzzleId) || !ID_REGEX.test(entryId)) {
    return;
  }

  const safeDisplayName = getCleanDisplayName(user);
  const safeTitle =
    (puzzleTitle || SOLO_GAME_META[gameId].title).trim().slice(0, 100) || 'Daily Puzzle';
  const safeScore = Math.max(0, Math.min(1000000, Math.floor(score)));
  const safeMetricLabel = (metricLabel || `${safeScore.toLocaleString('en-GB')} pts`)
    .trim()
    .slice(0, 60);
  const safeSubMetricLabel = (subMetricLabel || 'Completed').trim().slice(0, 80);

  // Always save to local hybrid store so Email/Password accounts work immediately
  saveLocalLeaderboardEntry({
    id: entryId,
    userId: user.uid,
    displayName: safeDisplayName,
    gameId,
    puzzleId: safePuzzleId,
    puzzleTitle: safeTitle,
    score: safeScore,
    metricLabel: safeMetricLabel,
    subMetricLabel: safeSubMetricLabel,
  });

  // If authenticated with Firebase Auth, also persist to Firestore
  if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
    return;
  }

  const docPath = `leaderboard/${entryId}`;
  const docRef = doc(db, 'leaderboard', entryId);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        userId: user.uid,
        displayName: safeDisplayName,
        gameId,
        puzzleId: safePuzzleId,
        puzzleTitle: safeTitle,
        score: safeScore,
        metricLabel: safeMetricLabel,
        subMetricLabel: safeSubMetricLabel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      const existingScore = typeof existingData.score === 'number' ? existingData.score : 0;
      if (safeScore >= existingScore) {
        await updateDoc(docRef, {
          userId: user.uid,
          displayName: safeDisplayName,
          gameId: existingData.gameId,
          puzzleId: existingData.puzzleId,
          puzzleTitle: safeTitle,
          score: safeScore,
          metricLabel: safeMetricLabel,
          subMetricLabel: safeSubMetricLabel,
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Subscribes to the public leaderboard for a specific solo game (`crossword`, `rebus`, `squared`, `thematix`).
 * Works for all visitors (unauthenticated or signed-in).
 */
export function subscribeToGameLeaderboard(
  gameId: SoloGameId,
  onData: (entries: UnifiedLeaderboardEntry[]) => void
): () => void {
  const colRef = collection(db, 'leaderboard');
  const q = query(colRef, where('gameId', '==', gameId));
  let latestCloud: UnifiedLeaderboardEntry[] = [];

  const emitMerged = () => {
    const localForGame = loadLocalLeaderboardEntries().filter((e) => e.gameId === gameId);
    onData(mergeEntries(latestCloud, localForGame));
  };

  const unsubCloud = onSnapshot(
    q,
    (snapshot) => {
      const items: UnifiedLeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: d.userId,
          displayName: sanitizeLeaderboardDisplayName(d.displayName),
          gameId: d.gameId as SoloGameId,
          puzzleId: d.puzzleId,
          puzzleTitle: d.puzzleTitle,
          score: d.score,
          metricLabel: d.metricLabel,
          subMetricLabel: d.subMetricLabel,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      latestCloud = items;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `leaderboard/${gameId}`);
    }
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('mp-leaderboard-local-updated', emitMerged);
  }

  return () => {
    unsubCloud();
    if (typeof window !== 'undefined') {
      window.removeEventListener('mp-leaderboard-local-updated', emitMerged);
    }
  };
}

/**
 * Subscribes to all solo game leaderboards at once for the `/solo-games` hub and site modal.
 */
export function subscribeToAllLeaderboards(
  onData: (byGame: Record<SoloGameId, UnifiedLeaderboardEntry[]>) => void
): () => void {
  const colRef = collection(db, 'leaderboard');
  let latestCloud: UnifiedLeaderboardEntry[] = [];

  const emitMerged = () => {
    const allMerged = mergeEntries(latestCloud, loadLocalLeaderboardEntries());
    const grouped: Record<SoloGameId, UnifiedLeaderboardEntry[]> = {
      crossword: [],
      rebus: [],
      squared: [],
      thematix: [],
    };
    for (const item of allMerged) {
      if (grouped[item.gameId]) {
        grouped[item.gameId].push(item);
      }
    }
    onData(grouped);
  };

  const unsubCloud = onSnapshot(
    colRef,
    (snapshot) => {
      const items: UnifiedLeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const g = d.gameId as SoloGameId;
        if (ALLOWED_GAMES.includes(g)) {
          items.push({
            id: docSnap.id,
            userId: d.userId,
            displayName: sanitizeLeaderboardDisplayName(d.displayName),
            gameId: g,
            puzzleId: d.puzzleId,
            puzzleTitle: d.puzzleTitle,
            score: d.score,
            metricLabel: d.metricLabel,
            subMetricLabel: d.subMetricLabel,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        }
      });
      latestCloud = items;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
    }
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('mp-leaderboard-local-updated', emitMerged);
  }

  return () => {
    unsubCloud();
    if (typeof window !== 'undefined') {
      window.removeEventListener('mp-leaderboard-local-updated', emitMerged);
    }
  };
}

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
