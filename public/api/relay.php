<?php
/**
 * Lightweight HTML/PHP Live Chat & Socket.IO v4 Long-Polling Relay for Hostinger / Apache Hosting
 * 
 * Supports:
 * - Native Socket.IO v4 / Engine.IO v4 HTTP Long-Polling (/socket.io/?EIO=4&transport=polling)
 * - Tikfinity, BetterTok, and TikTok Live webhooks (/api/tikfinity/event, /api/bettertok/event, /api/tiktok/event)
 * - REST connect/disconnect/status/events endpoints (/api/tiktok/*)
 * - Diagnostic endpoint (/api/tiktok/diagnostic)
 * - Works on standard HTML/PHP shared hosting without requiring a Node.js server.
 */

// Allow cross-origin requests and disable all caching
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true]);
    exit;
}

// Store data in a persistent local directory rather than sys_get_temp_dir()
// to prevent PHP-FPM PrivateTmp partition loss across requests.
$dataDir = __DIR__ . '/.relay_data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$storeFile = $dataDir . '/store_v4.json';

// Fallback to sys_get_temp_dir() only if local directory is not writable
if (!is_writable($dataDir) && !file_exists($storeFile)) {
    $storeFile = sys_get_temp_dir() . '/the_missing_piece_live_relay_v4.json';
}

function loadRelayState($file) {
    $default = [
        'connected' => false,
        'username' => '',
        'roomId' => '',
        'provider' => 'tikfinity',
        'events' => [],
        'sessions' => [],
        'lastWebhookTime' => 0,
        'lastWebhookProvider' => '',
        'totalWebhooksReceived' => 0
    ];
    if (!file_exists($file)) {
        return $default;
    }
    $raw = @file_get_contents($file);
    if (!$raw) {
        return $default;
    }
    $decoded = @json_decode($raw, true);
    if (!is_array($decoded)) {
        return $default;
    }
    return array_merge($default, $decoded);
}

function saveRelayState($file, $state) {
    if (isset($state['events']) && is_array($state['events']) && count($state['events']) > 150) {
        $state['events'] = array_slice($state['events'], -150);
    }
    $nowSec = time();
    if (isset($state['sessions']) && is_array($state['sessions'])) {
        foreach ($state['sessions'] as $sid => $sess) {
            if (($nowSec - ($sess['updated'] ?? 0)) > 180) {
                unset($state['sessions'][$sid]);
            }
        }
    }
    @file_put_contents($file, json_encode($state), LOCK_EX);
}

function isPlaceholder($val) {
    if (!is_string($val)) return true;
    $t = trim($val);
    if ($t === '' || $t === 'undefined' || $t === 'null') return true;
    if (preg_match('/^\{.*\}$/', $t) || preg_match('/^\$\{.*\}$/', $t) || preg_match('/^%.*%$/', $t)) {
        return true;
    }
    return false;
}

function normalizeUrl($url) {
    if (!is_string($url)) return '';
    $t = trim($url);
    if (isPlaceholder($t)) return '';
    if (strpos($t, '//') === 0) return 'https:' . $t;
    if (strpos($t, 'http://') === 0 || strpos($t, 'https://') === 0) return $t;
    return '';
}

function extractImage($field) {
    if (!$field) return '';
    if (is_string($field)) return normalizeUrl($field);
    if (is_array($field)) {
        $listKeys = ['urlList', 'urls', 'url_list', 'mUrls', 'url'];
        foreach ($listKeys as $k) {
            if (isset($field[$k])) {
                $found = extractImage($field[$k]);
                if ($found !== '') return $found;
            }
        }
        foreach ($field as $item) {
            $found = extractImage($item);
            if ($found !== '') return $found;
        }
    }
    return '';
}

function normalizeIncomingEventPayload($payload, $nowMs) {
    // 1. If payload contains a stringified 'data' field, parse it
    if (isset($payload['data']) && is_string($payload['data'])) {
        $parsedData = @json_decode($payload['data'], true);
        if (is_array($parsedData)) {
            $payload = array_merge($payload, $parsedData);
        }
    } elseif (isset($payload['data']) && is_array($payload['data'])) {
        $payload = array_merge($payload, $payload['data']);
    }

    // 2. If payload contains nested 'event' object
    if (isset($payload['event']) && is_array($payload['event'])) {
        $payload = array_merge($payload, $payload['event']);
    }

    $user = isset($payload['user']) && is_array($payload['user']) ? $payload['user'] : (
        isset($payload['sender']) && is_array($payload['sender']) ? $payload['sender'] : (
            isset($payload['author']) && is_array($payload['author']) ? $payload['author'] : (
                isset($payload['common']['user']) && is_array($payload['common']['user']) ? $payload['common']['user'] : []
            )
        )
    );

    $uniqueCandidates = [
        $user['uniqueId'] ?? null,
        $user['displayId'] ?? null,
        $user['username'] ?? null,
        $user['handle'] ?? null,
        $user['user_name'] ?? null,
        $payload['uniqueId'] ?? null,
        $payload['displayId'] ?? null,
        $payload['username'] ?? null,
        $payload['handle'] ?? null,
        $payload['user_name'] ?? null,
        $payload['userId'] ?? null,
    ];
    $uniqueId = '';
    foreach ($uniqueCandidates as $c) {
        if (is_string($c) && !isPlaceholder($c)) {
            $uniqueId = ltrim(trim($c), '@');
            if ($uniqueId !== '') break;
        }
    }

    $nickCandidates = [
        $user['nickname'] ?? null,
        $user['nickName'] ?? null,
        $user['displayName'] ?? null,
        $user['display_name'] ?? null,
        $user['name'] ?? null,
        $payload['nickname'] ?? null,
        $payload['nickName'] ?? null,
        $payload['displayName'] ?? null,
        $payload['display_name'] ?? null,
        $payload['name'] ?? null,
    ];
    $nickname = '';
    foreach ($nickCandidates as $c) {
        if (is_string($c) && !isPlaceholder($c)) {
            $nickname = ltrim(trim($c), '@');
            if ($nickname !== '') break;
        }
    }
    if ($nickname === '' && $uniqueId !== '') $nickname = $uniqueId;
    if ($uniqueId === '' && $nickname !== '') $uniqueId = preg_replace('/[^a-z0-9_.-]/i', '_', strtolower($nickname));
    if ($uniqueId === '') $uniqueId = 'viewer';
    if ($nickname === '') $nickname = 'TikTok Viewer';

    $imgCandidates = [
        $payload['profilePictureUrl'] ?? null,
        $payload['profilePicture'] ?? null,
        $payload['avatarUrl'] ?? null,
        $payload['avatar'] ?? null,
        $payload['profileImage'] ?? null,
        $payload['pfp'] ?? null,
        $user['profilePictureUrl'] ?? null,
        $user['profilePicture'] ?? null,
        $user['avatarLarge'] ?? null,
        $user['avatarMedium'] ?? null,
        $user['avatarThumb'] ?? null,
        $user['avatarUrl'] ?? null,
        $user['avatar'] ?? null,
        $user['profileImage'] ?? null,
        $user['pfp'] ?? null,
    ];
    $profilePictureUrl = '';
    foreach ($imgCandidates as $cand) {
        $extracted = extractImage($cand);
        if ($extracted !== '') {
            $profilePictureUrl = $extracted;
            break;
        }
    }
    if ($profilePictureUrl === '') {
        $profilePictureUrl = 'https://i.pravatar.cc/150?u=' . rawurlencode($uniqueId ?: $nickname);
    }

    $eventType = strtolower((string)($payload['type'] ?? $payload['event'] ?? $payload['eventType'] ?? $payload['event_type'] ?? ''));
    $eventId = isset($payload['eventId']) && is_string($payload['eventId'])
        ? $payload['eventId']
        : ('php_' . $nowMs . '_' . substr(md5(uniqid('', true)), 0, 6));

    // Gift Event Detection
    if ($eventType === 'gift' || $eventType === 'gift-event' || isset($payload['giftName']) || isset($payload['gift_name']) || isset($payload['diamondCount'])) {
        return [
            'id' => $eventId,
            'timestamp' => $nowMs,
            'type' => 'gift-event',
            'shortType' => 'gift',
            'payload' => [
                'eventId' => $eventId,
                'timestamp' => $nowMs,
                'uniqueId' => $uniqueId,
                'nickname' => $nickname,
                'giftName' => (string)($payload['giftName'] ?? $payload['gift_name'] ?? $payload['gift']['name'] ?? 'Gift'),
                'diamondCount' => (int)($payload['diamondCount'] ?? $payload['diamonds'] ?? $payload['gift']['diamondCount'] ?? 1),
                'repeatCount' => (int)($payload['repeatCount'] ?? $payload['repeat_count'] ?? $payload['count'] ?? 1),
                'repeatEnd' => true,
                'profilePictureUrl' => $profilePictureUrl
            ]
        ];
    }

    // Like Event Detection
    if ($eventType === 'like' || $eventType === 'like-event' || isset($payload['likeCount']) || isset($payload['like_count'])) {
        $likeCount = (int)($payload['likeCount'] ?? $payload['like_count'] ?? $payload['count'] ?? 1);
        return [
            'id' => $eventId,
            'timestamp' => $nowMs,
            'type' => 'like-event',
            'shortType' => 'like',
            'payload' => [
                'eventId' => $eventId,
                'timestamp' => $nowMs,
                'uniqueId' => $uniqueId,
                'nickname' => $nickname,
                'likeCount' => max(1, $likeCount),
                'totalLikeCount' => (int)($payload['totalLikeCount'] ?? $payload['total'] ?? $likeCount),
                'profilePictureUrl' => $profilePictureUrl
            ]
        ];
    }

    // Chat Comment Detection
    $commentCandidates = [
        $payload['comment'] ?? null,
        $payload['content'] ?? null,
        $payload['message'] ?? null,
        $payload['text'] ?? null,
        $payload['word'] ?? null,
        $payload['msg'] ?? null,
        $payload['chatMessage'] ?? null,
        $payload['chat'] ?? null,
    ];
    $comment = '';
    foreach ($commentCandidates as $c) {
        if (is_string($c) && !isPlaceholder($c)) {
            $trimmed = trim($c);
            if ($trimmed !== '') {
                $comment = $trimmed;
                break;
            }
        }
    }

    if ($comment !== '') {
        return [
            'id' => $eventId,
            'timestamp' => $nowMs,
            'type' => 'chat-message',
            'shortType' => 'chat',
            'payload' => [
                'eventId' => $eventId,
                'timestamp' => $nowMs,
                'uniqueId' => $uniqueId,
                'nickname' => $nickname,
                'comment' => $comment,
                'profilePictureUrl' => $profilePictureUrl
            ]
        ];
    }

    return null;
}

function broadcastPacketToSessions(&$state, $sioPacket) {
    if (!isset($state['sessions']) || !is_array($state['sessions'])) {
        $state['sessions'] = [];
        return;
    }
    foreach ($state['sessions'] as $k => $_sess) {
        $state['sessions'][$k]['queue'][] = $sioPacket;
    }
}

$rawBody = file_get_contents('php://input');
$uri = isset($_SERVER['REQUEST_URI']) ? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) : '';
$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
$nowMs = round(microtime(true) * 1000);
$state = loadRelayState($storeFile);

// ============================================================================
// 0. Native Engine.IO v4 / Socket.IO v4 HTTP Long-Polling Handler (/socket.io/)
// ============================================================================
if (strpos($uri, '/socket.io') !== false || $route === 'socket.io' || isset($_GET['EIO'])) {
    header('Content-Type: text/plain; charset=UTF-8');
    $sid = isset($_GET['sid']) ? trim((string)$_GET['sid']) : '';

    // Step 1: Engine.IO v4 Handshake (GET without sid)
    if ($sid === '' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $newSid = 'eio_' . substr(md5(uniqid((string)mt_rand(), true)), 0, 16);
        $state['sessions'][$newSid] = [
            'queue' => [],
            'cursor' => $nowMs,
            'updated' => time()
        ];
        saveRelayState($storeFile, $state);
        echo '0' . json_encode([
            'sid' => $newSid,
            'upgrades' => [],
            'pingInterval' => 25000,
            'pingTimeout' => 20000,
            'maxPayload' => 1000000
        ]);
        exit;
    }

    if ($sid === '') {
        $sid = 'eio_default';
    }
    if (!isset($state['sessions'][$sid])) {
        $sioSid = 'sio_' . substr(md5($sid), 0, 12);
        $state['sessions'][$sid] = [
            'queue' => ['40' . json_encode(['sid' => $sioSid])],
            'cursor' => $nowMs,
            'updated' => time()
        ];
    }
    $state['sessions'][$sid]['updated'] = time();

    // Step 2: Client POSTing Engine.IO / Socket.IO packets
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $packets = explode("\x1e", (string)$rawBody);
        foreach ($packets as $pkt) {
            $pkt = trim($pkt);
            if ($pkt === '') continue;

            if ($pkt === '2') {
                // Engine.IO PING -> PONG
                $state['sessions'][$sid]['queue'][] = '3';
            } elseif (strpos($pkt, '40') === 0) {
                // Socket.IO Namespace CONNECT
                $sioSid = 'sio_' . substr(md5($sid), 0, 12);
                $state['sessions'][$sid]['queue'][] = '40' . json_encode(['sid' => $sioSid]);
                if (!empty($state['connected']) && !empty($state['username'])) {
                    $state['sessions'][$sid]['queue'][] = '42' . json_encode([
                        'tiktok-status',
                        [
                            'connected' => true,
                            'username' => $state['username'],
                            'roomId' => $state['roomId'] ?: 'LIVE_RELAY',
                            'provider' => $state['provider'] ?? 'tikfinity'
                        ]
                    ]);
                }
            } elseif (preg_match('/^42(\d*)(\[.*\])/s', $pkt, $m)) {
                $ackId = $m[1];
                $arr = @json_decode($m[2], true);
                if (is_array($arr) && count($arr) >= 1) {
                    $evName = (string)$arr[0];
                    $evData = $arr[1] ?? [];

                    if ($evName === 'connect-tiktok') {
                        $rawUname = is_string($evData) ? $evData : ($evData['username'] ?? 'streamer');
                        $cleanUname = ltrim(trim((string)$rawUname), '@') ?: 'streamer';
                        $isTest = is_array($evData) && !empty($evData['isTestMode']);
                        $prov = (is_array($evData) && isset($evData['provider']) && in_array($evData['provider'], ['tikfinity', 'bettertok']))
                            ? $evData['provider']
                            : ($state['provider'] ?? 'tikfinity');
                        $roomId = $isTest ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';

                        $state['connected'] = true;
                        $state['username'] = $cleanUname;
                        $state['roomId'] = $roomId;
                        $state['provider'] = $prov;

                        $connPayload = [
                            'username' => $cleanUname,
                            'roomId' => $roomId,
                            'isTestMode' => $isTest,
                            'provider' => $prov
                        ];
                        $statusPayload = [
                            'connected' => true,
                            'username' => $cleanUname,
                            'roomId' => $roomId,
                            'isTestMode' => $isTest,
                            'provider' => $prov
                        ];

                        if ($ackId !== '') {
                            $state['sessions'][$sid]['queue'][] = '43' . $ackId . json_encode([['ok' => true] + $statusPayload]);
                        }
                        broadcastPacketToSessions($state, '42' . json_encode(['tiktok-connected', $connPayload]));
                        broadcastPacketToSessions($state, '42' . json_encode(['tiktok-status', $statusPayload]));
                    } elseif ($evName === 'disconnect-tiktok') {
                        $state['connected'] = false;
                        $state['username'] = '';
                        $state['roomId'] = '';
                        broadcastPacketToSessions($state, '42' . json_encode(['tiktok-disconnected']));
                        broadcastPacketToSessions($state, '42' . json_encode([
                            'tiktok-status',
                            ['connected' => false, 'username' => '', 'roomId' => '']
                        ]));
                    } elseif ($evName === 'register-streamer' || $evName === 'streamer-auth-login') {
                        $uname = is_array($evData) ? ($evData['username'] ?? '') : '';
                        if ($ackId !== '') {
                            $state['sessions'][$sid]['queue'][] = '43' . $ackId . json_encode([['ok' => true, 'username' => $uname]]);
                        }
                        $state['sessions'][$sid]['queue'][] = '42' . json_encode(['streamer-registered', ['ok' => true, 'username' => $uname]]);
                    } elseif (in_array($evName, ['chat-message', 'like-event', 'gift-event']) && is_array($evData)) {
                        $evData['type'] = $evName;
                        $normEv = normalizeIncomingEventPayload($evData, $nowMs);
                        if ($normEv) {
                            $state['events'][] = [
                                'id' => $normEv['id'],
                                'timestamp' => $normEv['timestamp'],
                                'type' => $normEv['type'],
                                'payload' => $normEv['payload']
                            ];
                            broadcastPacketToSessions($state, '42' . json_encode([$normEv['type'], $normEv['payload']]));
                        }
                    }
                }
            }
        }
        saveRelayState($storeFile, $state);
        echo 'ok';
        exit;
    }

    // Step 3: Client GET polling for queued packets & live events
    $collectForSession = function (&$st, $sessionId) {
        $out = $st['sessions'][$sessionId]['queue'] ?? [];
        $st['sessions'][$sessionId]['queue'] = [];
        $cursor = $st['sessions'][$sessionId]['cursor'] ?? 0;
        if (!empty($st['events']) && is_array($st['events'])) {
            foreach ($st['events'] as $ev) {
                if (isset($ev['timestamp']) && $ev['timestamp'] > $cursor) {
                    $cursor = $ev['timestamp'];
                    $out[] = '42' . json_encode([$ev['type'], $ev['payload']]);
                }
            }
        }
        $st['sessions'][$sessionId]['cursor'] = $cursor;
        return $out;
    };

    $outPackets = $collectForSession($state, $sid);
    if (empty($outPackets)) {
        saveRelayState($storeFile, $state);
        usleep(350000); // 350ms non-blocking poll interval
        $state = loadRelayState($storeFile);
        if (!isset($state['sessions'][$sid])) {
            $state['sessions'][$sid] = ['queue' => [], 'cursor' => $nowMs, 'updated' => time()];
        }
        $outPackets = $collectForSession($state, $sid);
        if (empty($outPackets)) {
            $outPackets[] = '2'; // Engine.IO heartbeat PING
        }
    }

    saveRelayState($storeFile, $state);
    echo implode("\x1e", $outPackets);
    exit;
}

// ============================================================================
// REST JSON Endpoints (/api/*)
// ============================================================================
header('Content-Type: application/json; charset=utf-8');

$jsonBody = $rawBody ? @json_decode($rawBody, true) : [];
if (!is_array($jsonBody)) $jsonBody = [];
$payload = array_merge($_GET, $_POST, $jsonBody);

// 1. Connect endpoint
if (strpos($uri, '/api/tiktok/connect') !== false || $route === 'tiktok/connect') {
    $uname = isset($payload['username']) ? ltrim(trim((string)$payload['username']), '@') : 'streamer';
    if ($uname === '') $uname = 'streamer';
    $isTest = !empty($payload['isTestMode']);
    $prov = isset($payload['provider']) && in_array($payload['provider'], ['tikfinity', 'bettertok'])
        ? $payload['provider']
        : ($state['provider'] ?? 'tikfinity');
    $roomId = $isTest ? 'TEST_SIMULATION_ROOM' : 'LIVE_RELAY';

    $state['connected'] = true;
    $state['username'] = $uname;
    $state['roomId'] = $roomId;
    $state['provider'] = $prov;

    $connPayload = [
        'username' => $uname,
        'roomId' => $roomId,
        'isTestMode' => $isTest,
        'provider' => $prov
    ];
    broadcastPacketToSessions($state, '42' . json_encode(['tiktok-connected', $connPayload]));
    broadcastPacketToSessions($state, '42' . json_encode(['tiktok-status', ['connected' => true] + $connPayload]));
    saveRelayState($storeFile, $state);

    echo json_encode([
        'ok' => true,
        'connected' => true,
        'username' => $state['username'],
        'roomId' => $state['roomId'],
        'provider' => $state['provider']
    ]);
    exit;
}

// 2. Disconnect endpoint
if (strpos($uri, '/api/tiktok/disconnect') !== false || $route === 'tiktok/disconnect') {
    $state['connected'] = false;
    $state['username'] = '';
    $state['roomId'] = '';
    broadcastPacketToSessions($state, '42' . json_encode(['tiktok-disconnected']));
    broadcastPacketToSessions($state, '42' . json_encode(['tiktok-status', ['connected' => false, 'username' => '', 'roomId' => '']]));
    saveRelayState($storeFile, $state);
    echo json_encode(['ok' => true, 'connected' => false]);
    exit;
}

// 3. Status endpoint
if (strpos($uri, '/api/tiktok/status') !== false || $route === 'tiktok/status') {
    echo json_encode([
        'ok' => true,
        'connected' => !empty($state['connected']),
        'username' => $state['username'] ?? '',
        'roomId' => $state['roomId'] ?? '',
        'provider' => $state['provider'] ?? 'tikfinity',
        'lastWebhookTime' => $state['lastWebhookTime'] ?? 0,
        'lastWebhookProvider' => $state['lastWebhookProvider'] ?? '',
        'totalWebhooksReceived' => $state['totalWebhooksReceived'] ?? 0,
        'eventCount' => count($state['events'] ?? [])
    ]);
    exit;
}

// 4. Poll events endpoint
if (strpos($uri, '/api/tiktok/events') !== false || $route === 'tiktok/events') {
    $since = isset($_GET['since']) ? (float)$_GET['since'] : 0;
    $events = isset($state['events']) && is_array($state['events']) ? $state['events'] : [];
    $filtered = [];
    foreach ($events as $ev) {
        if (isset($ev['timestamp']) && $ev['timestamp'] > $since) {
            $filtered[] = $ev;
        }
    }
    echo json_encode([
        'ok' => true,
        'connected' => !empty($state['connected']),
        'username' => $state['username'] ?? '',
        'roomId' => $state['roomId'] ?? '',
        'events' => $filtered
    ]);
    exit;
}

// 5. Diagnostic Endpoint (/api/tiktok/diagnostic)
if (strpos($uri, '/api/tiktok/diagnostic') !== false || $route === 'tiktok/diagnostic') {
    $recent = array_slice($state['events'] ?? [], -10);
    echo json_encode([
        'ok' => true,
        'connected' => !empty($state['connected']),
        'username' => $state['username'] ?? '',
        'provider' => $state['provider'] ?? 'tikfinity',
        'lastWebhookTime' => $state['lastWebhookTime'] ?? 0,
        'lastWebhookProvider' => $state['lastWebhookProvider'] ?? '',
        'totalWebhooksReceived' => $state['totalWebhooksReceived'] ?? 0,
        'activeSessions' => count($state['sessions'] ?? []),
        'recentEvents' => $recent,
        'serverTime' => $nowMs,
        'storageFile' => basename($storeFile)
    ]);
    exit;
}

// 6. Webhook Event Ingestion (/api/tikfinity/event, /api/bettertok/event, /api/tiktok/event)
$webhookProvider = 'tiktok';
if (strpos($uri, 'tikfinity') !== false || strpos($route, 'tikfinity') !== false) {
    $webhookProvider = 'tikfinity';
} elseif (strpos($uri, 'bettertok') !== false || strpos($route, 'bettertok') !== false) {
    $webhookProvider = 'bettertok';
}

$normEv = normalizeIncomingEventPayload($payload, $nowMs);
if ($normEv) {
    $state['events'][] = [
        'id' => $normEv['id'],
        'timestamp' => $normEv['timestamp'],
        'type' => $normEv['type'],
        'payload' => $normEv['payload']
    ];
    $state['lastWebhookTime'] = $nowMs;
    $state['lastWebhookProvider'] = $webhookProvider;
    $state['totalWebhooksReceived'] = ($state['totalWebhooksReceived'] ?? 0) + 1;

    // Broadcast immediately to all active Socket.IO HTTP long-polling sessions!
    broadcastPacketToSessions($state, '42' . json_encode([$normEv['type'], $normEv['payload']]));

    saveRelayState($storeFile, $state);
    echo json_encode(['ok' => true, 'type' => $normEv['shortType'], 'event' => $normEv['payload'], 'provider' => $webhookProvider]);
    exit;
}

echo json_encode([
    'ok' => true,
    'status' => 'ready',
    'notice' => 'Webhook received but comment or event payload was empty. Ensure your webhook sends a comment or message string.'
]);
