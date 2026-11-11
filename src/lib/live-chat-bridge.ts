import { Socket } from 'socket.io-client';

export interface NormalizedChatEvent {
  eventId?: string;
  uniqueId: string;
  nickname: string;
  comment: string;
  profilePictureUrl: string;
  timestamp?: number;
}

export interface NormalizedLikeEvent {
  eventId?: string;
  uniqueId: string;
  nickname: string;
  likeCount: number;
  totalLikeCount: number;
  profilePictureUrl: string;
  timestamp?: number;
}

export interface NormalizedGiftEvent {
  eventId?: string;
  uniqueId: string;
  nickname: string;
  giftName: string;
  diamondCount: number;
  repeatCount: number;
  repeatEnd: boolean;
  profilePictureUrl: string;
  timestamp?: number;
}

const BRIDGE_CHANNEL_NAME = 'missing_piece_live_bridge_v2';

function isTemplatePlaceholder(val: string): boolean {
  const trimmed = val.trim();
  return (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    /^\{.*\}$/.test(trimmed) ||
    /^\$\{.*\}$/.test(trimmed) ||
    /^%.*%$/.test(trimmed)
  );
}

function normalizeAvatarUrl(url: unknown, fallbackSeed: string): string {
  if (typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed && !isTemplatePlaceholder(trimmed)) {
      if (trimmed.startsWith('//')) return `https:${trimmed}`;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    }
  }
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(fallbackSeed || 'viewer')}`;
}

function extractImageFromRaw(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t.startsWith('//')) return `https:${t}`;
    if (t.startsWith('http')) return t;
    return '';
  }
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const found = extractImageFromRaw(item);
      if (found) return found;
    }
    return '';
  }
  if (typeof raw === 'object') {
    return (
      extractImageFromRaw(raw.urlList) ||
      extractImageFromRaw(raw.urls) ||
      extractImageFromRaw(raw.url_list) ||
      extractImageFromRaw(raw.url) ||
      extractImageFromRaw(raw.uri) ||
      ''
    );
  }
  return '';
}

export function normalizeIncomingChatPayload(raw: any): NormalizedChatEvent | null {
  const root = raw?.data && typeof raw.data === 'object' ? { ...raw, ...raw.data } : raw || {};
  const user = root.user || root.sender || root.author || {};
  const commentRaw =
    root.comment ??
    root.content ??
    root.message ??
    root.text ??
    root.word ??
    root.msg ??
    '';
  const comment =
    typeof commentRaw === 'string' && !isTemplatePlaceholder(commentRaw)
      ? commentRaw.trim()
      : '';
  if (!comment) return null;

  const uniqueCandidates = [
    user.uniqueId,
    user.displayId,
    user.username,
    root.uniqueId,
    root.displayId,
    root.username,
    root.userId,
  ];
  let uniqueId = 'viewer';
  for (const c of uniqueCandidates) {
    if (typeof c === 'string' && !isTemplatePlaceholder(c) && c.trim()) {
      uniqueId = c.trim().replace(/^@+/, '');
      break;
    }
  }

  const nickCandidates = [
    user.nickname,
    user.displayName,
    user.name,
    root.nickname,
    root.displayName,
    root.name,
  ];
  let nickname = uniqueId;
  for (const c of nickCandidates) {
    if (typeof c === 'string' && !isTemplatePlaceholder(c) && c.trim()) {
      nickname = c.trim().replace(/^@+/, '');
      break;
    }
  }

  const extractedImg =
    extractImageFromRaw(root.profilePictureUrl) ||
    extractImageFromRaw(root.profilePicture) ||
    extractImageFromRaw(root.avatarUrl) ||
    extractImageFromRaw(root.avatar) ||
    extractImageFromRaw(user.profilePictureUrl) ||
    extractImageFromRaw(user.profilePicture) ||
    extractImageFromRaw(user.avatarLarge) ||
    extractImageFromRaw(user.avatarMedium) ||
    extractImageFromRaw(user.avatarThumb) ||
    extractImageFromRaw(user.avatarUrl) ||
    extractImageFromRaw(user.avatar) ||
    extractImageFromRaw(user.userDetails?.profilePictureUrls);

  const profilePictureUrl = normalizeAvatarUrl(extractedImg, uniqueId || nickname);

  return {
    eventId: root.eventId || root.id,
    uniqueId,
    nickname,
    comment,
    profilePictureUrl,
    timestamp: Number(root.timestamp) || Date.now(),
  };
}

async function safeFetchJson(url: string, init?: RequestInit): Promise<any | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Emits a local event across all active listeners in the current browser tab,
 * across BroadcastChannel tabs, AND forwards to Socket.IO / HTTP relay.
 */
export function emitResilientEvent(
  socket: Socket | null | undefined,
  eventType: 'chat-message' | 'like-event' | 'gift-event',
  payload: Record<string, any>
) {
  const eventId =
    payload.eventId ||
    `ev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const enriched = { ...payload, eventId, timestamp: Date.now() };

  // 1. Dispatch locally in current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('local-tiktok-bridge-event', {
        detail: { type: eventType, data: enriched },
      })
    );
  }

  // 2. Broadcast across tabs on HTML-based websites
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(BRIDGE_CHANNEL_NAME);
      bc.postMessage({ type: eventType, data: enriched });
      bc.close();
    } catch {}
  }

  // 3. Emit to Socket.IO if connected, and also POST to /api/tiktok/event relay
  if (socket && socket.connected) {
    socket.emit(eventType, enriched);
  } else {
    safeFetchJson('/api/tiktok/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...enriched,
        type:
          eventType === 'chat-message'
            ? 'chat'
            : eventType === 'like-event'
            ? 'like'
            : 'gift',
      }),
    });
  }
}

/**
 * Initiates a TikTok / Tikfinity / BetterTok connection resiliently so the UI
 * never gets stuck on "Connecting..." on HTML-based or app-based websites.
 */
export function triggerResilientConnect(
  socket: Socket | null | undefined,
  options: {
    username: string;
    isTestMode?: boolean;
    provider?: 'tikfinity' | 'bettertok';
    key?: string;
    sessionId?: string;
  },
  onConnected: (info: { username: string; roomId: string; isTestMode?: boolean }) => void
) {
  const cleanUsername = options.username.trim().replace(/^@+/, '') || 'streamer';
  const defaultRoomId = options.isTestMode ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';
  let resolved = false;

  const finishConnect = (roomId?: string) => {
    if (resolved) return;
    resolved = true;
    onConnected({
      username: cleanUsername,
      roomId: roomId || defaultRoomId,
      isTestMode: options.isTestMode,
    });
  };

  // Immediately invoke onConnected synchronously so HTML websites never hang on "Connecting..."
  finishConnect(defaultRoomId);

  // 1. Emit over Socket.IO if available
  if (socket) {
    try {
      socket.emit('connect-tiktok', {
        username: cleanUsername,
        isTestMode: Boolean(options.isTestMode),
        provider: options.provider,
        key: options.key,
        sessionId: options.sessionId,
      });
    } catch {}
  }

  // 2. Also fire HTTP POST /api/tiktok/connect (handled by server.ts or Hostinger /api/relay.php)
  safeFetchJson('/api/tiktok/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: cleanUsername,
      isTestMode: Boolean(options.isTestMode),
      provider: options.provider,
    }),
  }).then((data) => {
    if (data && data.connected && data.roomId) {
      onConnected({
        username: cleanUsername,
        roomId: data.roomId,
        isTestMode: options.isTestMode,
      });
    }
  });
}

/**
 * Forces a hard refresh of the Socket.IO connection, re-establishes local
 * WebSocket / BroadcastChannel bridges, and re-triggers the resilient handshake.
 */
export function forceReconnectBridge(
  socket: Socket | null | undefined,
  options: {
    username: string;
    isTestMode?: boolean;
    provider?: 'tikfinity' | 'bettertok';
    key?: string;
    sessionId?: string;
  },
  onConnected: (info: { username: string; roomId: string; isTestMode?: boolean }) => void
) {
  // 1. Force hard refresh of Socket.IO connection
  if (socket) {
    try {
      socket.disconnect();
      socket.connect();
    } catch {}
  }

  // 2. Notify active bridge listeners to re-open local WebSockets and reset polling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reconnect-tiktok-bridge'));
  }

  // 3. Re-trigger resilient handshake immediately
  triggerResilientConnect(socket, options, onConnected);
}

export function createEventDeduplicator() {
  const seenIds = new Set<string>();
  const seenSignatures = new Map<string, number>();

  return {
    shouldProcess(type: string, data: any): boolean {
      const now = Date.now();
      if (seenSignatures.size > 200) {
        for (const [k, ts] of seenSignatures.entries()) {
          if (now - ts > 3000) seenSignatures.delete(k);
        }
      }

      if (data?.eventId) {
        if (seenIds.has(data.eventId)) return false;
        seenIds.add(data.eventId);
        if (seenIds.size > 500) {
          const first = seenIds.values().next().value;
          if (first) seenIds.delete(first);
        }
      }

      const uid = String(data?.uniqueId || data?.username || '').toLowerCase();
      const body = String(data?.comment || data?.giftName || data?.likeCount || '').trim();
      const sig = `${type}:${uid}:${body}`;
      const lastTs = seenSignatures.get(sig);
      if (lastTs && now - lastTs < 800) {
        return false;
      }
      seenSignatures.set(sig, now);
      return true;
    },
  };
}

export function attachResilientChatListeners(callbacks: {
  onChat: (data: NormalizedChatEvent) => void;
  onLike?: (data: NormalizedLikeEvent) => void;
  onGift?: (data: NormalizedGiftEvent) => void;
  deduplicator: ReturnType<typeof createEventDeduplicator>;
}): () => void {
  const { onChat, onLike, onGift, deduplicator } = callbacks;
  // Look back 15 seconds initially so any comments sent just before or during connect are captured
  let lastPollTimestamp = Date.now() - 15000;
  let disposed = false;
  let localSockets: WebSocket[] = [];
  let broadcastChannel: BroadcastChannel | null = null;

  const dispatchIncoming = (type: string, data: any) => {
    if (type === 'chat-message' || type === 'chat' || type === 'comment') {
      const norm = normalizeIncomingChatPayload(data);
      if (norm && deduplicator.shouldProcess('chat', norm)) {
        onChat(norm);
      }
    } else if ((type === 'like-event' || type === 'like') && onLike) {
      const norm = normalizeIncomingChatPayload({ ...data, comment: 'like' });
      const likeEv: NormalizedLikeEvent = {
        eventId: data?.eventId,
        uniqueId: norm?.uniqueId || data?.uniqueId || 'viewer',
        nickname: norm?.nickname || data?.nickname || 'Viewer',
        likeCount: Number(data?.likeCount ?? data?.count) || 1,
        totalLikeCount: Number(data?.totalLikeCount ?? data?.total) || 1,
        profilePictureUrl:
          norm?.profilePictureUrl ||
          data?.profilePictureUrl ||
          'https://i.pravatar.cc/150?u=viewer',
      };
      if (deduplicator.shouldProcess('like', likeEv)) {
        onLike(likeEv);
      }
    } else if ((type === 'gift-event' || type === 'gift') && onGift) {
      const norm = normalizeIncomingChatPayload({ ...data, comment: 'gift' });
      const giftEv: NormalizedGiftEvent = {
        eventId: data?.eventId,
        uniqueId: norm?.uniqueId || data?.uniqueId || 'viewer',
        nickname: norm?.nickname || data?.nickname || 'Viewer',
        giftName: String(data?.giftName || data?.gift?.name || 'Gift'),
        diamondCount: Number(data?.diamondCount ?? data?.gift?.diamondCount) || 1,
        repeatCount: Number(data?.repeatCount) || 1,
        repeatEnd: data?.repeatEnd !== false,
        profilePictureUrl:
          norm?.profilePictureUrl ||
          data?.profilePictureUrl ||
          'https://i.pravatar.cc/150?u=viewer',
      };
      if (deduplicator.shouldProcess('gift', giftEv)) {
        onGift(giftEv);
      }
    }
  };

  // 1. Listen for local tab events
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<{ type: string; data: any }>;
    if (!custom.detail) return;
    dispatchIncoming(custom.detail.type, custom.detail.data);
  };

  // 2. Connect to local Tikfinity / BetterTok Desktop WebSocket bridges (if running on insecure origin or local)
  const connectLocalWebSockets = () => {
    for (const ws of localSockets) {
      try {
        ws.close();
      } catch {}
    }
    localSockets = [];

    if (typeof window === 'undefined' || !('WebSocket' in window)) return;
    // Note: In HTTPS environments, browsers block ws://localhost due to mixed content.
    // We attempt in a try/catch so it connects on localhost/http or if allowed.
    const endpoints = ['ws://localhost:21213/', 'ws://127.0.0.1:21213/'];
    for (const url of endpoints) {
      try {
        const ws = new WebSocket(url);
        ws.onmessage = (msg) => {
          try {
            const parsed = JSON.parse(String(msg.data));
            const evName = String(parsed.event || parsed.type || '').toLowerCase();
            const payload = parsed.data || parsed;
            if (evName === 'chat' || evName === 'comment' || (!evName && payload.comment)) {
              dispatchIncoming('chat-message', payload);
            } else if (evName === 'like') {
              dispatchIncoming('like-event', payload);
            } else if (evName === 'gift') {
              dispatchIncoming('gift-event', payload);
            }
          } catch {}
        };
        ws.onerror = () => {};
        localSockets.push(ws);
      } catch {}
    }
  };

  const handleReconnectBridge = () => {
    lastPollTimestamp = Date.now() - 15000;
    connectLocalWebSockets();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('local-tiktok-bridge-event', handleLocalEvent);
    window.addEventListener('reconnect-tiktok-bridge', handleReconnectBridge);

    if ('BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel(BRIDGE_CHANNEL_NAME);
        broadcastChannel.onmessage = (ev) => {
          if (ev.data && ev.data.type && ev.data.data) {
            dispatchIncoming(ev.data.type, ev.data.data);
          }
        };
      } catch {}
    }
  }

  connectLocalWebSockets();

  // 3. Poll /api/tiktok/events every 800ms (resilient fallback for static/HTML shared hosting)
  const pollInterval = setInterval(() => {
    if (disposed) return;
    safeFetchJson(`/api/tiktok/events?since=${lastPollTimestamp}`).then((res) => {
      if (!res || !Array.isArray(res.events)) return;
      for (const ev of res.events) {
        if (ev.timestamp && ev.timestamp > lastPollTimestamp) {
          lastPollTimestamp = ev.timestamp;
        }
        if (ev.type && ev.payload) {
          dispatchIncoming(ev.type, ev.payload);
        }
      }
    });
  }, 800);

  return () => {
    disposed = true;
    clearInterval(pollInterval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('local-tiktok-bridge-event', handleLocalEvent);
      window.removeEventListener('reconnect-tiktok-bridge', handleReconnectBridge);
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {}
    }
    for (const ws of localSockets) {
      try {
        ws.close();
      } catch {}
    }
  };
}
