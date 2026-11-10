import { GameStats } from '../types/game';

const STATS_KEY = 'thematik_game_stats';
const PROGRESS_PREFIX = 'thematik_progress_';

const DEFAULT_STATS: GameStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
  lastPlayedDate: '',
};

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota
  }
}

export function recordWin(guessesCount: number, puzzleDate: string) {
  const stats = loadStats();
  stats.played += 1;
  stats.won += 1;

  // Streak logic
  stats.currentStreak += 1;
  if (stats.currentStreak > stats.maxStreak) {
    stats.maxStreak = stats.currentStreak;
  }

  // Distribution
  const bucket = Math.min(guessesCount, 10);
  stats.guessDistribution[bucket] = (stats.guessDistribution[bucket] || 0) + 1;
  stats.lastPlayedDate = puzzleDate;

  saveStats(stats);
  return stats;
}

export function recordLoss(puzzleDate: string) {
  const stats = loadStats();
  stats.played += 1;
  stats.currentStreak = 0;
  stats.lastPlayedDate = puzzleDate;
  saveStats(stats);
  return stats;
}

export interface SavedPuzzleProgress {
  guessedLetters: string[];
  letterGuessesCount: number;
  filledWords: string[];
  filledThemeWord?: string;
  themeWord?: string;
  isSolved: boolean;
  isGivenUp: boolean;
}

export function loadPuzzleProgress(puzzleId: string): SavedPuzzleProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + puzzleId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePuzzleProgress(puzzleId: string, progress: SavedPuzzleProgress) {
  try {
    localStorage.setItem(PROGRESS_PREFIX + puzzleId, JSON.stringify(progress));
  } catch {
    // Ignore
  }
}
