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
    if (payload?.provider === 'bettertok' || payload?.provider === 'tikfinity') {
      currentProvider = payload.provider;
    }

    if (tiktokConn) {
      try {
        tiktokConn.disconnect();
      } catch {
        // ignore
      }
      tiktokConn = null;
      currentConnectedUsername = null;
      currentRoomId = null;
    }

    if (!rawUsername || !String(rawUsername).trim()) {
      socket.emit('tiktok-error', 'Username is required');
      return;
    }

    const cleanUsername = String(rawUsername).trim().startsWith('@')
      ? String(rawUsername).trim().substring(1)
      : String(rawUsername).trim();

    if (isTestMode) {
      currentConnectedUsername = cleanUsername;
      currentRoomId = 'TEST_SIMULATION_ROOM';
      socket.emit('tiktok-connected', {
        username: cleanUsername,
        roomId: currentRoomId,
        isTestMode: true,
        provider: currentProvider,
      });
      io.emit('tiktok-status', {
        connected: true,
        username: cleanUsername,
        roomId: currentRoomId,
        isTestMode: true,
        provider: currentProvider,
      });
      return;
    }

    try {
      tiktokConn = new TikTokLiveConnection(cleanUsername, {
        processInitialData: false,
      });
      const activeConn = tiktokConn;
      activeConn
        .connect()
        .then((state) => {
          if (tiktokConn !== activeConn) return;
          currentConnectedUsername = cleanUsername;
          currentRoomId = state.roomId || 'LIVE';
          socket.emit('tiktok-connected', {
            username: cleanUsername,
            roomId: currentRoomId,
            provider: currentProvider,
          });
          io.emit('tiktok-status', {
            connected: true,
            username: cleanUsername,
            roomId: currentRoomId,
            provider: currentProvider,
          });
        })
        .catch((err) => {
          console.warn(
            `[TikTok Live] Direct room scrape for @${cleanUsername} unavailable (${err?.message || 'offline'}); activating Live Relay room (${currentProvider}).`
          );
          if (tiktokConn === activeConn) {
            tiktokConn = null;
          }
          currentConnectedUsername = cleanUsername;
          currentRoomId = 'LIVE_RELAY';
          socket.emit('tiktok-connected', {
            username: cleanUsername,
            roomId: currentRoomId,
            relayFallback: true,
            provider: currentProvider,
          });
          io.emit('tiktok-status', {
            connected: true,
            username: cleanUsername,
            roomId: currentRoomId,
            provider: currentProvider,
          });
        });

      activeConn.on(WebcastEvent.CHAT, (data: any) => {
        const comment = extractCommentText(data);
        if (!comment) return;
        const { uniqueId, nickname } = extractUserIdentity(data);
        const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
        console.log(`[TikTok Chat] ${nickname} (@${uniqueId}): "${comment}"`);
        io.emit('chat-message', {
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
        io.emit('like-event', {
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
        io.emit('gift-event', {
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
        if (tiktokConn === activeConn) {
          tiktokConn = null;
          currentConnectedUsername = null;
          currentRoomId = null;
        }
        io.emit('tiktok-disconnected');
        io.emit('tiktok-status', { connected: false, username: '', roomId: '' });
      });

      activeConn.on(ControlEvent.ERROR, (err: any) => {
        console.warn('TikTok connection warning:', err?.info || err);
      });
    } catch (err: any) {
      currentConnectedUsername = cleanUsername;
      currentRoomId = 'LIVE_RELAY';
      socket.emit('tiktok-connected', {
        username: cleanUsername,
        roomId: currentRoomId,
        relayFallback: true,
        provider: currentProvider,
      });
      io.emit('tiktok-status', {
        connected: true,
        username: cleanUsername,
        roomId: currentRoomId,
        provider: currentProvider,
      });
    }
  });

  socket.on('disconnect-tiktok', () => {
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
  });

  socket.on('chat-message', (data) => {
    const comment = extractCommentText(data);
    if (!comment) return;
    const { uniqueId, nickname } = extractUserIdentity(data);
    const profilePictureUrl = extractProfilePicture(data, uniqueId || nickname);
    io.emit('chat-message', {
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
    io.emit('like-event', {
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
    io.emit('gift-event', {
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
    io.emit('gift-event', {
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
    io.emit('like-event', {
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
    io.emit('chat-message', {
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

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupViteOrStatic();
