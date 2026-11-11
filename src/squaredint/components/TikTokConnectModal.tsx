import React, { useState, useEffect } from 'react';
import {
  Radio,
  AtSign,
  X,
  Unplug,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Wand2,
  Send,
  User,
  Key,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  validateInteractiveStreamerKey,
  setActiveInteractiveStreamerSession,
  clearActiveInteractiveStreamerSession,
  ActiveInteractiveStreamerSession,
} from '@/lib/interactive-key-auth';

interface TikTokConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  tiktokUsername: string;
  tiktokError: string | null;
  roomId?: string;
  onConnect: (username: string, isTestMode?: boolean) => void;
  onDisconnect: () => void;
  onOpenSimulator?: () => void;
  onSimulateChat?: (data: {
    uniqueId: string;
    nickname: string;
    comment: string;
    profilePictureUrl: string;
  }) => void;
  sampleUnfoundWord?: string;
  authorizedStreamer?: ActiveInteractiveStreamerSession | null;
  onStreamerAuthenticated?: (session: ActiveInteractiveStreamerSession) => void;
  onStreamerLogout?: () => void;
  onOpenAdminPortal?: () => void;
}

export const TikTokConnectModal: React.FC<TikTokConnectModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  tiktokUsername,
  tiktokError,
  roomId,
  onConnect,
  onDisconnect,
  onOpenSimulator,
  onSimulateChat,
  sampleUnfoundWord,
  authorizedStreamer,
  onStreamerAuthenticated,
  onStreamerLogout,
  onOpenAdminPortal,
}) => {
  // Streamer login gate state (autofills the @)
  const [authUsernameInput, setAuthUsernameInput] = useState('@');
  const [authKeyInput, setAuthKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifyingAuth, setVerifyingAuth] = useState(false);

  const [connectTab, setConnectTab] = useState<'live' | 'test'>('live');
  const [usernameInput, setUsernameInput] = useState(
    authorizedStreamer?.username || (tiktokUsername ? tiktokUsername.replace(/^@+/, '') : '')
  );
  const [testUsernameInput, setTestUsernameInput] = useState(
    authorizedStreamer?.username || 'test_streamer'
  );
  const [manualNickname, setManualNickname] = useState('Viewer_1');
  const [manualComment, setManualComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatProvider, setChatProvider] = useState<'tikfinity' | 'bettertok'>(() => {
    try {
      const saved = localStorage.getItem('chat_integration_provider');
      if (saved === 'bettertok' || saved === 'tikfinity') {
        return saved;
      }
    } catch {}
    return 'tikfinity';
  });

  const handleProviderChange = (provider: 'tikfinity' | 'bettertok') => {
    setChatProvider(provider);
    try {
      localStorage.setItem('chat_integration_provider', provider);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setAuthKeyInput('');
      setShowKey(false);
      if (authorizedStreamer?.username) {
        setUsernameInput(authorizedStreamer.username.replace(/^@+/, ''));
        setTestUsernameInput(authorizedStreamer.username.replace(/^@+/, ''));
      } else if (tiktokUsername) {
        setAuthUsernameInput(
          tiktokUsername.startsWith('@') ? tiktokUsername : `@${tiktokUsername}`
        );
      } else {
        setAuthUsernameInput('@');
      }
    }
  }, [isOpen, authorizedStreamer, tiktokUsername]);

  useEffect(() => {
    if (authorizedStreamer?.username) {
      const clean = authorizedStreamer.username.replace(/^@+/, '');
      setUsernameInput(clean);
      setTestUsernameInput(clean);
    } else if (tiktokUsername) {
      setUsernameInput(tiktokUsername.replace(/^@+/, ''));
    }
  }, [authorizedStreamer, tiktokUsername]);

  useEffect(() => {
    if (isConnected || tiktokError) {
      setIsSubmitting(false);
    }
  }, [isConnected, tiktokError]);

  if (!isOpen) return null;

  const ensureLeadingAt = (val: string) => {
    if (!val.startsWith('@')) {
      return '@' + val.replace(/^@+/, '');
    }
    return val;
  };

  const handleStreamerAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setVerifyingAuth(true);

    try {
      const res = validateInteractiveStreamerKey(authUsernameInput, authKeyInput);
      if (!res.ok) {
        setAuthError(res.error);
        return;
      }
      const session = setActiveInteractiveStreamerSession(res.user);
      setUsernameInput(session.username);
      setTestUsernameInput(session.username);
      setAuthKeyInput('');
      onStreamerAuthenticated?.(session);
    } finally {
      setVerifyingAuth(false);
    }
  };

  const handleLogoutClick = () => {
    clearActiveInteractiveStreamerSession();
    onDisconnect();
    onStreamerLogout?.();
  };

  const handleLiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = (usernameInput || authorizedStreamer?.username || '').trim().replace(/^@+/, '');
    if (!clean) return;
    setIsSubmitting(true);
    onConnect(clean, false);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean =
      (testUsernameInput || authorizedStreamer?.username || 'test_streamer')
        .trim()
        .replace(/^@+/, '') || 'test_streamer';
    setIsSubmitting(true);
    onConnect(clean, true);
  };

  const handleSendManualChat = (e?: React.FormEvent, customComment?: string) => {
    if (e) e.preventDefault();
    const text = (customComment ?? manualComment).trim();
    if (!text) return;
    const nick = manualNickname.trim().replace(/^@+/, '') || 'Viewer_1';
    const uid = nick.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const pfp = `https://i.pravatar.cc/150?u=${encodeURIComponent(nick)}`;

    if (onSimulateChat) {
      onSimulateChat({
        uniqueId: uid,
        nickname: nick,
        comment: text,
        profilePictureUrl: pfp,
      });
    }

    if (!customComment) {
      setManualComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#2B0948] to-[#170329] border-2 border-[#D4A437] p-6 text-[#F5F3F7] shadow-[0_24px_60px_rgba(0,0,0,0.85)] space-y-5 animate-pop max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                isConnected
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'bg-[#F6C915]/15 border-[#F6C915]/50 text-[#F6C915]'
              }`}
            >
              <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-extrabold text-lg text-[#F6C915] truncate">
                TikTok LIVE Interactive
              </h2>
              <p className="text-xs text-[#D6CBE2] truncate">
                {authorizedStreamer
                  ? `Authorized as ${authorizedStreamer.displayHandle}`
                  : 'Authorized Streamer Login Required'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {authorizedStreamer && (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-semibold text-rose-200 cursor-pointer transition-colors"
                title="Log out streamer session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-[#D6CBE2] hover:text-white cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gate 1: Require Registered @username + Streamer Key before Live Controls open */}
        {!authorizedStreamer ? (
          <form onSubmit={handleStreamerAuthSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-950/70 border border-[#F6C915]/40 flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#F6C915] shrink-0 mt-0.5" />
              <div className="text-xs text-[#E5DEEE] leading-relaxed">
                Log in with your registered TikTok <strong>@username</strong> and individual Admin-provided key (<strong>LIVE-XXXX-XXXX</strong>) to unlock the TikTok LIVE stream connector and interactive leaderboard.
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-400/40 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#E6BE5A] mb-1.5">
                Registered TikTok @Username
              </label>
              <input
                type="text"
                required
                value={authUsernameInput}
                onChange={(e) => setAuthUsernameInput(ensureLeadingAt(e.target.value))}
                onFocus={() => {
                  if (!authUsernameInput) setAuthUsernameInput('@');
                }}
                placeholder="@username"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs font-mono text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                autoComplete="off"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E6BE5A] mb-1.5">
                Admin-Provided Streamer Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={authKeyInput}
                  onChange={(e) => setAuthKeyInput(e.target.value)}
                  placeholder="LIVE-XXXX-XXXX"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs font-mono text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B9A8CC] hover:text-white p-1 cursor-pointer"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#B9A8CC] mt-1">
                Enter your individual key issued by the site administrator.
              </p>
            </div>

            <button
              type="submit"
              disabled={verifyingAuth}
              className="w-full py-3 rounded-xl bg-gradient-to-b from-[#FFE566] via-[#F6C915] to-[#D49B27] text-[#1D0830] font-display font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(246,201,21,0.35)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{verifyingAuth ? 'Verifying Key...' : 'Verify Key & Unlock TikTok Live'}</span>
            </button>

            {onOpenAdminPortal && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#B9A8CC]">
                <span>Are you a site administrator?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminPortal();
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-[#F6C915] hover:underline cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Admin Key Portal</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          <>
            {/* Connection Segmented Tabs */}
            {!isConnected && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-black/35 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setConnectTab('live')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    connectTab === 'live'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-xs'
                      : 'text-[#D6CBE2] hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live TikTok Stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConnectTab('test')}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    connectTab === 'test'
                      ? 'bg-[#F6C915] text-[#1D0830] shadow-xs'
                      : 'text-[#D6CBE2] hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Test Mode (Fake Connection)</span>
                </button>
              </div>
            )}

            {/* Active Connection Banner */}
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-400/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Stream Session Active</span>
                    </div>
                    <div className="font-display font-bold text-sm text-white truncate mt-0.5">
                      @{tiktokUsername.replace(/^@+/, '') || authorizedStreamer.username}
                    </div>
                    {roomId && (
                      <div className="text-[11px] text-emerald-200/80 font-mono truncate">
                        Room ID: {roomId}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onDisconnect}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-semibold text-rose-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    <Unplug className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>

                {/* Manual Chat Entry Form when Connected */}
                {onSimulateChat && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F6C915]">
                      <Send className="w-3.5 h-3.5" />
                      <span>Manual Entry (Send Test Viewer Comment)</span>
                    </div>

                    <form onSubmit={handleSendManualChat} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-[#B9A8CC] mb-1 font-medium">
                            Viewer Nickname
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-[#8A759E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={manualNickname}
                              onChange={(e) => setManualNickname(e.target.value)}
                              placeholder="Viewer_1"
                              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-[#B9A8CC] mb-1 font-medium">
                            Chat Word / Comment
                          </label>
                          <input
                            type="text"
                            value={manualComment}
                            onChange={(e) => setManualComment(e.target.value)}
                            placeholder="e.g. SPACE"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                          />
                        </div>
                      </div>

                      {/* Quick suggestion buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="text-[#8E79A6]">Quick Send:</span>
                        {sampleUnfoundWord && (
                          <button
                            type="button"
                            onClick={() => handleSendManualChat(undefined, sampleUnfoundWord)}
                            className="px-2 py-0.5 rounded bg-[#F6C915] text-[#1D0830] font-mono font-bold text-[10px] cursor-pointer"
                          >
                            +{sampleUnfoundWord}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSendManualChat(undefined, '!rotate')}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-[#D6CBE2] font-mono text-[10px] cursor-pointer"
                        >
                          !rotate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendManualChat(undefined, '!hint')}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 text-[#D6CBE2] font-mono text-[10px] cursor-pointer"
                        >
                          !hint
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!manualComment.trim()}
                        className="w-full py-2 rounded-lg bg-[#F6C915] hover:brightness-105 text-[#1D0830] font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Manual Chat Entry</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : connectTab === 'test' ? (
              /* Test Mode / Fake Stream Connection Form */
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/30 text-xs space-y-1">
                  <h4 className="font-bold text-[#F6C915] flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-[#F6C915]" />
                    <span>Offline Test Mode (Fake Connection)</span>
                  </h4>
                  <p className="text-[11px] text-[#D6CBE2] leading-relaxed">
                    Starts a simulated stream session immediately. This enables the split leaderboard &amp; live chat feed for manual entry without needing a real live TikTok broadcast.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E6BE5A] mb-1.5">
                    Simulated Streamer Username (@)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#F6C915] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={testUsernameInput}
                      onChange={(e) => setTestUsernameInput(e.target.value.replace(/^@+/, ''))}
                      placeholder="test_streamer"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs font-mono text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-b from-[#FFE566] via-[#F6C915] to-[#D49B27] text-[#1D0830] font-display font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(246,201,21,0.35)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Starting Test Mode...' : 'Start Test Connection (Fake Stream)'}</span>
                </button>
              </form>
            ) : (
              /* Live TikTok Stream Form */
              <form onSubmit={handleLiveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E6BE5A] mb-1.5">
                    Host TikTok Username (@)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#F6C915] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/^@+/, ''))}
                      placeholder="tiktok_username"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs font-mono text-white placeholder-[#8A759E] focus:outline-none focus:border-[#F6C915]"
                    />
                  </div>
                  <p className="text-[11px] text-[#B9A8CC] mt-1.5">
                    Authenticated with key <strong>{authorizedStreamer.key}</strong>. Click below to connect your live stream.
                  </p>
                </div>

                {/* Toggle Button between Tikfinity input or BetterTok input */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#E6BE5A]">Chat Input Provider</span>
                    <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleProviderChange('tikfinity')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          chatProvider === 'tikfinity'
                            ? 'bg-[#F6C915] text-[#1D0830]'
                            : 'text-[#D6CBE2] hover:text-white'
                        }`}
                      >
                        Tikfinity
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProviderChange('bettertok')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          chatProvider === 'bettertok'
                            ? 'bg-[#F6C915] text-[#1D0830]'
                            : 'text-[#D6CBE2] hover:text-white'
                        }`}
                      >
                        BetterTok
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-[#D6CBE2] space-y-1">
                    <div className="text-[#F6C915] font-bold">
                      {chatProvider === 'tikfinity' ? 'Tikfinity Webhook URL:' : 'BetterTok Webhook URL:'}
                    </div>
                    <div className="bg-black/60 p-2 rounded border border-white/10 text-white select-all break-all">
                      {window.location.origin}/api/{chatProvider === 'tikfinity' ? 'tikfinity' : 'bettertok'}/event
                    </div>
                    <div className="text-[10px] text-[#A892C2] pt-1">
                      {chatProvider === 'tikfinity'
                        ? 'Configure Tikfinity webhook to POST JSON events to this endpoint.'
                        : 'Configure BetterTok webhook to POST JSON events (supporting message & user object) to this endpoint.'}
                    </div>
                  </div>
                </div>

                {tiktokError && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-400/40 text-xs text-rose-200 flex items-start gap-2 animate-pop">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{tiktokError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !usernameInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-b from-[#FFE566] via-[#F6C915] to-[#D49B27] text-[#1D0830] font-display font-extrabold text-sm tracking-wide shadow-[0_8px_24px_rgba(246,201,21,0.35)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Radio className="w-4 h-4 text-rose-600" />
                  <span>{isSubmitting ? 'Connecting to TikTok...' : `Connect with ${chatProvider === 'tikfinity' ? 'Tikfinity' : 'BetterTok'}`}</span>
                </button>
              </form>
            )}

            {/* Quick Offline Test Simulator Callout */}
            <div className="p-3 rounded-xl bg-[#170329]/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F6C915] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Not Live Right Now?</span>
                </span>
                {onOpenSimulator && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSimulator();
                    }}
                    className="text-[11px] text-[#E6BE5A] underline hover:text-[#F6C915] cursor-pointer"
                  >
                    Open Chat Test Drawer
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#B9A8CC] leading-relaxed">
                Use <strong>Test Mode</strong> above or the <strong>Chat Test Drawer</strong> to simulate viewer chat guesses and commands instantly without needing an active live stream.
              </p>
            </div>
          </>
        )}

        {/* Helper Note */}
        <div className="flex items-center gap-2 text-[11px] text-[#8E79A6] font-mono">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Viewers comment 4+ letter words to find words and rank on the board.</span>
        </div>
      </div>
    </div>
  );
};
