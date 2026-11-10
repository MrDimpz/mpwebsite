import React, { useState, useEffect } from 'react';
import {
  Trophy,
  LogIn,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Crown,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import {
  User,
  HighScoreRecord,
  signInWithGooglePopup,
  signInWithGoogleEmailFallback,
  loginWithEmailPassword,
  registerWithEmailPassword,
  resetAccountPassword,
  checkResetLinkParams,
  completePasswordResetWithLink,
  logoutUser,
  subscribeToGlobalHighScores,
  getCleanDisplayName,
  getCleanUserEmail,
  MAX_DISPLAY_NAME_LENGTH,
} from '../utils/firebase';
import { UnifiedLeaderboardPanel } from '@/components/solo-games/unified-auth-modal';

interface AuthHighScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  highScores: HighScoreRecord[];
  currentScore: number;
  currentPuzzleTitle: string;
}

export const AuthHighScoresModal: React.FC<AuthHighScoresModalProps> = ({
  isOpen,
  onClose,
  user,
  highScores,
  currentScore,
  currentPuzzleTitle,
}) => {
  const [viewTab, setViewTab] = useState<'leaderboard' | 'account'>('leaderboard');
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'reset' | 'complete-reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showGoogleEmailSheet, setShowGoogleEmailSheet] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [globalSquaredScores, setGlobalSquaredScores] = useState<HighScoreRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setShowGoogleEmailSheet(false);
    const unsub = subscribeToGlobalHighScores((records) => {
      setGlobalSquaredScores(records);
    });
    checkResetLinkParams().then((info) => {
      if (info.hasResetLink) {
        setViewTab('account');
        if (info.error) {
          setAuthTab('reset');
          setErrorMsg(info.error);
        } else {
          setAuthTab('complete-reset');
          setResetOobCode(info.oobCode);
          setResetToken(info.resetToken);
          if (info.email) {
            setEmail(info.email);
          }
        }
      }
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanEmail = getCleanUserEmail(user);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGooglePopup(email);
      setShowGoogleEmailSheet(false);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/inline-google-prompt') {
        setGoogleEmailInput(email);
        setGoogleNameInput(displayName);
        setShowGoogleEmailSheet(true);
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleEmailSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogleEmailFallback(googleEmailInput, googleNameInput);
      setShowGoogleEmailSheet(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Please enter a valid Google email address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authTab === 'complete-reset') {
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
        setAuthTab('login');
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

    if (authTab === 'reset') {
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
      if (authTab === 'register') {
        await registerWithEmailPassword(
          email,
          password,
          displayName.slice(0, MAX_DISPLAY_NAME_LENGTH) || 'Puzzle Seeker'
        );
      } else {
        await loginWithEmailPassword(email, password);
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

  const bestOverallScore = highScores.length > 0 ? highScores[0].score : currentScore;
  const totalBoardsRecorded = highScores.length;
  const featuredFoundCount = highScores.filter((h) => h.foundFeatured).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#2B0948] to-[#170329] border-2 border-[#D4A437] p-5 sm:p-6 text-[#F5F3F7] shadow-[0_24px_60px_rgba(0,0,0,0.85)] space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#F6C915] shrink-0" />
            <div>
              <h2 className="font-display font-extrabold text-lg text-[#F6C915]">
                Squared Leaderboards &amp; Member Account
              </h2>
              <p className="text-xs text-[#D6CBE2]">
                Unified Google &amp; Email login across The Missing Piece
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-[#D6CBE2] hover:text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Switcher: Visitor Leaderboard vs Account / Sign In */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewTab('leaderboard')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'leaderboard'
                ? 'bg-[#F6C915] text-[#1D0830]'
                : 'text-[#D6CBE2] hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Global Leaderboards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewTab('account')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'account'
                ? 'bg-[#F6C915] text-[#1D0830]'
                : 'text-[#D6CBE2] hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{user ? `Account (${getCleanDisplayName(user)})` : 'Sign In / Register'}</span>
          </button>
        </div>

        {viewTab === 'leaderboard' ? (
          <div className="space-y-4">
            {/* Multi-Game Unified Leaderboard Panel */}
            <UnifiedLeaderboardPanel
              initialGameId="squared"
              currentUser={user}
              onRequestSignIn={() => setViewTab('account')}
              compact
            />

            {/* Detailed Squared Boards Breakdown */}
            {globalSquaredScores.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-[#D6CBE2]">
                  <span className="font-semibold text-[#F5F3F7]">
                    Recent Squared Board Records (Visitor View)
                  </span>
                  <span className="font-mono text-[11px] text-[#B9A8CC]">
                    {globalSquaredScores.length} recorded
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {globalSquaredScores.slice(0, 25).map((rec, idx) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/8 border border-white/10 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[#F6C915] tabular-nums w-6 flex items-center">
                          {idx === 0 ? <Crown className="w-3.5 h-3.5 text-[#F6C915]" /> : `#${idx + 1}`}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#F5F3F7] truncate flex items-center gap-1.5">
                            <span>{rec.displayName}</span>
                            <span className="text-[#9E8BB5] font-mono text-[11px]">· {rec.puzzleId}</span>
                            {rec.foundFeatured && (
                              <span title="Found the ★ Missing Piece word!" className="inline-flex shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-[#F6C915]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#B9A8CC] font-mono tabular-nums">
                            Words: {rec.wordsFound}/{rec.totalWords} · Bonus: +{rec.bonusWordsCount}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-sm text-[#F6C915] tabular-nums shrink-0 ml-2">
                        {rec.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : user && authTab !== 'complete-reset' ? (
          <div className="space-y-4">
            {/* Signed-in Profile Strip */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1E0533] border border-[#E6BE5A]/35">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>The Missing Piece Member Account Active</span>
                </div>
                <div className="font-display font-bold text-sm text-[#F5F3F7] truncate mt-0.5">
                  {getCleanDisplayName(user)}
                </div>
                {cleanEmail && (
                  <div className="text-[11px] text-[#B9A8CC] font-mono truncate">
                    {cleanEmail}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => logoutUser()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F5F3F7] cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-3 gap-2.5 text-center bg-[#140223]/90 p-3 rounded-xl border border-white/10">
              <div>
                <div className="text-[11px] text-[#B9A8CC]">Personal Best</div>
                <div className="font-mono font-bold text-base text-[#F6C915] tabular-nums">
                  {bestOverallScore} pts
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#B9A8CC]">Boards Saved</div>
                <div className="font-mono font-bold text-base text-[#F5F3F7] tabular-nums">
                  {totalBoardsRecorded}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#B9A8CC]">★ Missing Pieces</div>
                <div className="font-mono font-bold text-base text-[#E6BE5A] tabular-nums">
                  {featuredFoundCount}
                </div>
              </div>
            </div>

            {/* Recorded High Scores List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#D6CBE2]">
                <span className="font-semibold text-[#F5F3F7]">
                  Your Personal Squared Boards
                </span>
                <span className="font-mono text-[11px] text-[#B9A8CC]">
                  Sorted by Score
                </span>
              </div>

              {highScores.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/25 border border-white/10 text-center text-xs text-[#B9A8CC]">
                  Uncover your first 4+ letter word on{' '}
                  <span className="text-[#F6C915] font-semibold">{currentPuzzleTitle}</span> to
                  automatically record your high score!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {highScores.map((rec, idx) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[#F6C915] tabular-nums w-5">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#F5F3F7] truncate flex items-center gap-1.5">
                            <span>{rec.puzzleId}</span>
                            {rec.foundFeatured && (
                              <span title="Found the ★ Missing Piece word!" className="inline-flex shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-[#F6C915]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#B9A8CC] font-mono tabular-nums">
                            Words: {rec.wordsFound}/{rec.totalWords} · Bonus: +{rec.bonusWordsCount}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-sm text-[#F6C915] tabular-nums shrink-0 ml-2">
                        {rec.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* One-Click Google Login */}
            {!showGoogleEmailSheet ? (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white text-[#1D0830] font-display font-bold text-sm shadow-md hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4 text-[#4B1276]" />
                <span>Continue with Google</span>
              </button>
            ) : (
              <form
                onSubmit={handleGoogleEmailSheetSubmit}
                className="p-4 rounded-xl bg-white/10 border-2 border-[#F6C915] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#F6C915] uppercase tracking-wider">
                    Continue with Google Account
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleEmailSheet(false)}
                    className="text-xs text-[#D6CBE2] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#D6CBE2] mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#D6CBE2] mb-1">
                      Leaderboard Name (optional)
                    </label>
                    <input
                      type="text"
                      maxLength={MAX_DISPLAY_NAME_LENGTH}
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="Puzzle Seeker"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-white text-[#1D0830] font-extrabold text-xs shadow-sm hover:bg-gray-100 cursor-pointer"
                >
                  {submitting ? 'Signing in...' : 'Sign In with Google'}
                </button>
              </form>
            )}

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
                  setAuthTab('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-[#F6C915] text-[#1D0830]'
                    : 'text-[#D6CBE2] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-[#F6C915] text-[#1D0830]'
                    : 'text-[#D6CBE2] hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('reset');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  authTab === 'reset' || authTab === 'complete-reset'
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
              {authTab === 'register' && (
                <div>
                  <label className="block text-xs text-[#D6CBE2] mb-1">
                    Player Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#9E8BB5] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={MAX_DISPLAY_NAME_LENGTH}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Puzzle Seeker"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authTab !== 'complete-reset' && (
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
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authTab === 'reset' && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D6CBE2] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#F6C915] shrink-0 mt-0.5" />
                  <span>
                    For your account security, we will send a one-time password reset link to your email address. You can set a new password only after opening that link.
                  </span>
                </div>
              )}

              {(authTab === 'login' || authTab === 'register' || authTab === 'complete-reset') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-[#D6CBE2]">
                      {authTab === 'complete-reset'
                        ? 'New Password (min. 6 characters)'
                        : 'Password (min. 6 characters)'}
                    </label>
                    {authTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('reset');
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
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>
              )}

              {authTab === 'complete-reset' && (
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
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#FFE566] to-[#E5B012] text-[#1D0830] font-display font-bold text-xs tracking-wide hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? 'Please wait...'
                  : authTab === 'register'
                    ? 'Create Account & Sync Scores'
                    : authTab === 'reset'
                      ? 'Send Password Reset Link'
                      : authTab === 'complete-reset'
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
