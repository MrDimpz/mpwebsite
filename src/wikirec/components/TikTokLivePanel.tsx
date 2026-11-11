import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Eye, Gift, Heart, Radio, Send, Terminal, Wifi, WifiOff, AlertTriangle, X, Check, RefreshCw } from 'lucide-react';
import { LiveChatItem, PublicGameState, SearchWordSlot, TikTokConnectionStatus } from '../shared/types';
import { getOrInitTabSessionId } from '../utils/session';
import { triggerResilientConnect, forceReconnectBridge, emitResilientEvent } from '@/lib/live-chat-bridge';

export interface SocketChatEvent {
  uniqueId: string;
  nickname: string;
  comment: string;
  profilePictureUrl?: string;
}

export interface SocketLikeEvent {
  uniqueId: string;
  nickname: string;
  likeCount: number;
  totalLikeCount?: number;
  profilePictureUrl?: string;
}

export interface SocketGiftEvent {
  uniqueId: string;
  nickname: string;
  giftName: string;
  diamondCount: number;
  repeatCount?: number;
  repeatEnd?: boolean;
  profilePictureUrl?: string;
}

interface TikTokLivePanelProps {
  status: TikTokConnectionStatus;
  chatItems: LiveChatItem[];
  gameState?: PublicGameState | null;
  isOpen: boolean;
  onClose: () => void;
  onConnectionStateChange?: (connected: boolean, username: string | null) => void;
  authorizedStreamer?: { username: string; key: string; label?: string } | null;
  onLogoutStreamer?: () => void;
}

const SAMPLE_TIKTOK_VIEWERS = [
  {
    uniqueId: 'lexi_wordsmith',
    nickname: 'Lexi Wordsmith',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=lexi_wordsmith',
  },
  {
    uniqueId: 'boggle_king99',
    nickname: 'BoggleKing',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=boggle_king99',
  },
  {
    uniqueId: 'wiki_hunter_tt',
    nickname: 'WikiHunter',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=wiki_hunter_tt',
  },
  {
    uniqueId: 'nova_starlight',
    nickname: 'Nova Starlight',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=nova_starlight',
  },
  {
    uniqueId: 'puzzle_champ',
    nickname: 'PuzzleChamp',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=puzzle_champ',
  },
];

interface SocketFeedEntry {
  id: string;
  type: 'chat' | 'like' | 'gift';
  uniqueId: string;
  nickname: string;
  text: string;
  subtext?: string;
  timestamp: number;
}

export const TikTokLivePanel: React.FC<TikTokLivePanelProps> = ({
  status,
  chatItems,
  gameState,
  isOpen,
  onClose,
  onConnectionStateChange,
  authorizedStreamer,
  onLogoutStreamer,
}) => {
  const [username, setUsername] = useState(() =>
    authorizedStreamer?.username
      ? authorizedStreamer.username.startsWith('@')
        ? authorizedStreamer.username
        : `@${authorizedStreamer.username}`
      : '@'
  );
  const [connState, setConnState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>(
    status.connected ? 'connected' : 'disconnected'
  );
  const [connectedInfo, setConnectedInfo] = useState<{ username: string; roomId: string } | null>(
    status.connected && status.username
      ? { username: status.username, roomId: 'live' }
      : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    if (authorizedStreamer?.username) {
      setUsername(
        authorizedStreamer.username.startsWith('@')
          ? authorizedStreamer.username
          : `@${authorizedStreamer.username}`
      );
    }
  }, [authorizedStreamer?.username]);

  // Simulate / Debug controls state
  const [simViewerId, setSimViewerId] = useState(SAMPLE_TIKTOK_VIEWERS[0].uniqueId);
  const [simComment, setSimComment] = useState('');
  const [simLikeCount, setSimLikeCount] = useState(25);
  const [simGiftName, setSimGiftName] = useState('Galaxy');
  const [simDiamonds, setSimDiamonds] = useState(50);
  const [socketFeed, setSocketFeed] = useState<SocketFeedEntry[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const onConnChangeRef = useRef(onConnectionStateChange);
  const activityLogRef = useRef<HTMLDivElement | null>(null);
  const activityLogBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollToLatest = () => {
      if (activityLogRef.current) {
        activityLogRef.current.scrollTop = activityLogRef.current.scrollHeight;
      }
      activityLogBottomRef.current?.scrollIntoView({ block: 'end' });
    };
    scrollToLatest();
    const rafId = requestAnimationFrame(scrollToLatest);
    return () => cancelAnimationFrame(rafId);
  }, [chatItems, chatItems.length, socketFeed.length, isOpen]);

  useEffect(() => {
    onConnChangeRef.current = onConnectionStateChange;
  }, [onConnectionStateChange]);

  useEffect(() => {
    if (status.connected && status.username) {
      setConnState('connected');
      setConnectedInfo((prev) => ({
        username: status.username!,
        roomId: prev?.roomId || 'live',
      }));
    }
  }, [status.connected, status.username]);

  // Connect to backend via Socket.IO inside useEffect
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    // Register this streamer to join isolated room and track activity
    if (authorizedStreamer?.username) {
      socket.emit('register-streamer', {
        username: authorizedStreamer.username,
        sessionId: getOrInitTabSessionId(),
      });
    }

    socket.on('tiktok-connected', (payload: { username: string; roomId: string }) => {
      setConnState('connected');
      setConnectedInfo(payload);
      setErrorMessage(null);
      onConnChangeRef.current?.(true, payload.username);
    });

    socket.on('tiktok-status', (payload: { connected: boolean; username?: string | null; isTestMode?: boolean }) => {
      if (payload.connected) {
        setConnState('connected');
        const uname = payload.username || username.replace(/^@+/, '') || 'streamer';
        setConnectedInfo((prev) => ({
          username: uname,
          roomId: prev?.roomId || (payload.isTestMode ? 'TEST_MODE' : 'LIVE'),
        }));
        setErrorMessage(null);
        onConnChangeRef.current?.(true, uname);
      }
    });

    socket.on('tiktok-error', (errMsg: string) => {
      console.warn('TikTok socket notice:', errMsg);
    });

    socket.on('tiktok-disconnected', () => {
      setConnState('disconnected');
      setConnectedInfo(null);
      onConnChangeRef.current?.(false, null);
    });

    socket.on('streamer-timeout', (data: any) => {
      setConnState('disconnected');
      setConnectedInfo(null);
      setErrorMessage(data?.message || 'Logged out due to 20 minutes of inactivity');
      onConnChangeRef.current?.(false, null);
      onLogoutStreamer?.();
    });

    socket.on('chat-message', (data: SocketChatEvent) => {
      setSocketFeed((prev) => [
        {
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'chat',
          uniqueId: data.uniqueId || 'viewer',
          nickname: data.nickname || data.uniqueId || 'Viewer',
          text: data.comment,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 39),
      ]);
    });

    socket.on('like-event', (data: SocketLikeEvent) => {
      setSocketFeed((prev) => [
        {
          id: `like-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'like',
          uniqueId: data.uniqueId || 'viewer',
          nickname: data.nickname || data.uniqueId || 'Viewer',
          text: `Sent +${data.likeCount || 1} Likes`,
          subtext: data.totalLikeCount ? `Total: ${data.totalLikeCount}` : undefined,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 39),
      ]);
    });

    socket.on('gift-event', (data: SocketGiftEvent) => {
      const count = (data.diamondCount || 1) * (data.repeatCount || 1);
      setSocketFeed((prev) => [
        {
          id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'gift',
          uniqueId: data.uniqueId || 'viewer',
          nickname: data.nickname || data.uniqueId || 'Viewer',
          text: `Sent ${data.giftName || 'Gift'}`,
          subtext: `${count} Diamonds`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 39),
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authorizedStreamer?.username, onLogoutStreamer]);

  // When authorized streamer changes, re-register on socket
  useEffect(() => {
    if (socketRef.current && authorizedStreamer?.username) {
      socketRef.current.emit('register-streamer', {
        username: authorizedStreamer.username,
        sessionId: getOrInitTabSessionId(),
      });
    }
  }, [authorizedStreamer?.username]);

  const handleConnect = (e: React.FormEvent, isTestMode = false) => {
    e.preventDefault();
    const cleaned = username.trim().replace(/^@+/, '');
    if (!cleaned) return;
    const defaultRoom = isTestMode ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';
    setConnState('connected');
    setConnectedInfo({ username: cleaned, roomId: defaultRoom });
    setErrorMessage(null);
    onConnChangeRef.current?.(true, cleaned);

    triggerResilientConnect(
      socketRef.current,
      {
        username: cleaned,
        isTestMode,
        provider: chatProvider,
        key: authorizedStreamer?.key,
        sessionId: getOrInitTabSessionId(),
      },
      ({ username: uname, roomId }) => {
        setConnState('connected');
        setConnectedInfo({ username: uname || cleaned, roomId: roomId || defaultRoom });
        setErrorMessage(null);
        onConnChangeRef.current?.(true, uname || cleaned);
      }
    );
  };

  const handleReconnect = () => {
    const cleaned =
      (username.trim().replace(/^@+/, '') ||
        authorizedStreamer?.username?.replace(/^@+/, '') ||
        'streamer');
    const isTestMode = connectedInfo?.roomId === 'TEST_SIMULATION_ROOM';
    const defaultRoom = isTestMode ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';
    setConnState('connected');
    setConnectedInfo({ username: cleaned, roomId: defaultRoom });
    setErrorMessage(null);
    onConnChangeRef.current?.(true, cleaned);

    forceReconnectBridge(
      socketRef.current,
      {
        username: cleaned,
        isTestMode,
        provider: chatProvider,
        key: authorizedStreamer?.key,
        sessionId: getOrInitTabSessionId(),
      },
      ({ username: uname, roomId }) => {
        setConnState('connected');
        setConnectedInfo({ username: uname || cleaned, roomId: roomId || defaultRoom });
        setErrorMessage(null);
        onConnChangeRef.current?.(true, uname || cleaned);
      }
    );
  };

  const handleDisconnect = () => {
    setConnState('disconnected');
    setConnectedInfo(null);
    onConnChangeRef.current?.(false, null);
    fetch('/api/tiktok/disconnect', { method: 'POST' }).catch(() => {});
    if (!socketRef.current) return;
    socketRef.current.emit('disconnect-tiktok', {
      username: authorizedStreamer?.username || username.trim().replace(/^@+/, ''),
      sessionId: getOrInitTabSessionId(),
    });
  };

  const getSelectedViewer = () => {
    return (
      SAMPLE_TIKTOK_VIEWERS.find((v) => v.uniqueId === simViewerId) ||
      SAMPLE_TIKTOK_VIEWERS[0]
    );
  };

  const emitSimulatedWord = (word: string) => {
    if (!word.trim()) return;
    const viewer = getSelectedViewer();
    const payload = {
      uniqueId: viewer.uniqueId,
      nickname: viewer.nickname,
      comment: word.trim().toLowerCase(),
      profilePictureUrl: viewer.profilePictureUrl,
      streamerUsername: authorizedStreamer?.username || username.trim(),
    };
    emitResilientEvent(socketRef.current, 'chat-message', payload);
  };

  // Simulate / Debug handlers emitting via emitResilientEvent
  const handleSimulateChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simComment.trim()) return;
    emitSimulatedWord(simComment.trim());
    setSimComment('');
  };

  const handleSimulateSmartWordGuess = (tierType: 'title' | 'common' | 'rare') => {
    const allSlots = gameState?.searchWords || [];
    const tierSlots = allSlots.filter(
      (s) => s.tier === tierType && !s.revealed && (s.unmaskedWord || s.word)
    );
    const fallbackSlots = allSlots.filter((s) => !s.revealed && (s.unmaskedWord || s.word));
    const pool = tierSlots.length > 0 ? tierSlots : fallbackSlots;
    const chosenSlot =
      pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    const chosen = (chosenSlot?.unmaskedWord || chosenSlot?.word || 'planet').toLowerCase();
    const viewer =
      SAMPLE_TIKTOK_VIEWERS[Math.floor(Math.random() * SAMPLE_TIKTOK_VIEWERS.length)];
    emitResilientEvent(socketRef.current, 'chat-message', {
      uniqueId: viewer.uniqueId,
      nickname: viewer.nickname,
      comment: chosen,
      profilePictureUrl: viewer.profilePictureUrl,
      streamerUsername: authorizedStreamer?.username || username.trim().replace(/^@+/, ''),
    });
  };

  const handleSimulateLike = () => {
    const viewer = getSelectedViewer();
    const payload = {
      uniqueId: viewer.uniqueId,
      nickname: viewer.nickname,
      likeCount: simLikeCount,
      totalLikeCount: status.likesCount + simLikeCount,
      profilePictureUrl: viewer.profilePictureUrl,
      streamerUsername: authorizedStreamer?.username || username.trim(),
    };
    emitResilientEvent(socketRef.current, 'like-event', payload);
  };

  const handleSimulateGift = () => {
    const viewer = getSelectedViewer();
    const payload = {
      uniqueId: viewer.uniqueId,
      nickname: viewer.nickname,
      giftName: simGiftName,
      diamondCount: simDiamonds,
      repeatCount: 1,
      repeatEnd: true,
      profilePictureUrl: viewer.profilePictureUrl,
      streamerUsername: authorizedStreamer?.username || username.trim(),
    };
    emitResilientEvent(socketRef.current, 'gift-event', payload);
  };

  if (!isOpen) return null;

  const searchWords: SearchWordSlot[] = gameState?.searchWords || [];
  const titleSlots = searchWords.filter((s) => s.tier === 'title');
  const commonSlots = searchWords.filter((s) => s.tier === 'common');
  const rareSlots = searchWords.filter((s) => s.tier === 'rare');
  const ultraSlots = searchWords.filter((s) => s.tier === 'ultra');

  const renderUncensoredGroup = (
    label: string,
    badgeLetter: string,
    badgeClass: string,
    slots: SearchWordSlot[]
  ) => {
    if (slots.length === 0) return null;
    const foundCount = slots.filter((s) => s.revealed).length;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white ${badgeClass}`}
            >
              {badgeLetter}
            </span>
            {label}
          </span>
          <span className="font-mono text-slate-400">
            {foundCount}/{slots.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {slots.map((slot) => {
            const fullWord = (slot.unmaskedWord || slot.word || '').toUpperCase();
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => emitSimulatedWord(fullWord)}
                title={
                  slot.revealed
                    ? `Found by ${slot.finderName || 'player'} (Click to emit in chat)`
                    : 'Click to emit this word as a simulated chat guess'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  slot.revealed
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#0F172A] border-slate-700 text-slate-100 hover:border-amber-400/70 hover:text-amber-300'
                }`}
              >
                <span>{fullWord}</span>
                {slot.revealed ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[10px] font-normal text-slate-400">
                    {slot.length}L
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#0F172A] border-l border-slate-800 h-full flex flex-col justify-between overflow-y-auto p-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-100">
                TikTok Live Chat & Relay Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Socket.IO real-time TikTok Live connector, streamer answer key & simulator
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close TikTok Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status & Metrics */}
          <div className="p-4 rounded-xl bg-[#151F32] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Connection Status</span>
              {connState === 'connected' && connectedInfo ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
                  <Wifi className="w-3.5 h-3.5" />
                  Connected (@{connectedInfo.username} · Room {connectedInfo.roomId})
                </span>
              ) : connState === 'connecting' ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-amber-400">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Connecting...
                </span>
              ) : connState === 'error' ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-slate-400">
                  <WifiOff className="w-3.5 h-3.5" />
                  Disconnected
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-center">
              <div>
                <div className="text-base font-mono font-bold text-slate-100 tabular-nums">
                  {status.guessesFromChat}
                </div>
                <div className="text-[11px] text-slate-400">Chat Guesses</div>
              </div>
              <div>
                <div className="text-base font-mono font-bold text-slate-100 tabular-nums">
                  {status.likesCount}
                </div>
                <div className="text-[11px] text-slate-400">Stream Likes</div>
              </div>
              <div>
                <div className="text-base font-mono font-bold text-amber-400 tabular-nums">
                  {status.giftsDiamonds}
                </div>
                <div className="text-[11px] text-slate-400">Gift Diamonds</div>
              </div>
            </div>
          </div>

          {/* 01. Connect Live TikTok Stream (@username) via Socket.IO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                01. Connect Live TikTok Stream (@username)
              </h3>
              {authorizedStreamer && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ✓ Authorized @{authorizedStreamer.username}
                  </span>
                  {onLogoutStreamer && (
                    <button
                      type="button"
                      onClick={onLogoutStreamer}
                      className="text-[11px] text-slate-400 hover:text-rose-400 underline transition"
                    >
                      Log out
                    </button>
                  )}
                </div>
              )}
            </div>
            <form onSubmit={(e) => handleConnect(e, false)} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsername(val.startsWith('@') ? val : `@${val.replace(/^@+/, '')}`);
                  }}
                  placeholder="@username (live on TikTok)"
                  className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-lg bg-[#151F32] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                {connState === 'connected' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleReconnect}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Force hard refresh of Socket.IO & resilient bridge handshake"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reconnect
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {connState === 'connecting' ? 'Connecting...' : `Connect (${chatProvider === 'tikfinity' ? 'Tikfinity' : 'BetterTok'})`}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleConnect(e as unknown as React.FormEvent, true)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Start Test Mode
                    </button>
                    <button
                      type="button"
                      onClick={handleReconnect}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Force hard refresh of Socket.IO & resilient bridge handshake"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reconnect
                    </button>
                  </>
                )}
              </div>

              {/* Toggle Button between Tikfinity input or BetterTok input */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Chat Input Provider</span>
                  <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleProviderChange('tikfinity')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        chatProvider === 'tikfinity'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Tikfinity
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProviderChange('bettertok')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        chatProvider === 'bettertok'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      BetterTok
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">
                      {chatProvider === 'tikfinity' ? 'Tikfinity Webhook URL:' : 'BetterTok Webhook URL:'}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch(`/api/${chatProvider}/event`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              uniqueId: 'test_viewer',
                              nickname: 'Test Viewer',
                              comment: 'PLANET',
                            }),
                          });
                        } catch {}
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold cursor-pointer transition-colors"
                      title="Send test chat to verify webhook ingestion"
                    >
                      ⚡ Test Webhook Ping
                    </button>
                  </div>
                  <div className="bg-black/60 p-2 rounded border border-slate-800 text-white select-all break-all text-[11px]">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/{chatProvider === 'tikfinity' ? 'tikfinity' : 'bettertok'}/event
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    {chatProvider === 'tikfinity'
                      ? 'In Tikfinity: Actions & Events → Create Action → Trigger: Chat Message → Action: Webhook → Method: POST → URL above. Any JSON comment payload is supported!'
                      : 'In BetterTok: Settings → Webhooks → Set POST URL above. Both message & comment JSON payloads are automatically recognized!'}
                  </div>
                </div>
              </div>
            </form>

            {connState === 'error' && errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 leading-relaxed">
                {errorMessage}
              </div>
            )}
          </div>

          {/* STREAMER UNCENSORED VIEW: Words Being Looked For */}
          <div className="p-4 rounded-xl bg-[#151F32] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Words Being Looked For (Uncensored Streamer Key)
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {(gameState?.revealedTitleWordCount || 0) +
                  (gameState?.foundCommonCount || 0) +
                  (gameState?.foundRareCount || 0) +
                  (gameState?.foundUltraCount || 0)}
                /
                {(gameState?.titleWordCount || 0) +
                  (gameState?.commonWordTarget || 0) +
                  (gameState?.rareWordTarget || 0) +
                  (gameState?.ultraWordTarget || 0)}{' '}
                Found
              </span>
            </div>

            {gameState?.unmaskedArticleTitle && (
              <div className="px-3 py-2 rounded-lg bg-[#0F172A] border border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Article Title:
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {gameState.unmaskedArticleTitle}
                </span>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {renderUncensoredGroup('Title Words', 'T', 'bg-[#e3701d]', titleSlots)}
              {renderUncensoredGroup('Common Words', 'C', 'bg-[#3b6fd6]', commonSlots)}
              {renderUncensoredGroup('Rare Words', 'R', 'bg-[#b89b2b]', rareSlots)}
              {renderUncensoredGroup('Ultra Rare Words', 'U', 'bg-[#7c4fd6]', ultraSlots)}
            </div>
          </div>

          {/* 02. Simulate / Debug Panel (socket.emit passthroughs) */}
          <div className="p-4 rounded-xl bg-[#151F32] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                02. Simulate / Debug Panel
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                socket.emit passthrough
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send simulated TikTok Live chat messages, likes, and gifts via Socket.IO without going live on TikTok.
            </p>

            {/* Viewer Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 shrink-0">Simulated Viewer:</label>
              <select
                value={simViewerId}
                onChange={(e) => setSimViewerId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200"
              >
                {SAMPLE_TIKTOK_VIEWERS.map((v) => (
                  <option key={v.uniqueId} value={v.uniqueId}>
                    {v.nickname} (@{v.uniqueId})
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated Chat Message (socket.emit('chat-message', ...)) */}
            <form onSubmit={handleSimulateChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={simComment}
                onChange={(e) => setSimComment(e.target.value)}
                placeholder="Type simulated chat message / word guess..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#0F172A] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-950 hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Emit Chat
              </button>
            </form>

            {/* Quick Smart Board Word Chat Simulations */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSimulateSmartWordGuess('common')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-colors whitespace-nowrap cursor-pointer"
              >
                Sim Common Guess
              </button>
              <button
                type="button"
                onClick={() => handleSimulateSmartWordGuess('rare')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25 transition-colors whitespace-nowrap cursor-pointer"
              >
                Sim Rare Guess
              </button>
              <button
                type="button"
                onClick={() => handleSimulateSmartWordGuess('title')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors whitespace-nowrap cursor-pointer"
              >
                Sim Title Guess
              </button>
            </div>

            {/* Simulated Like & Gift Controls (socket.emit('like-event') / socket.emit('gift-event')) */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={simLikeCount}
                  onChange={(e) => setSimLikeCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 px-2 py-1.5 text-xs font-mono rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200"
                  aria-label="Simulated like count"
                />
                <button
                  type="button"
                  onClick={handleSimulateLike}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Emit Likes
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={simGiftName}
                  onChange={(e) => setSimGiftName(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200"
                  placeholder="Gift"
                  aria-label="Simulated gift name"
                />
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={simDiamonds}
                  onChange={(e) => setSimDiamonds(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 px-1.5 py-1.5 text-xs font-mono rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200"
                  aria-label="Diamond count"
                />
                <button
                  type="button"
                  onClick={handleSimulateGift}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Gift
                </button>
              </div>
            </div>
          </div>

          {/* 03. Live Socket.IO & Multiplayer Event Log */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              03. Live Stream & Multiplayer Activity Log
            </h3>
            <div ref={activityLogRef} className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {socketFeed.length === 0 && chatItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">
                  No events yet. Connect a TikTok stream or use the Simulate / Debug panel above!
                </div>
              ) : (
                chatItems.map((item) => {
                  const cleanNick = (item.displayName || item.username || 'Viewer').replace(/^@+/, '');
                  const pfp =
                    item.profileImage && item.profileImage.startsWith('http')
                      ? item.profileImage
                      : `https://i.pravatar.cc/150?u=${encodeURIComponent(item.username || cleanNick)}`;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <img
                          src={pfp}
                          alt={cleanNick}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = `https://i.pravatar.cc/150?u=${encodeURIComponent(item.username || cleanNick)}`;
                            if (target.src !== fallback) target.src = fallback;
                          }}
                          className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <span className="font-semibold text-slate-200 truncate">
                          {cleanNick}
                        </span>
                        <span className="text-slate-600 shrink-0">·</span>
                        <span className="font-mono text-slate-300 truncate">{item.comment}</span>
                      </div>
                      <div className="text-right font-mono tabular-nums whitespace-nowrap shrink-0">
                        {item.points && item.points > 0 ? (
                          <span className="text-emerald-400 font-semibold">
                            +{item.points.toLocaleString()} pts
                          </span>
                        ) : item.eventType === 'like' ? (
                          <span className="text-rose-400">Like</span>
                        ) : item.eventType === 'gift' ? (
                          <span className="text-amber-400">Gift</span>
                        ) : (
                          <span className="text-slate-500">{item.guessResult || 'chat'}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={activityLogBottomRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
