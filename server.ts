import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const WebcastPushConnection = TikTokLiveConnection;
export type WebcastPushConnection = TikTokLiveConnection;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let tiktokConn: TikTokLiveConnection | null = null;
let currentConnectedUsername: string | null = null;
let currentRoomId: string | null = null;
let currentProvider: 'tikfinity' | 'bettertok' = 'tikfinity';

function isTemplatePlaceholder(val: string): boolean {
  const trimmed = val.trim();
  return (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    (/^\{.*\}$/.test(trimmed)) ||
    (/^\$\{.*\}$/.test(trimmed)) ||
    (/^%.*%$/.test(trimmed))
  );
}

function normalizeImageUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || isTemplatePlaceholder(trimmed)) return '';
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return '';
}

function pickBestUrlFromList(list: unknown): string {
  if (!Array.isArray(list) || list.length === 0) return '';
  const validUrls = list.map(normalizeImageUrl).filter(Boolean);
  if (validUrls.length === 0) return '';
  return (
    validUrls.find((u) => u.includes('100x100') && u.includes('.jpeg')) ||
    validUrls.find((u) => u.includes('100x100') && u.includes('.webp')) ||
    validUrls.find((u) => !u.includes('shrink')) ||
    validUrls[0]
  );
}

function extractImageFromField(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return normalizeImageUrl(field);
  if (Array.isArray(field)) return pickBestUrlFromList(field);
  if (typeof field === 'object') {
    const fromList =
      pickBestUrlFromList(field.urlList) ||
      pickBestUrlFromList(field.urls) ||
      pickBestUrlFromList(field.url_list) ||
      pickBestUrlFromList(field.mUrls) ||
      pickBestUrlFromList(field.url);
    if (fromList) return fromList;
    const direct =
      normalizeImageUrl(field.url) ||
      normalizeImageUrl(field.uri) ||
      normalizeImageUrl(field.openWebUrl);
    if (direct) return direct;
  }
  return '';
}

function extractUserIdentity(raw: any): { uniqueId: string; nickname: string } {
  const root = raw?.data && typeof raw.data === 'object' ? { ...raw, ...raw.data } : raw || {};
  const eventObj = root?.event && typeof root.event === 'object' ? root.event : {};
  const user =
    root.user ||
    root.sender ||
    root.author ||
    root.common?.user ||
    eventObj.user ||
    eventObj.sender ||
    {};

  const rawUniqueCandidates = [
    user.uniqueId,
    user.displayId,
    user.username,
    user.handle,
    user.user_name,
    user.idStr,
    user.userId,
    root.uniqueId,
    root.displayId,
    root.username,
    root.handle,
    root.user_name,
    root.userId,
    eventObj.uniqueId,
    eventObj.username,
  ];

  let uniqueId = '';
  for (const c of rawUniqueCandidates) {
    if (typeof c === 'string' && !isTemplatePlaceholder(c)) {
      uniqueId = c.trim().replace(/^@+/, '');
      if (uniqueId) break;
    }
  }

  const rawNickCandidates = [
    user.nickname,
    user.nickName,
    user.displayName,
    user.display_name,
    user.name,
    user.screenName,
    root.nickname,
    root.nickName,
    root.displayName,
    root.display_name,
    root.name,
    root.screenName,
    eventObj.nickname,
    eventObj.displayName,
    eventObj.name,
  ];

  let nickname = '';
  for (const c of rawNickCandidates) {
    if (typeof c === 'string' && !isTemplatePlaceholder(c)) {
      nickname = c.trim().replace(/^@+/, '');
      if (nickname) break;
    }
  }

  if (!nickname && uniqueId) nickname = uniqueId;
  if (!uniqueId && nickname) {
    uniqueId = nickname.toLowerCase().replace(/[^a-z0-9_.-]/g, '_') || 'viewer';
  }
  if (!uniqueId) uniqueId = 'viewer';
  if (!nickname) nickname = 'TikTok Viewer';

  return { uniqueId, nickname };
}

function extractProfilePicture(raw: any, fallbackSeed?: string): string {
  if (!raw) {
    const seed = encodeURIComponent(fallbackSeed || 'viewer');
    return `https://i.pravatar.cc/150?u=${seed}`;
  }
  const root = raw?.data && typeof raw.data === 'object' ? { ...raw, ...raw.data } : raw;
  const eventObj = root?.event && typeof root.event === 'object' ? root.event : {};
  const user =
    root.user ||
    root.sender ||
    root.author ||
    root.common?.user ||
    eventObj.user ||
    eventObj.sender ||
    root;

  const fieldCandidates = [
    root.profilePictureUrl,
    root.profilePicture,
    root.avatarUrl,
    root.avatar,
    root.profileImage,
    root.pfp,
    root.picture,
    root.photoUrl,
    root.user_avatar,
    root.profile_picture_url,
    user?.profilePictureUrl,
    user?.profilePicture,
    user?.avatarLarge,
    user?.avatarMedium,
    user?.avatarThumb,
    user?.avatarLarger,
    user?.avatarUrl,
    user?.avatar,
    user?.profileImage,
    user?.pfp,
    user?.picture,
    user?.photoUrl,
    user?.user_avatar,
    user?.profile_picture_url,
    user?.userDetails?.profilePictureUrls,
    eventObj?.profilePictureUrl,
    eventObj?.avatarUrl,
    eventObj?.avatar,
  ];

  for (const candidate of fieldCandidates) {
    const extracted = extractImageFromField(candidate);
    if (extracted) {
      return extracted;
    }
  }

  const { uniqueId, nickname } = extractUserIdentity(raw);
  const seed = encodeURIComponent(fallbackSeed || uniqueId || nickname || 'viewer');
  return `https://i.pravatar.cc/150?u=${seed}`;
}

function extractCommentText(raw: any): string {
  if (!raw) return '';
  const root = raw?.data && typeof raw.data === 'object' ? { ...raw, ...raw.data } : raw;
  const eventObj = root?.event && typeof root.event === 'object' ? root.event : {};
  const candidates = [
    root.comment,
    root.content,
    root.message,
    root.text,
    root.word,
    root.msg,
    root.chatMessage,
    root.chat,
    eventObj.comment,
    eventObj.content,
    eventObj.message,
    eventObj.text,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && !isTemplatePlaceholder(c)) {
      const trimmed = c.trim();
      if (trimmed) return trimmed;
    }
  }
  return '';
}

interface BufferedEvent {
  id: string;
  timestamp: number;
  type: 'chat-message' | 'like-event' | 'gift-event';
  payload: Record<string, any>;
}

const recentEvents: BufferedEvent[] = [];

function recordAndEmitEvent(
  type: 'chat-message' | 'like-event' | 'gift-event',
  payload: Record<string, any>
) {
  const timestamp = Number(payload.timestamp) || Date.now();
  const eventId =
    payload.eventId ||
    `srv_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
  const enriched = { ...payload, eventId, timestamp };

  recentEvents.push({
    id: eventId,
    timestamp,
    type,
    payload: enriched,
  });
  if (recentEvents.length > 100) {
    recentEvents.shift();
  }

  io.emit(type, enriched);
  return enriched;
}

function startTikTokSession(options: {
  rawUsername: unknown;
  isTestMode?: boolean;
  provider?: string;
  socket?: any;
}): { ok: boolean; error?: string; username?: string; roomId?: string; provider?: string } {
  const { rawUsername, isTestMode, provider, socket } = options;
  if (provider === 'bettertok' || provider === 'tikfinity') {
    currentProvider = provider;
  }

  if (tiktokConn) {
    try {
      tiktokConn.disconnect();
    } catch {
      // ignore
    }
    tiktokConn = null;
  }

  if (!rawUsername || !String(rawUsername).trim()) {
    if (socket) {
      socket.emit('tiktok-error', 'Username is required');
    }
    return { ok: false, error: 'Username is required' };
  }

  const cleanUsername = String(rawUsername).trim().replace(/^@+/, '');

  // Immediately mark connected and notify clients so no live website ever hangs on "Connecting..."
  currentConnectedUsername = cleanUsername;
  currentRoomId = isTestMode ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';

  const initialPayload = {
    username: cleanUsername,
    roomId: currentRoomId,
    isTestMode: Boolean(isTestMode),
    provider: currentProvider,
  };

  if (socket) {
    socket.emit('tiktok-connected', initialPayload);
  }
  io.emit('tiktok-connected', initialPayload);
  io.emit('tiktok-status', {
    connected: true,
    ...initialPayload,
  });

  if (isTestMode) {
    return {
      ok: true,
      username: cleanUsername,
      roomId: currentRoomId,
      provider: currentProvider,
    };
  }

  // Attempt direct TikTok Live room scrape asynchronously in background with 6s timeout
  try {
    tiktokConn = new TikTokLiveConnection(cleanUsername, {
      processInitialData: false,
    });
    const activeConn = tiktokConn;

    const connectTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Direct room scrape timed out after 6s')), 6000)
    );

    Promise.race([activeConn.connect(), connectTimeout])
      .then((state: any) => {
        if (tiktokConn !== activeConn) return;
        currentConnectedUsername = cleanUsername;
        currentRoomId = state?.roomId || 'LIVE';
        io.emit('tiktok-status', {
          connected: true,
          username: cleanUsername,
          roomId: currentRoomId,
          provider: currentProvider,
        });
      })
      .catch((err) => {
        console.warn(
          `[TikTok Live] Direct room scrape for @${cleanUsername} unavailable (${err?.message || 'offline'}); remaining active on Live Relay (${currentProvider}).`
        );
        if (tiktokConn === activeConn) {
          try {
            activeConn.disconnect();
          } catch {}
          tiktokConn = null;
        }
      });

    activeConn.on(WebcastEvent.CHAT, (data: any) => {
      const comment = extractCommentText(data);
      if (!comment) return;
      const { uniqueId, nickname } = extractUserIdentity(data);
      const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
      recordAndEmitEvent('chat-message', {
        uniqueId,
        nickname,
        comment,
        profilePictureUrl,
      });
    });

    activeConn.on(WebcastEvent.LIKE, (data: any) => {
      const { uniqueId, nickname } = extractUserIdentity(data);
      const likeCount = Number(data?.likeCount ?? data?.count) || 1;
      const totalLikeCount = Number(data?.totalLikeCount ?? data?.total) || likeCount;
      const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
      recordAndEmitEvent('like-event', {
        uniqueId,
        nickname,
        likeCount,
        totalLikeCount,
        profilePictureUrl,
      });
    });

    activeConn.on(WebcastEvent.GIFT, (data: any) => {
      const { uniqueId, nickname } = extractUserIdentity(data);
      const giftName =
        data?.giftName || data?.gift?.name || data?.giftDetails?.giftName || 'Gift';
      const diamondCount =
        Number(data?.diamondCount ?? data?.gift?.diamondCount ?? data?.giftDetails?.diamondCount) || 1;
      const repeatCount = Number(data?.repeatCount) || 1;
      const repeatEnd = data?.repeatEnd !== false && data?.repeatEnd !== 0;
      const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
      recordAndEmitEvent('gift-event', {
        uniqueId,
        nickname,
        giftName,
        diamondCount,
        repeatCount,
        repeatEnd,
        profilePictureUrl,
      });
    });

    activeConn.on(ControlEvent.DISCONNECTED, () => {
      // Keep relay session active so Tikfinity / BetterTok webhooks continue working
      if (tiktokConn === activeConn) {
        tiktokConn = null;
      }
    });

    activeConn.on(ControlEvent.ERROR, (err: any) => {
      console.warn('TikTok connection warning:', err?.info || err);
    });
  } catch {
    // Relay session is already active
  }

  return {
    ok: true,
    username: cleanUsername,
    roomId: currentRoomId,
    provider: currentProvider,
  };
}

function stopTikTokSession() {
  if (tiktokConn) {
    try {
      tiktokConn.disconnect();
    } catch {
      // ignore
    }
    tiktokConn = null;
  }
  currentConnectedUsername = null;
  currentRoomId = null;
  io.emit('tiktok-disconnected');
  io.emit('tiktok-status', { connected: false, username: '', roomId: '' });
}

io.on('connection', (socket) => {
  socket.emit('tiktok-status', {
    connected: Boolean(tiktokConn || currentConnectedUsername),
    username: currentConnectedUsername || '',
    roomId: currentRoomId || '',
    provider: currentProvider,
  });

  socket.on('register-streamer', (data: any) => {
    socket.emit('streamer-registered', { ok: true, username: data?.username });
  });

  socket.on('streamer-auth-login', (data: any, callback?: Function) => {
    const username = data?.username || '';
    if (typeof callback === 'function') {
      callback({ ok: true, username });
    }
  });

  socket.on('connect-tiktok', (payload: any) => {
    const rawUsername = typeof payload === 'string' ? payload : payload?.username;
    const isTestMode = typeof payload === 'object' && Boolean(payload?.isTestMode);
    const provider = typeof payload === 'object' ? payload?.provider : undefined;
    startTikTokSession({
      rawUsername,
      isTestMode,
      provider,
      socket,
    });
  });

  socket.on('disconnect-tiktok', () => {
    stopTikTokSession();
  });

  socket.on('chat-message', (data) => {
    const comment = extractCommentText(data);
    if (!comment) return;
    const { uniqueId, nickname } = extractUserIdentity(data);
    const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
    recordAndEmitEvent('chat-message', {
      ...data,
      uniqueId,
      nickname,
      comment,
      profilePictureUrl,
    });
  });

  socket.on('like-event', (data) => {
    const { uniqueId, nickname } = extractUserIdentity(data);
    const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
    recordAndEmitEvent('like-event', {
      ...data,
      uniqueId,
      nickname,
      likeCount: Number(data?.likeCount ?? data?.count) || 1,
      totalLikeCount: Number(data?.totalLikeCount ?? data?.total) || 1,
      profilePictureUrl,
    });
  });

  socket.on('gift-event', (data) => {
    const { uniqueId, nickname } = extractUserIdentity(data);
    const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
    recordAndEmitEvent('gift-event', {
      ...data,
      uniqueId,
      nickname,
      giftName: data?.giftName || data?.gift?.name || 'Gift',
      diamondCount: Number(data?.diamondCount ?? data?.gift?.diamondCount) || 1,
      repeatCount: Number(data?.repeatCount) || 1,
      repeatEnd: data?.repeatEnd !== false && data?.repeatEnd !== 0,
      profilePictureUrl,
    });
  });
});

function handleWebhookEvent(
  provider: 'tiktok' | 'tikfinity' | 'bettertok',
  req: express.Request,
  res: express.Response
) {
  const rawPayload = { ...(req.query || {}), ...(req.body || {}) };
  const { uniqueId, nickname } = extractUserIdentity(rawPayload);
  const profilePictureUrl = extractProfilePicture(rawPayload, uniqueId || nickname);
  const eventType = String(
    rawPayload.type || rawPayload.eventType || rawPayload.event_type || ''
  ).toLowerCase();

  // Check if it's a gift event
  if (
    eventType === 'gift' ||
    rawPayload.giftName ||
    rawPayload.gift_name ||
    rawPayload.giftId ||
    rawPayload.diamondCount
  ) {
    const giftName = String(
      rawPayload.giftName || rawPayload.gift_name || rawPayload.gift?.name || 'Gift'
    ).trim();
    const diamondCount =
      Number(rawPayload.diamondCount ?? rawPayload.diamonds ?? rawPayload.gift?.diamondCount) || 1;
    const repeatCount = Number(rawPayload.repeatCount ?? rawPayload.repeat_count ?? rawPayload.count) || 1;
    recordAndEmitEvent('gift-event', {
      uniqueId,
      nickname,
      giftName,
      diamondCount,
      repeatCount,
      repeatEnd: true,
      profilePictureUrl,
    });
    res.json({ ok: true, provider, type: 'gift', uniqueId, nickname, profilePictureUrl });
    return;
  }

  // Check if it's a like event
  if (eventType === 'like' || rawPayload.likeCount || rawPayload.like_count) {
    const likeCount = Number(rawPayload.likeCount ?? rawPayload.like_count ?? rawPayload.count) || 1;
    const totalLikeCount = Number(rawPayload.totalLikeCount ?? rawPayload.total) || likeCount;
    recordAndEmitEvent('like-event', {
      uniqueId,
      nickname,
      likeCount,
      totalLikeCount,
      profilePictureUrl,
    });
    res.json({ ok: true, provider, type: 'like', uniqueId, nickname, profilePictureUrl });
    return;
  }

  // Otherwise process as a chat message
  const comment = extractCommentText(rawPayload);
  if (comment) {
    recordAndEmitEvent('chat-message', {
      uniqueId,
      nickname,
      comment,
      profilePictureUrl,
    });
    res.json({
      ok: true,
      provider,
      type: 'chat',
      uniqueId,
      nickname,
      comment,
      profilePictureUrl,
    });
    return;
  }

  res.status(400).json({ error: 'Missing chat comment or event payload' });
}

// REST connect & disconnect endpoints (fallback when WebSockets are blocked on live hosting)
app.post('/api/tiktok/connect', (req, res) => {
  const body = { ...(req.query || {}), ...(req.body || {}) };
  const result = startTikTokSession({
    rawUsername: body.username,
    isTestMode: Boolean(body.isTestMode),
    provider: body.provider,
  });
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json({
    ok: true,
    connected: true,
    username: result.username,
    roomId: result.roomId,
    provider: result.provider,
  });
});

app.post('/api/tiktok/disconnect', (_req, res) => {
  stopTikTokSession();
  res.json({ ok: true, connected: false });
});

// Poll recent events (fallback when WebSockets are blocked on live hosting)
app.get('/api/tiktok/events', (req, res) => {
  const since = Number(req.query.since) || 0;
  const events = recentEvents.filter((ev) => ev.timestamp > since);
  res.json({
    ok: true,
    connected: Boolean(tiktokConn || currentConnectedUsername),
    username: currentConnectedUsername || '',
    roomId: currentRoomId || '',
    events,
  });
});

// REST webhook endpoints (supporting both POST and GET for Tikfinity, BetterTok, and TikTok relays)
app.post('/api/tiktok/event', (req, res) => handleWebhookEvent('tiktok', req, res));
app.get('/api/tiktok/event', (req, res) => handleWebhookEvent('tiktok', req, res));

app.post('/api/tikfinity/event', (req, res) => handleWebhookEvent('tikfinity', req, res));
app.get('/api/tikfinity/event', (req, res) => handleWebhookEvent('tikfinity', req, res));

app.post('/api/bettertok/event', (req, res) => handleWebhookEvent('bettertok', req, res));
app.get('/api/bettertok/event', (req, res) => handleWebhookEvent('bettertok', req, res));

app.get('/api/tiktok/status', (_req, res) => {
  res.json({
    connected: Boolean(tiktokConn || currentConnectedUsername),
    username: currentConnectedUsername || '',
    roomId: currentRoomId || '',
    provider: currentProvider,
  });
});

// Download Hostinger ZIP endpoint
app.get('/api/download-hostinger-zip', (_req, res) => {
  const zipPath = path.join(__dirname, 'public', 'the-missing-piece-hostinger.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'the-missing-piece-hostinger.zip');
  } else {
    res.status(404).json({ error: 'Zip bundle not found' });
  }
});

// Mount Vite middleware in development or serve static build in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupViteOrStatic();
