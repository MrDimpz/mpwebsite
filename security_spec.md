# Firestore Security Specification

## 1. Access Control Matrix

| Collection Path | `get` | `list` | `create` | `update` | `delete` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/leaderboard/{entryId}` | Public (visitors & signed-in players; no PII stored) | Public (visitors & signed-in players; no PII stored) | Signed-in owner (`incoming().userId == request.auth.uid`) | Signed-in owner (`existing().userId == request.auth.uid`) | Signed-in owner (`existing().userId == request.auth.uid`) |
| `/highscores/{scoreId}` | Public (visitors & signed-in players; no PII stored) | Public (visitors & signed-in players; no PII stored) | Signed-in owner (`incoming().userId == request.auth.uid`) | Signed-in owner (`existing().userId == request.auth.uid`) | Signed-in owner (`existing().userId == request.auth.uid`) |

## 2. Schema & Validation Constraints

### `/leaderboard/{entryId}`
- **Document ID (`entryId`)**: `size() >= 1 && size() <= 128 && matches('^[a-zA-Z0-9_-]+$')`
- **Allowed Keys**: `['userId', 'displayName', 'gameId', 'puzzleId', 'puzzleTitle', 'score', 'metricLabel', 'subMetricLabel', 'createdAt', 'updatedAt']` (exact 10 required keys)
- **`userId`**: `string`, `1..64` chars, matches `^[a-zA-Z0-9_-]+$`, must equal `request.auth.uid` on create and `existing().userId` on update.
- **`displayName`**: `string`, `1..60` chars (public nickname, no PII).
- **`gameId`**: `string`, in `['crossword', 'rebus', 'squared', 'thematix']`, immutable on update.
- **`puzzleId`**: `string`, `1..64` chars, matches `^[a-zA-Z0-9_-]+$`, immutable on update.
- **`puzzleTitle`**: `string`, `1..100` chars.
- **`score`**: `int`, `0..1000000`, must be `>= existing().score` on update.
- **`metricLabel`**: `string`, `1..60` chars.
- **`subMetricLabel`**: `string`, `1..80` chars.
- **`createdAt`**: `timestamp`, `== request.time` on create, `== existing().createdAt` on update.
- **`updatedAt`**: `timestamp`, `== request.time` on create and update.

### `/highscores/{scoreId}`
- **Document ID (`scoreId`)**: `size() >= 1 && size() <= 128 && matches('^[a-zA-Z0-9_-]+$')`
- **Allowed Keys**: `['userId', 'displayName', 'puzzleId', 'mode', 'score', 'wordsFound', 'totalWords', 'bonusWordsCount', 'foundFeatured', 'createdAt', 'updatedAt']` (exact 11 required keys)
- **`userId`**: `string`, `1..64` chars, matches `^[a-zA-Z0-9_-]+$`, must equal `request.auth.uid` on create and `existing().userId` on update.
- **`displayName`**: `string`, `1..60` chars.
- **`puzzleId`**: `string`, `1..64` chars, matches `^[a-zA-Z0-9_-]+$`, immutable on update.
- **`mode`**: `string`, in `['express-3x3', 'daily-4x4', 'royal-5x5']`, immutable on update.
- **`score`**: `int`, `0..100000`, must be `>= existing().score` on update.
- **`wordsFound`**: `int`, `0..500`, must be `<= incoming().totalWords`.
- **`totalWords`**: `int`, `1..500`, immutable on update.
- **`bonusWordsCount`**: `int`, `0..500`.
- **`foundFeatured`**: `bool`.
- **`createdAt`**: `timestamp`, `== request.time` on create, `== existing().createdAt` on update.
- **`updatedAt`**: `timestamp`, `== request.time` on create and update.

## 3. Business Logic Invariants
- Ownership (`userId`), game identity (`gameId`), and puzzle identity (`puzzleId`) are immutable after creation.
- High scores are monotonic (`incoming().score >= existing().score`).
- Timestamps (`createdAt`, `updatedAt`) are strictly bound to `request.time`.

## 4. Abuse & Denial-of-Wallet Resistance
- Zero `get()` calls inside rules.
- Strict string length bounds (`<= 60..100` chars) and key whitelisting (`keys().hasOnly(...)`) prevent document bloat.
