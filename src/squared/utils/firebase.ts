import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  db,
  auth,
  signInWithGooglePopup,
  loginWithEmailPassword,
  registerWithEmailPassword,
  resetAccountPassword,
  checkResetLinkParams,
  completePasswordResetWithLink,
  logoutUser,
  onAuthStateChanged,
  User,
  OperationType,
  handleFirestoreError,
  saveUnifiedLeaderboardScore,
  getCleanDisplayName,
  getCleanUserEmail,
  sanitizeLeaderboardDisplayName,
  ID_REGEX,
  MAX_ID_LENGTH,
  MAX_PUZZLE_ID_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
} from '@/lib/unified-game-auth';
import { GameModeId } from './puzzleGenerator';

export {
  db,
  auth,
  signInWithGooglePopup,
  loginWithEmailPassword,
  registerWithEmailPassword,
  resetAccountPassword,
  checkResetLinkParams,
  completePasswordResetWithLink,
  logoutUser,
  onAuthStateChanged,
  OperationType,
  handleFirestoreError,
  getCleanDisplayName,
  getCleanUserEmail,
  sanitizeLeaderboardDisplayName,
  ID_REGEX,
  MAX_ID_LENGTH,
  MAX_PUZZLE_ID_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
};
export type { User };

export const ALLOWED_MODES: GameModeId[] = ['express-3x3', 'daily-4x4', 'royal-5x5'];

const LOCAL_SQUARED_SCORES_KEY = 'mp_squared_highscores_local_v1';
const LOCAL_SQUARED_EVENT = 'mp-squared-highscores-changed';

export interface HighScoreRecord {
  id: string;
  userId: string;
  displayName: string;
  puzzleId: string;
  mode: GameModeId;
  score: number;
  wordsFound: number;
  totalWords: number;
  bonusWordsCount: number;
  foundFeatured: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

function readLocalSquaredScores(): HighScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_SQUARED_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d) => ({
      id: String(d.id || ''),
      userId: String(d.userId || ''),
      displayName: sanitizeLeaderboardDisplayName(d.displayName),
      puzzleId: String(d.puzzleId || ''),
      mode: (d.mode as GameModeId) || 'daily-4x4',
      score: Number(d.score || 0),
      wordsFound: Number(d.wordsFound || 0),
      totalWords: Number(d.totalWords || 1),
      bonusWordsCount: Number(d.bonusWordsCount || 0),
      foundFeatured: Boolean(d.foundFeatured),
      createdAt: null,
      updatedAt: null,
    }));
  } catch {
    return [];
  }
}

function writeLocalSquaredScores(scores: HighScoreRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_SQUARED_SCORES_KEY, JSON.stringify(scores));
    window.dispatchEvent(new CustomEvent(LOCAL_SQUARED_EVENT));
  } catch {}
}

/**
 * Sanitizes and records a player's high score to both `/highscores/{scoreId}`
 * and the unified solo-games `/leaderboard/{entryId}` collection.
 */
export async function saveHighScoreToFirestore(params: {
  user: User;
  puzzleId: string;
  mode: GameModeId;
  score: number;
  wordsFound: number;
  totalWords: number;
  bonusWordsCount: number;
  foundFeatured: boolean;
}): Promise<void> {
  const { user, puzzleId, mode, score, wordsFound, totalWords, bonusWordsCount, foundFeatured } =
    params;

  if (!user?.uid || score <= 0) return;

  const safeUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  const safePuzzleId = puzzleId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, MAX_PUZZLE_ID_LENGTH);
  const scoreId = `${safeUid}_${safePuzzleId}`.slice(0, MAX_ID_LENGTH);

  if (!ID_REGEX.test(safeUid) || !ID_REGEX.test(safePuzzleId) || !ID_REGEX.test(scoreId)) {
    return;
  }
  if (!ALLOWED_MODES.includes(mode)) {
    return;
  }

  const safeDisplayName = getCleanDisplayName(user);
  const safeScore = Math.max(0, Math.min(100000, Math.floor(score)));
  const safeTotalWords = Math.max(1, Math.min(500, Math.floor(totalWords)));
  const safeWordsFound = Math.max(0, Math.min(safeTotalWords, Math.floor(wordsFound)));
  const safeBonusCount = Math.max(0, Math.min(500, Math.floor(bonusWordsCount)));

  // Always update local Squared store so both Google and Email/Password users see instant records
  const localRecords = readLocalSquaredScores();
  const existingLocalIdx = localRecords.findIndex((r) => r.id === scoreId);
  if (existingLocalIdx === -1) {
    localRecords.push({
      id: scoreId,
      userId: user.uid,
      displayName: safeDisplayName,
      puzzleId: safePuzzleId,
      mode,
      score: safeScore,
      wordsFound: safeWordsFound,
      totalWords: safeTotalWords,
      bonusWordsCount: safeBonusCount,
      foundFeatured: Boolean(foundFeatured),
      createdAt: null,
      updatedAt: null,
    });
    writeLocalSquaredScores(localRecords);
  } else {
    const prev = localRecords[existingLocalIdx];
    if (
      safeScore >= prev.score &&
      (safeScore > prev.score ||
        safeWordsFound > prev.wordsFound ||
        safeBonusCount > prev.bonusWordsCount ||
        (foundFeatured && !prev.foundFeatured))
    ) {
      localRecords[existingLocalIdx] = {
        ...prev,
        displayName: safeDisplayName,
        score: safeScore,
        wordsFound: safeWordsFound,
        bonusWordsCount: safeBonusCount,
        foundFeatured: Boolean(foundFeatured || prev.foundFeatured),
      };
      writeLocalSquaredScores(localRecords);
    }
  }

  const modeTitle =
    mode === 'express-3x3'
      ? '3×3 Express'
      : mode === 'royal-5x5'
        ? '5×5 Royal'
        : '4×4 Classic';

  await saveUnifiedLeaderboardScore({
    user,
    gameId: 'squared',
    puzzleId: safePuzzleId,
    puzzleTitle: `${modeTitle} · ${safePuzzleId}`,
    score: safeScore,
    metricLabel: `${safeScore} pts`,
    subMetricLabel: `Words ${safeWordsFound}/${safeTotalWords}${foundFeatured ? ' · ★ Missing Piece' : ''}`,
  });

  if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
    return;
  }

  const docPath = `highscores/${scoreId}`;
  const docRef = doc(db, 'highscores', scoreId);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        userId: user.uid,
        displayName: safeDisplayName,
        puzzleId: safePuzzleId,
        mode,
        score: safeScore,
        wordsFound: safeWordsFound,
        totalWords: safeTotalWords,
        bonusWordsCount: safeBonusCount,
        foundFeatured: Boolean(foundFeatured),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      const existingScore = typeof existingData.score === 'number' ? existingData.score : 0;
      const existingWords = typeof existingData.wordsFound === 'number' ? existingData.wordsFound : 0;

      if (
        safeScore >= existingScore &&
        (safeScore > existingScore ||
          safeWordsFound > existingWords ||
          safeBonusCount > (existingData.bonusWordsCount || 0) ||
          (foundFeatured && !existingData.foundFeatured))
      ) {
        await updateDoc(docRef, {
          userId: existingData.userId,
          displayName: safeDisplayName,
          puzzleId: existingData.puzzleId,
          mode: existingData.mode,
          score: safeScore,
          wordsFound: safeWordsFound,
          totalWords: existingData.totalWords,
          bonusWordsCount: safeBonusCount,
          foundFeatured: Boolean(foundFeatured || existingData.foundFeatured),
          createdAt: existingData.createdAt,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Subscribes to the signed-in user's high scores in real time
 */
export function subscribeToUserHighScores(
  userId: string,
  onData: (scores: HighScoreRecord[]) => void
): () => void {
  let cloudItems: HighScoreRecord[] = [];
  const colRef = collection(db, 'highscores');
  const q = query(colRef, where('userId', '==', userId));

  const emitMerged = () => {
    const byId = new Map<string, HighScoreRecord>();
    cloudItems.forEach((item) => byId.set(item.id, item));
    readLocalSquaredScores()
      .filter((item) => item.userId === userId)
      .forEach((local) => {
        const existing = byId.get(local.id);
        if (!existing || local.score >= existing.score) {
          byId.set(local.id, local);
        }
      });
    const merged = Array.from(byId.values()).sort((a, b) => b.score - a.score);
    onData(merged);
  };

  emitMerged();

  const unsubFirestore = onSnapshot(
    q,
    (snapshot) => {
      const items: HighScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: d.userId,
          displayName: sanitizeLeaderboardDisplayName(d.displayName),
          puzzleId: d.puzzleId,
          mode: d.mode as GameModeId,
          score: d.score,
          wordsFound: d.wordsFound,
          totalWords: d.totalWords,
          bonusWordsCount: d.bonusWordsCount,
          foundFeatured: Boolean(d.foundFeatured),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      cloudItems = items;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'highscores');
    }
  );

  const onLocalUpdate = () => emitMerged();
  if (typeof window !== 'undefined') {
    window.addEventListener(LOCAL_SQUARED_EVENT, onLocalUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener(LOCAL_SQUARED_EVENT, onLocalUpdate);
    }
  };
}

/**
 * Subscribes to the global public Squared high scores for visitors to view
 */
export function subscribeToGlobalHighScores(
  onData: (scores: HighScoreRecord[]) => void
): () => void {
  let cloudItems: HighScoreRecord[] = [];
  const colRef = collection(db, 'highscores');

  const emitMerged = () => {
    const byId = new Map<string, HighScoreRecord>();
    cloudItems.forEach((item) => byId.set(item.id, item));
    readLocalSquaredScores().forEach((local) => {
      const existing = byId.get(local.id);
      if (!existing || local.score >= existing.score) {
        byId.set(local.id, local);
      }
    });
    const merged = Array.from(byId.values()).sort((a, b) => b.score - a.score);
    onData(merged);
  };

  emitMerged();

  const unsubFirestore = onSnapshot(
    colRef,
    (snapshot) => {
      const items: HighScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: d.userId,
          displayName: sanitizeLeaderboardDisplayName(d.displayName),
          puzzleId: d.puzzleId,
          mode: d.mode as GameModeId,
          score: d.score,
          wordsFound: d.wordsFound,
          totalWords: d.totalWords,
          bonusWordsCount: d.bonusWordsCount,
          foundFeatured: Boolean(d.foundFeatured),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      cloudItems = items;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'highscores');
    }
  );

  const onLocalUpdate = () => emitMerged();
  if (typeof window !== 'undefined') {
    window.addEventListener(LOCAL_SQUARED_EVENT, onLocalUpdate);
  }

  return () => {
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener(LOCAL_SQUARED_EVENT, onLocalUpdate);
    }
  };
}
