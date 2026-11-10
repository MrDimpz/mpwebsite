import { useEffect, useState } from 'react';

export interface InteractiveAdminAccount {
  id: string;
  username: string;
  password: string;
  isDefault?: boolean;
  createdAt: number;
  createdBy?: string;
}

export interface InteractiveStreamerUser {
  id: string;
  username: string; // normalized lowercase without @
  displayHandle: string; // formatted with leading @
  key: string; // format LIVE-xxxx-xxxx
  label?: string;
  createdAt: number;
  createdBy?: string;
}

export interface ActiveInteractiveStreamerSession {
  username: string;
  displayHandle: string;
  key: string;
  label?: string;
  loggedInAt: number;
  lastActivity: number;
}

const ADMINS_STORAGE_KEY = 'mp_interactive_admins_v1';
const USERS_STORAGE_KEY = 'mp_interactive_streamer_keys_v1';
const ACTIVE_STREAMER_KEY = 'mp_active_interactive_streamer_v1';
const ACTIVE_ADMIN_SESSION_KEY = 'mp_active_interactive_admin_session_v1';
const SYNC_EVENT_NAME = 'mp-interactive-auth-updated';

export const DEFAULT_ADMIN_USERNAME = 'MPAdmin';
export const DEFAULT_ADMIN_PASSWORD = 'MPPassword1';

export const LIVE_KEY_REGEX = /^LIVE-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

const DEFAULT_ADMINS: InteractiveAdminAccount[] = [
  {
    id: 'admin-default-mpadmin',
    username: DEFAULT_ADMIN_USERNAME,
    password: DEFAULT_ADMIN_PASSWORD,
    isDefault: true,
    createdAt: 1730000000000,
    createdBy: 'System',
  },
];

const DEFAULT_STREAMER_USERS: InteractiveStreamerUser[] = [
  {
    id: 'user-mrdimpz',
    username: 'mrdimpz',
    displayHandle: '@mrdimpz',
    key: 'LIVE-DIMP-2026',
    label: 'The Missing Piece Official',
    createdAt: 1730000000000,
    createdBy: DEFAULT_ADMIN_USERNAME,
  },
  {
    id: 'user-mindtipgames',
    username: 'mindtipgames',
    displayHandle: '@mindtipgames',
    key: 'LIVE-MIND-2026',
    label: 'MindTipGames Live Host',
    createdAt: 1730000000000,
    createdBy: DEFAULT_ADMIN_USERNAME,
  },
];

export function cleanTikTokHandle(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

export function formatTikTokHandle(raw: string): string {
  const clean = cleanTikTokHandle(raw);
  return clean ? `@${clean}` : '';
}

export function normalizeLiveKey(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase();
}

export function isValidLiveKeyFormat(raw: string): boolean {
  return LIVE_KEY_REGEX.test(normalizeLiveKey(raw));
}

export function generateLiveKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  };
  return `LIVE-${block()}-${block()}`;
}

function notifyAuthUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

export function getInteractiveAdmins(): InteractiveAdminAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ADMINS;
  try {
    const raw = window.localStorage.getItem(ADMINS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(DEFAULT_ADMINS));
      return DEFAULT_ADMINS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ADMINS;

    const list: InteractiveAdminAccount[] = parsed
      .filter((a: any) => a && typeof a.username === 'string' && typeof a.password === 'string')
      .map((a: any) => ({
        id: String(a.id || `admin-${a.username.toLowerCase()}`),
        username: String(a.username).trim(),
        password: String(a.password),
        isDefault:
          Boolean(a.isDefault) ||
          String(a.username).trim().toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase(),
        createdAt: Number(a.createdAt) || Date.now(),
        createdBy: a.createdBy ? String(a.createdBy) : undefined,
      }));

    // Ensure default admin MPAdmin / MPPassword1 is always present
    const hasDefault = list.some(
      (a) => a.username.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()
    );
    if (!hasDefault) {
      list.unshift(DEFAULT_ADMINS[0]);
      window.localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return DEFAULT_ADMINS;
  }
}

export function getInteractiveStreamerUsers(): InteractiveStreamerUser[] {
  if (typeof window === 'undefined') return DEFAULT_STREAMER_USERS;
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_STREAMER_USERS));
      return DEFAULT_STREAMER_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_STREAMER_USERS;

    return parsed
      .filter((u: any) => u && u.username && u.key)
      .map((u: any) => {
        const clean = cleanTikTokHandle(u.username);
        return {
          id: String(u.id || `user-${clean}`),
          username: clean,
          displayHandle: `@${clean}`,
          key: normalizeLiveKey(u.key),
          label: u.label ? String(u.label).trim() : undefined,
          createdAt: Number(u.createdAt) || Date.now(),
          createdBy: u.createdBy ? String(u.createdBy) : undefined,
        };
      })
      .filter((u) => u.username.length > 0 && isValidLiveKeyFormat(u.key));
  } catch {
    return DEFAULT_STREAMER_USERS;
  }
}

export function verifyInteractiveAdminLogin(
  usernameInput: string,
  passwordInput: string
): { ok: true; admin: InteractiveAdminAccount } | { ok: false; error: string } {
  const cleanUser = String(usernameInput || '').trim();
  const rawPass = String(passwordInput || '');

  if (!cleanUser || !rawPass) {
    return { ok: false, error: 'Please enter both admin username and password.' };
  }

  const admins = getInteractiveAdmins();
  const matched = admins.find(
    (a) => a.username.toLowerCase() === cleanUser.toLowerCase() && a.password === rawPass
  );

  if (!matched) {
    return { ok: false, error: 'Invalid admin username or password.' };
  }

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(
        ACTIVE_ADMIN_SESSION_KEY,
        JSON.stringify({
          username: matched.username,
          loggedInAt: Date.now(),
        })
      );
    } catch {}
  }

  return { ok: true, admin: matched };
}

export function addInteractiveAdmin(
  newUsername: string,
  newPassword: string,
  createdBy = DEFAULT_ADMIN_USERNAME
): { ok: true; admin: InteractiveAdminAccount; admins: InteractiveAdminAccount[] } | { ok: false; error: string } {
  const cleanUsername = String(newUsername || '').trim();
  const cleanPassword = String(newPassword || '').trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { ok: false, error: 'Admin username must be at least 3 characters.' };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    return {
      ok: false,
      error: 'Admin username may only contain letters, numbers, underscores, dots, or hyphens.',
    };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { ok: false, error: 'Admin password must be at least 4 characters.' };
  }

  const current = getInteractiveAdmins();
  const existsUsername = current.some(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (existsUsername) {
    return {
      ok: false,
      error: `An admin with username "${cleanUsername}" already exists. Usernames must be unique.`,
    };
  }

  const created: InteractiveAdminAccount = {
    id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    password: cleanPassword,
    isDefault: false,
    createdAt: Date.now(),
    createdBy,
  };

  const next = [...current, created];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(next));
    notifyAuthUpdated();
  }

  return { ok: true, admin: created, admins: next };
}

export function removeInteractiveAdmin(
  adminIdOrUsername: string
): { ok: true; admins: InteractiveAdminAccount[] } | { ok: false; error: string } {
  const current = getInteractiveAdmins();
  const target = current.find(
    (a) =>
      a.id === adminIdOrUsername ||
      a.username.toLowerCase() === String(adminIdOrUsername || '').toLowerCase()
  );

  if (!target) {
    return { ok: false, error: 'Admin account not found.' };
  }

  if (target.isDefault || target.username.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return { ok: false, error: 'The default MPAdmin account cannot be removed.' };
  }

  const next = current.filter((a) => a.id !== target.id);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(next));
    notifyAuthUpdated();
  }

  return { ok: true, admins: next };
}

export function addOrUpdateInteractiveStreamerUser(params: {
  username: string;
  key?: string;
  label?: string;
  createdBy?: string;
}): { ok: true; user: InteractiveStreamerUser; users: InteractiveStreamerUser[] } | { ok: false; error: string } {
  const cleanUser = cleanTikTokHandle(params.username);
  if (!cleanUser || cleanUser.length < 2) {
    return { ok: false, error: 'Please enter a valid TikTok @username (at least 2 characters).' };
  }

  const finalKey = params.key ? normalizeLiveKey(params.key) : generateLiveKey();
  if (!isValidLiveKeyFormat(finalKey)) {
    return {
      ok: false,
      error: 'Key must match the format LIVE-xxxx-xxxx (4 letters/numbers per block, e.g. LIVE-8F4K-2M9P).',
    };
  }

  const current = getInteractiveStreamerUsers();
  const existingIdx = current.findIndex((u) => u.username === cleanUser);

  const userRecord: InteractiveStreamerUser = {
    id: existingIdx >= 0 ? current[existingIdx].id : `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUser,
    displayHandle: `@${cleanUser}`,
    key: finalKey,
    label: params.label?.trim() || undefined,
    createdAt: Date.now(),
    createdBy: params.createdBy || DEFAULT_ADMIN_USERNAME,
  };

  const next = [...current];
  if (existingIdx >= 0) {
    next[existingIdx] = userRecord;
  } else {
    next.unshift(userRecord);
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
    notifyAuthUpdated();
  }

  return { ok: true, user: userRecord, users: next };
}

export function removeInteractiveStreamerUser(
  usernameOrId: string
): { ok: true; users: InteractiveStreamerUser[] } | { ok: false; error: string } {
  const clean = cleanTikTokHandle(usernameOrId);
  const current = getInteractiveStreamerUsers();
  const next = current.filter((u) => u.id !== usernameOrId && u.username !== clean);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
    notifyAuthUpdated();
  }

  return { ok: true, users: next };
}

export function validateInteractiveStreamerKey(
  usernameInput: string,
  keyInput: string
): { ok: true; user: InteractiveStreamerUser; session: ActiveInteractiveStreamerSession } | { ok: false; error: string } {
  const cleanUser = cleanTikTokHandle(usernameInput);
  const normKey = normalizeLiveKey(keyInput);

  if (!cleanUser) {
    return { ok: false, error: 'Please enter your TikTok @username.' };
  }
  if (!normKey) {
    return { ok: false, error: 'Please enter your LIVE-xxxx-xxxx access key.' };
  }
  if (!isValidLiveKeyFormat(normKey)) {
    return {
      ok: false,
      error: 'Invalid key format. Keys must be in the format LIVE-xxxx-xxxx.',
    };
  }

  const users = getInteractiveStreamerUsers();
  const matched = users.find(
    (u) => u.username === cleanUser && normalizeLiveKey(u.key) === normKey
  );

  if (!matched) {
    return {
      ok: false,
      error: `Invalid @username or LIVE-xxxx-xxxx key. Ask the site admin to generate a key for @${cleanUser}.`,
    };
  }

  const session: ActiveInteractiveStreamerSession = {
    username: matched.username,
    displayHandle: matched.displayHandle,
    key: matched.key,
    label: matched.label,
    loggedInAt: Date.now(),
    lastActivity: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(ACTIVE_STREAMER_KEY, JSON.stringify(session));
      window.localStorage.setItem(ACTIVE_STREAMER_KEY, JSON.stringify(session));
    } catch {}
    notifyAuthUpdated();
  }

  return { ok: true, user: matched, session };
}

export function getActiveInteractiveStreamerSession(): ActiveInteractiveStreamerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      window.sessionStorage.getItem(ACTIVE_STREAMER_KEY) ||
      window.localStorage.getItem(ACTIVE_STREAMER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveInteractiveStreamerSession;
    if (!parsed || !parsed.username || !parsed.key) return null;

    // Verify that the user + key is still authorized in the store
    const users = getInteractiveStreamerUsers();
    const stillValid = users.some(
      (u) =>
        u.username === cleanTikTokHandle(parsed.username) &&
        normalizeLiveKey(u.key) === normalizeLiveKey(parsed.key)
    );
    if (!stillValid) {
      clearActiveInteractiveStreamerSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setActiveInteractiveStreamerSession(user: InteractiveStreamerUser): ActiveInteractiveStreamerSession {
  const session: ActiveInteractiveStreamerSession = {
    username: user.username,
    displayHandle: user.displayHandle,
    key: user.key,
    label: user.label,
    loggedInAt: Date.now(),
    lastActivity: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(ACTIVE_STREAMER_KEY, JSON.stringify(session));
      window.localStorage.setItem(ACTIVE_STREAMER_KEY, JSON.stringify(session));
    } catch {}
    notifyAuthUpdated();
  }
  return session;
}

export function clearActiveInteractiveStreamerSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ACTIVE_STREAMER_KEY);
    window.localStorage.removeItem(ACTIVE_STREAMER_KEY);
  } catch {}
  notifyAuthUpdated();
}

export function useInteractiveAuthStore() {
  const [admins, setAdmins] = useState<InteractiveAdminAccount[]>(() => getInteractiveAdmins());
  const [users, setUsers] = useState<InteractiveStreamerUser[]>(() => getInteractiveStreamerUsers());
  const [activeStreamer, setActiveStreamer] = useState<ActiveInteractiveStreamerSession | null>(() =>
    getActiveInteractiveStreamerSession()
  );

  useEffect(() => {
    const refresh = () => {
      setAdmins(getInteractiveAdmins());
      setUsers(getInteractiveStreamerUsers());
      setActiveStreamer(getActiveInteractiveStreamerSession());
    };
    window.addEventListener(SYNC_EVENT_NAME, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return {
    admins,
    users,
    activeStreamer,
  };
}
