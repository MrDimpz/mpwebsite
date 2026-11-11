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

function extractProfilePicture(data: any): string {
  if (!data) return '';
  if (typeof data.profilePictureUrl === 'string' && data.profilePictureUrl.startsWith('http')) {
    return data.profilePictureUrl;
  }
  const user = data.user || data;
  if (typeof user.profilePictureUrl === 'string' && user.profilePictureUrl.startsWith('http')) {
    return user.profilePictureUrl;
  }
  const candidates = [
    user?.profilePicture?.urls?.[0],
    user?.profilePicture?.mUrls?.[0],
    user?.avatarThumb?.urls?.[0],
    user?.avatarThumb?.mUrls?.[0],
    user?.avatarMedium?.urls?.[0],
    user?.avatarLarge?.urls?.[0],
  ];
  for (const url of candidates) {
    if (typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }
  return '';
}

io.on('connection', (socket) => {
  socket.emit('tiktok-status', {
    connected: Boolean(tiktokConn && currentConnectedUsername),
    username: currentConnectedUsername || '',
    roomId: currentRoomId || '',
  });

  socket.on('register-streamer', (data: any) => {
    // Acknowledge streamer session registration
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
      });
      io.emit('tiktok-status', {
        connected: true,
        username: cleanUsername,
        roomId: currentRoomId,
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
          socket.emit('tiktok-connected', { username: cleanUsername, roomId: currentRoomId });
          io.emit('tiktok-status', {
            connected: true,
            username: cleanUsername,
            roomId: currentRoomId,
          });
        })
        .catch((err) => {
          // If the user is not currently broadcasting live on TikTok or TikTok blocks room scraping,
          // activate the Live Relay / Simulation room so the game connects cleanly and accepts chat/webhook events.
          console.warn(
            `[TikTok Live] Direct room scrape for @${cleanUsername} unavailable (${err?.message || 'offline'}); activating Live Relay room.`
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
          });
          io.emit('tiktok-status', {
            connected: true,
            username: cleanUsername,
            roomId: currentRoomId,
          });
        });

      activeConn.on(WebcastEvent.CHAT, (data: any) => {
        const uniqueId = data?.user?.uniqueId || data?.uniqueId || 'viewer';
        const nickname = data?.user?.nickname || data?.nickname || uniqueId;
        const comment = String(data?.comment || data?.content || '').trim();
        if (!comment) return;
        const profilePictureUrl = extractProfilePicture(data);
        console.log(`[TikTok Chat] ${nickname}: "${comment}"`);
        io.emit('chat-message', {
          uniqueId,
          nickname,
          comment,
          profilePictureUrl,
        });
      });

      activeConn.on(WebcastEvent.LIKE, (data: any) => {
        const uniqueId = data?.user?.uniqueId || data?.uniqueId || 'viewer';
        const nickname = data?.user?.nickname || data?.nickname || uniqueId;
        const likeCount = Number(data?.likeCount) || 1;
        const totalLikeCount = Number(data?.totalLikeCount) || likeCount;
        const profilePictureUrl = extractProfilePicture(data);
        io.emit('like-event', {
          uniqueId,
          nickname,
          likeCount,
          totalLikeCount,
          profilePictureUrl,
        });
      });

      activeConn.on(WebcastEvent.GIFT, (data: any) => {
        const uniqueId = data?.user?.uniqueId || data?.uniqueId || 'viewer';
        const nickname = data?.user?.nickname || data?.nickname || uniqueId;
        const giftName = data?.giftName || data?.giftDetails?.giftName || 'Gift';
        const diamondCount = Number(data?.diamondCount || data?.giftDetails?.diamondCount) || 1;
        const repeatCount = Number(data?.repeatCount) || 1;
        const repeatEnd = data?.repeatEnd !== false;
        const profilePictureUrl = extractProfilePicture(data);
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
      });
      io.emit('tiktok-status', {
        connected: true,
        username: cleanUsername,
        roomId: currentRoomId,
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
      currentConnectedUsername = null;
      currentRoomId = null;
    }
    io.emit('tiktok-disconnected');
    io.emit('tiktok-status', { connected: false, username: '', roomId: '' });
  });

  socket.on('chat-message', (data) => io.emit('chat-message', data));
  socket.on('like-event', (data) => io.emit('like-event', data));
  socket.on('gift-event', (data) => io.emit('gift-event', data));
});

// REST webhook endpoint for external relay tools / OBS scripts (Tikfinity)
app.post('/api/tiktok/event', (req, res) => {
  const { comment, nickname, uniqueId, profilePictureUrl } = req.body || {};
  const cleanComment = String(comment || req.body?.word || req.body?.text || '').trim();
  if (cleanComment) {
    io.emit('chat-message', {
      uniqueId: uniqueId || nickname || 'viewer',
      nickname: nickname || 'TikTok Player',
      comment: cleanComment,
      profilePictureUrl: profilePictureUrl || '',
    });
    res.json({ ok: true, provider: 'tiktok', type: 'chat' });
    return;
  }
  res.status(400).json({ error: 'Missing chat comment' });
});

app.post('/api/tikfinity/event', (req, res) => {
  const body = req.body || {};
  const comment = String(body.comment || body.message || body.text || '').trim();
  const nickname = String(body.nickname || body.name || 'Tikfinity Viewer').trim();
  const uniqueId = String(body.uniqueId || body.username || nickname.toLowerCase().replace(/\s+/g, '_')).trim();
  const profilePictureUrl = String(body.profilePictureUrl || body.avatar || '').trim();

  if (comment) {
    io.emit('chat-message', {
      uniqueId,
      nickname,
      comment,
      profilePictureUrl,
    });
    res.json({ ok: true, provider: 'tikfinity', type: 'chat' });
    return;
  }
  res.status(400).json({ error: 'Missing chat message' });
});

app.post('/api/bettertok/event', (req, res) => {
  const body = req.body || {};
  const comment = String(body.message || body.text || body.comment || body.content || '').trim();
  const userObj = body.user || body.sender || {};
  const nickname = String(userObj.nickname || userObj.name || body.nickname || 'BetterTok Viewer').trim();
  const uniqueId = String(userObj.uniqueId || userObj.username || body.uniqueId || nickname.toLowerCase().replace(/\s+/g, '_')).trim();
  const profilePictureUrl = String(userObj.profilePictureUrl || userObj.avatar || body.profilePictureUrl || '').trim();

  if (comment) {
    io.emit('chat-message', {
      uniqueId,
      nickname,
      comment,
      profilePictureUrl,
    });
    res.json({ ok: true, provider: 'bettertok', type: 'chat' });
    return;
  }
  res.status(400).json({ error: 'Missing chat message' });
});

app.get('/api/tiktok/status', (_req, res) => {
  res.json({
    connected: Boolean(tiktokConn && currentConnectedUsername),
    username: currentConnectedUsername || '',
    roomId: currentRoomId || '',
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
