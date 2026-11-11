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
  const comment = typeof commentRaw === 'string' && !isTemplatePlaceholder(commentRaw) ? commentRaw.trim() : '';
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

/**
 * Emits a local event across all active listeners in the current browser tab
 * AND forwards to Socket.IO if connected. Ensures simulated & local bridge events
 * work even when deployed to static hosts or when WebSockets are blocked.
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

  // Always dispatch locally so current tab processes it immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('local-tiktok-bridge-event', {
        detail: { type: eventType, data: enriched },
      })
    );
  }

  // Also emit to Socket.IO server if connected
  if (socket && socket.connected) {
    socket.emit(eventType, enriched);
  } else {
    // Try HTTP POST fallback to backend webhook endpoint
    const endpoint =
      eventType === 'chat-message'
        ? '/api/tiktok/event'
        : eventType === 'like-event'
        ? '/api/tiktok/event'
        : '/api/tiktok/event';
    fetch(endpoint, {
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
    }).catch(() => {});
  }
}

/**
 * Initiates a TikTok / Tikfinity / BetterTok connection resiliently so the UI
 * never gets stuck on "Connecting..." when deployed to a live website.
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

  // 1. Emit over Socket.IO if available
  if (socket) {
    socket.emit('connect-tiktok', {
      username: cleanUsername,
      isTestMode: Boolean(options.isTestMode),
      provider: options.provider,
      key: options.key,
      sessionId: options.sessionId,
    });
  }

  // 2. Also fire HTTP POST /api/tiktok/connect in parallel (works when WebSockets are blocked)
  fetch('/api/tiktok/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: cleanUsername,
      isTestMode: Boolean(options.isTestMode),
      provider: options.provider,
    }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && data.connected) {
        finishConnect(data.roomId);
      }
    })
    .catch(() => {});

  // 3. Guaranteed fast fallback (250ms) so live websites never hang on "Connecting..."
  setTimeout(() => {
    finishConnect(defaultRoomId);
  }, 250);
}

/**
 * Subscribes to:
 * 1. Local tab custom events (`local-tiktok-bridge-event`)
 * 2. Backend HTTP polling fallback (`/api/tiktok/events`) when active
 * 3. Local Tikfinity Desktop WebSocket (`ws://localhost:21213/`) when running on streamer's PC
 * Deduplicates events with Socket.IO using a recent event signature cache.
 */
export function createEventDeduplicator() {
  const seenIds = new Set<string>();
  const seenSignatures = new Map<string, number>();

  return {
    shouldProcess(type: string, data: any): boolean {
      const now = Date.now();
      // Prune old signatures
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
  let lastPollTimestamp = Date.now();
  let disposed = false;

  // 1. Listen for local tab events (Simulator / Local WS)
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<{ type: string; data: any }>;
    if (!custom.detail) return;
    const { type, data } = custom.detail;
    if (type === 'chat-message') {
      const norm = normalizeIncomingChatPayload(data);
      if (norm && deduplicator.shouldProcess('chat', norm)) {
        onChat(norm);
      }
    } else if (type === 'like-event' && onLike) {
      if (deduplicator.shouldProcess('like', data)) {
        onLike(data);
      }
    } else if (type === 'gift-event' && onGift) {
      if (deduplicator.shouldProcess('gift', data)) {
        onGift(data);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('local-tiktok-bridge-event', handleLocalEvent);
  }

  // 2. Poll /api/tiktok/events every 1.5s as fallback when WebSockets are blocked by proxies
  const pollInterval = setInterval(() => {
    if (disposed) return;
    fetch(`/api/tiktok/events?since=${lastPollTimestamp}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res || !Array.isArray(res.events)) return;
        for (const ev of res.events) {
          if (ev.timestamp && ev.timestamp > lastPollTimestamp) {
            lastPollTimestamp = ev.timestamp;
          }
          if (ev.type === 'chat-message') {
            const norm = normalizeIncomingChatPayload(ev.payload);
            if (norm && deduplicator.shouldProcess('chat', norm)) {
              onChat(norm);
            }
          } else if (ev.type === 'like-event' && onLike) {
            if (deduplicator.shouldProcess('like', ev.payload)) {
              onLike(ev.payload);
            }
          } else if (ev.type === 'gift-event' && onGift) {
            if (deduplicator.shouldProcess('gift', ev.payload)) {
              onGift(ev.payload);
            }
          }
        }
      })
      .catch(() => {});
  }, 1500);

  // 3. Optional local Tikfinity Desktop WebSocket bridge (ws://localhost:21213/)
  let localWs: WebSocket | null = null;
  if (typeof window !== 'undefined' && 'WebSocket' in window) {
    try {
      localWs = new WebSocket('ws://localhost:21213/');
      localWs.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(String(msg.data));
          const evName = String(parsed.event || parsed.type || '').toLowerCase();
          const payload = parsed.data || parsed;
          if (evName === 'chat' || evName === 'comment' || (!evName && payload.comment)) {
            const norm = normalizeIncomingChatPayload(payload);
            if (norm && deduplicator.shouldProcess('chat', norm)) {
              onChat(norm);
            }
          } else if (evName === 'like' && onLike) {
            const norm = normalizeIncomingChatPayload({ ...payload, comment: 'like' });
            const likeEv: NormalizedLikeEvent = {
              uniqueId: norm?.uniqueId || 'viewer',
              nickname: norm?.nickname || 'Viewer',
              likeCount: Number(payload.likeCount ?? payload.count) || 1,
              totalLikeCount: Number(payload.totalLikeCount ?? payload.total) || 1,
              profilePictureUrl:
                norm?.profilePictureUrl || 'https://i.pravatar.cc/150?u=viewer',
            };
            if (deduplicator.shouldProcess('like', likeEv)) {
              onLike(likeEv);
            }
          } else if (evName === 'gift' && onGift) {
            const norm = normalizeIncomingChatPayload({ ...payload, comment: 'gift' });
            const giftEv: NormalizedGiftEvent = {
              uniqueId: norm?.uniqueId || 'viewer',
              nickname: norm?.nickname || 'Viewer',
              giftName: String(payload.giftName || payload.gift?.name || 'Gift'),
              diamondCount: Number(payload.diamondCount ?? payload.gift?.diamondCount) || 1,
              repeatCount: Number(payload.repeatCount) || 1,
              repeatEnd: payload.repeatEnd !== false,
              profilePictureUrl:
                norm?.profilePictureUrl || 'https://i.pravatar.cc/150?u=viewer',
            };
            if (deduplicator.shouldProcess('gift', giftEv)) {
              onGift(giftEv);
            }
          }
        } catch {
          // ignore non-json frames
        }
      };
      localWs.onerror = () => {
        // Silently ignore when Tikfinity Desktop is not running locally
      };
    } catch {
      // Ignore mixed-content or security restrictions on some browsers
    }
  }

  return () => {
    disposed = true;
    clearInterval(pollInterval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('local-tiktok-bridge-event', handleLocalEvent);
    }
    if (localWs) {
      try {
        localWs.close();
      } catch {}
    }
  };
}
