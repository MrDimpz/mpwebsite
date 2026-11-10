import React, { useState, useEffect } from 'react';
import {
  Trophy,
  LogIn,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Crown,
  Medal,
  Sparkles,
  Edit3,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import {
  User,
  SoloGameId,
  SOLO_GAME_META,
  ALLOWED_GAMES,
  UnifiedLeaderboardEntry,
  signInWithGooglePopup,
  loginWithEmailPassword,
  registerWithEmailPassword,
  resetAccountPassword,
  checkResetLinkParams,
  completePasswordResetWithLink,
  updatePlayerDisplayName,
  logoutUser,
  subscribeToAllLeaderboards,
  getCleanDisplayName,
  getCleanUserEmail,
  MAX_DISPLAY_NAME_LENGTH,
} from '@/lib/unified-game-auth';

interface UnifiedLeaderboardPanelProps {
  initialGameId?: SoloGameId;
  currentUser: User | null;
  onRequestSignIn?: () => void;
  compact?: boolean;
}

export const UnifiedLeaderboardPanel: React.FC<UnifiedLeaderboardPanelProps> = ({
  initialGameId = 'crossword',
  currentUser,
  onRequestSignIn,
  compact = false,
}) => {
  const [selectedGame, setSelectedGame] = useState<SoloGameId>(initialGameId);
  const [leaderboards, setLeaderboards] = useState<Record<SoloGameId, UnifiedLeaderboardEntry[]>>({
    crossword: [],
    rebus: [],
    squared: [],
    thematix: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSelectedGame(initialGameId);
  }, [initialGameId]);

  useEffect(() => {
    const unsub = subscribeToAllLeaderboards((grouped) => {
      setLeaderboards(grouped);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const currentEntries = leaderboards[selectedGame] || [];
  const meta = SOLO_GAME_META[selectedGame];

  return (
    <div className="w-full rounded-2xl bg-[#1A052A] border-2 border-[#D4A437]/70 text-[#F5F3F7] p-4 sm:p-6 shadow-[0_18px_45px_rgba(20,3,36,0.45)] space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#F6C915]/15 border border-[#F6C915]/40 flex items-center justify-center text-[#F6C915] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#F6C915] font-bold">
                PUBLIC VISITOR LEADERBOARDS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono text-emerald-300">
                ● LIVE
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {meta.number} / {meta.title}
            </h3>
          </div>
        </div>

        {!currentUser && onRequestSignIn && (
          <button
            type="button"
            onClick={onRequestSignIn}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F6C915] hover:bg-[#FFE047] text-[#1D0830] font-bold text-xs transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Post Scores</span>
          </button>
        )}
      </div>

      {/* 4 Solo Game Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-xl bg-black/35 border border-white/10">
        {ALLOWED_GAMES.map((gId) => {
          const gMeta = SOLO_GAME_META[gId];
          const count = leaderboards[gId]?.length || 0;
          const isActive = selectedGame === gId;
          return (
            <button
              key={gId}
              type="button"
              onClick={() => setSelectedGame(gId)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#F6C915] text-[#1D0830] shadow-xs'
                  : 'text-[#D6CBE2] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="truncate">
                {gMeta.number}. {gMeta.shortTitle}
              </span>
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive ? 'bg-[#1D0830]/15 text-[#1D0830]' : 'bg-white/10 text-[#B9A8CC]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Entries List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#B9A8CC] px-1">
          <span>{meta.subtitle}</span>
          <span className="font-mono text-[11px]">Sorted by Highest Score</span>
        </div>

        {loading ? (
          <div className="p-6 rounded-xl bg-black/25 border border-white/10 text-center text-xs text-[#D6CBE2]">
            Loading live {meta.shortTitle} leaderboard...
          </div>
        ) : currentEntries.length === 0 ? (
          <div className="p-6 rounded-xl bg-black/25 border border-white/10 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-[#F6C915] mx-auto opacity-80" />
            <p className="text-sm font-bold text-white">
              No scores recorded on the {meta.shortTitle} board yet!
            </p>
            <p className="text-xs text-[#B9A8CC] max-w-md mx-auto">
              Sign in with Google or Email &amp; Password and play {meta.shortTitle} to claim the #1 spot on the public leaderboard.
            </p>
          </div>
        ) : (
          <div
            className={`space-y-1.5 overflow-y-auto pr-1 ${
              compact ? 'max-h-64' : 'max-h-80'
            }`}
          >
            {currentEntries.slice(0, 50).map((entry, idx) => {
              const isMe = Boolean(currentUser && entry.userId === currentUser.uid);
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                    isMe
                      ? 'bg-[#351058] border-[#F6C915]/70 shadow-xs'
                      : 'bg-white/6 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 bg-black/35 border border-white/10">
                      {idx === 0 ? (
                        <Crown className="w-4 h-4 text-[#F6C915]" />
                      ) : idx === 1 ? (
                        <Medal className="w-4 h-4 text-slate-300" />
                      ) : idx === 2 ? (
                        <Medal className="w-4 h-4 text-amber-600" />
                      ) : (
                        <span className="text-[#D6CBE2]">#{idx + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate text-xs sm:text-sm">
                          {entry.displayName}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded bg-[#F6C915] text-[#1D0830] font-mono font-bold text-[10px] shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#B9A8CC] truncate font-mono">
                        {entry.puzzleTitle} · {entry.subMetricLabel}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-extrabold text-sm text-[#F6C915] tabular-nums">
                      {entry.metricLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  initialGameId?: SoloGameId;
  initialTab?: 'account' | 'leaderboards';
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  initialGameId = 'crossword',
  initialTab = 'account',
}) => {
  const [modalTab, setModalTab] = useState<'account' | 'leaderboards'>(initialTab);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset' | 'complete-reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      if (user) {
        setNewDisplayName(getCleanDisplayName(user));
      }
      // Check if user opened the site via a password reset link from their email
      checkResetLinkParams().then((info) => {
        if (info.hasResetLink) {
          setModalTab('account');
          if (info.error) {
            setAuthMode('reset');
            setErrorMsg(info.error);
          } else {
            setAuthMode('complete-reset');
            setResetOobCode(info.oobCode);
            setResetToken(info.resetToken);
            if (info.email) {
              setEmail(info.email);
            }
          }
        }
      });
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;

  const cleanEmail = getCleanUserEmail(user);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGooglePopup();
      setSuccessMsg('Signed in with Google! Your account is now active across The Missing Piece.');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authMode === 'complete-reset') {
      if (password.length < 6) {
        setErrorMsg('Please enter a new password of at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }

      setSubmitting(true);
      try {
        const result = await completePasswordResetWithLink({
          oobCode: resetOobCode,
          resetToken,
          newPassword: password,
        });
        setSuccessMsg(result.message);
        setPassword('');
        setConfirmPassword('');
        setResetOobCode(null);
        setResetToken(null);
        setAuthMode('login');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not complete password reset.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (authMode === 'reset') {
      setSubmitting(true);
      try {
        const result = await resetAccountPassword(email);
        setSuccessMsg(result.message);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not send password reset email.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Please enter a valid email and a password of at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (authMode === 'register') {
        await registerWithEmailPassword(
          email,
          password,
          displayName.slice(0, MAX_DISPLAY_NAME_LENGTH) || 'Puzzle Seeker'
        );
        setSuccessMsg('Account created! You are now signed in across The Missing Piece.');
      } else {
        await loginWithEmailPassword(email, password);
        setSuccessMsg('Signed in! Your profile and scores are synced across The Missing Piece.');
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg('Invalid email or password. Please check your credentials or use Forgot Password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Switch to Sign In or use Forgot Password.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;
    setSubmitting(true);
    try {
      await updatePlayerDisplayName(newDisplayName);
      setEditingName(false);
      setSuccessMsg('Display name updated!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update display name.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#2B0948] to-[#160326] border-2 border-[#D4A437] p-4 sm:p-6 text-[#F5F3F7] shadow-[0_24px_60px_rgba(0,0,0,0.85)] space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand-logo.png"
              alt="The Missing Piece"
              className="w-9 h-9 rounded-full object-contain shrink-0"
            />
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#F6C915]">
                The Missing Piece · Member Account &amp; Leaderboards
              </h2>
              <p className="text-xs text-[#D6CBE2]">
                One unified login across the main site, interactive games &amp; solo puzzles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D6CBE2] hover:text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Switcher: Account / Login vs Public Leaderboards */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setModalTab('account')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modalTab === 'account'
                ? 'bg-[#F6C915] text-[#1D0830]'
                : 'text-[#D6CBE2] hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{user ? `Account (${getCleanDisplayName(user)})` : 'Sign In / Create Account'}</span>
          </button>
          <button
            type="button"
            onClick={() => setModalTab('leaderboards')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modalTab === 'leaderboards'
                ? 'bg-[#F6C915] text-[#1D0830]'
                : 'text-[#D6CBE2] hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All Game Leaderboards</span>
          </button>
        </div>

        {modalTab === 'leaderboards' ? (
          <UnifiedLeaderboardPanel
            initialGameId={initialGameId}
            currentUser={user}
            onRequestSignIn={() => setModalTab('account')}
            compact
          />
        ) : user && authMode !== 'complete-reset' ? (
          <div className="space-y-4">
            {/* Signed-in Profile Card */}
            <div className="p-4 rounded-xl bg-[#1E0533] border border-[#E6BE5A]/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>The Missing Piece Member Account Active</span>
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {getCleanDisplayName(user)}
                  </div>
                  {cleanEmail && (
                    <div className="text-xs text-[#B9A8CC] font-mono">{cleanEmail}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewDisplayName(getCleanDisplayName(user));
                      setEditingName((prev) => !prev);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F6C915] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => logoutUser()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-semibold text-rose-200 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {editingName && (
                <form onSubmit={handleSaveDisplayName} className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    maxLength={MAX_DISPLAY_NAME_LENGTH}
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Enter public leaderboard name"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#F6C915]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F6C915] text-[#1D0830] font-bold text-xs cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              {successMsg && (
                <div className="text-xs text-emerald-300 font-medium">{successMsg}</div>
              )}
            </div>

            {/* Embedded Leaderboard Preview */}
            <UnifiedLeaderboardPanel
              initialGameId={initialGameId}
              currentUser={user}
              compact
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* One-Click Google Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white text-[#1D0830] font-extrabold text-sm shadow-md hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 text-[#4B1276]" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#9E8BB5]">
              <div className="flex-1 h-px bg-white/10" />
              <span>or use Email &amp; Password</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Login / Register / Forgot Password Segmented Switch */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/35 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#F6C915] text-[#1D0830]'
                    : 'text-[#D6CBE2] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#F6C915] text-[#1D0830]'
                    : 'text-[#D6CBE2] hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('reset');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  authMode === 'reset' || authMode === 'complete-reset'
                    ? 'bg-[#F6C915] text-[#1D0830]'
                    : 'text-[#D6CBE2] hover:text-white'
                }`}
              >
                Forgot Password
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email / Password / Reset Link Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs text-[#D6CBE2] mb-1">
                    Public Leaderboard Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#9E8BB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={MAX_DISPLAY_NAME_LENGTH}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Puzzle Seeker"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authMode !== 'complete-reset' && (
                <div>
                  <label className="block text-xs text-[#D6CBE2] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9E8BB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seeker@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authMode === 'reset' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D6CBE2] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#F6C915] shrink-0 mt-0.5" />
                  <span>
                    For your account security, we will send a one-time password reset link to your email address. You can set a new password only after opening that link.
                  </span>
                </div>
              )}

              {(authMode === 'login' || authMode === 'register' || authMode === 'complete-reset') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-[#D6CBE2]">
                      {authMode === 'complete-reset'
                        ? 'New Password (min. 6 characters)'
                        : 'Password (min. 6 characters)'}
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('reset');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-semibold text-[#F6C915] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9E8BB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authMode === 'complete-reset' && (
                <div>
                  <label className="block text-xs text-[#D6CBE2] mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#9E8BB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-400/40 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-b from-[#FFE566] to-[#E5B012] text-[#1D0830] font-extrabold text-xs tracking-wide hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? 'Please wait...'
                  : authMode === 'register'
                    ? 'Create Account & Sync Across The Missing Piece'
                    : authMode === 'reset'
                      ? 'Send Password Reset Link'
                      : authMode === 'complete-reset'
                        ? 'Save New Password'
                        : 'Sign In with Email'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
