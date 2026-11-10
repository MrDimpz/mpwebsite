export type Direction = 'across' | 'down';

export type ClueDifficulty = 'easy' | 'medium' | 'hard';

export type GridSizeOption = 8 | 20;

export const LETTER_POINTS_PER_DIFFICULTY: Record<ClueDifficulty, number> = {
  easy: 10,
  medium: 13,
  hard: 15,
};

export const TIME_PENALTY_PER_MINUTE = 10;
export const TIME_PENALTY_INTERVAL_SECONDS = 60;

/**
 * Removes 10 points for every 60 seconds elapsed.
 */
export function calculateTimePenalty(timeSeconds: number): number {
  const safeSeconds = Math.max(0, Math.floor(timeSeconds || 0));
  return (
    Math.floor(safeSeconds / TIME_PENALTY_INTERVAL_SECONDS) *
    TIME_PENALTY_PER_MINUTE
  );
}

export function calculatePuzzleScore(
  easiestDifficulty: ClueDifficulty,
  timeSeconds: number,
  totalLetters: number = 50
): number {
  const pointsPerLetter = LETTER_POINTS_PER_DIFFICULTY[easiestDifficulty] || 10;
  const baseScore = totalLetters * pointsPerLetter;
  const penalty = calculateTimePenalty(timeSeconds);
  return Math.max(0, baseScore - penalty);
}

export const DIFFICULTY_RANK: Record<ClueDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export function getEasierDifficulty(
  a: ClueDifficulty,
  b: ClueDifficulty
): ClueDifficulty {
  return DIFFICULTY_RANK[a] <= DIFFICULTY_RANK[b] ? a : b;
}

export type ClueStyle = 'mixed' | 'cryptic' | 'standard';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY';

export type VisualThemeId = 'editorial' | 'observatory' | 'botanical' | 'mahogany';

export type EditionScheduleType =
  | 'weekday-general'
  | 'weekend-themed'
  | 'quick-8x8'
  | 'custom-themed';

export interface VisualTheme {
  id: VisualThemeId;
  name: string;
  subtitle: string;
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  gridBlocked: string;
  gridCellBg: string;
  gridCellActiveWord: string;
  gridCellFocused: string;
  gridCellText: string;
  gridCellFocusedText: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
}

export interface WordEntrySeed {
  answer: string;
  easyClue: string; // Straightforward direct definition
  mediumClue: string; // Wordplay, pun, or oblique allusion
  hardClue: string; // Complex cryptic clue with enumeration
  standardClue: string;
  crypticClue: string;
  crypticBreakdown: string;
  etymologyOrContext: string;
  defaultIsCryptic: boolean;
}

export interface PlacedClue {
  id: string; // e.g. '1-across'
  number: number;
  direction: Direction;
  row: number;
  col: number;
  answer: string;
  length: number;
  easyClue: string;
  mediumClue: string;
  hardClue: string;
  standardClue: string;
  crypticClue: string;
  crypticBreakdown: string;
  etymologyOrContext: string;
  isCrypticInMixed: boolean;
}

export interface GridCellData {
  row: number;
  col: number;
  isBlocked: boolean;
  solution: string; // '' if blocked
  number?: number;
  acrossClueId?: string;
  downClueId?: string;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  themeName: string;
  editionType: EditionScheduleType;
  gridSize: GridSizeOption; // 20 for Standard 20x20, 8 for Quick 8x8
  dayOfWeekName: string;
  subtitle: string;
  editionDate: string; // Display date e.g. 'Thursday, October 29, 2026'
  archiveDate: string; // ISO YYYY-MM-DD for exact date search & sorting
  recommendedVisualTheme: VisualThemeId;
  grid: GridCellData[][];
  clues: {
    across: PlacedClue[];
    down: PlacedClue[];
  };
  totalWhiteCells: number;
}

export interface LeaderboardEntry {
  id: string;
  uid?: string;
  playerName: string;
  puzzleId: string;
  puzzleTitle: string;
  themeName: string;
  gridSize: GridSizeOption;
  score: number; // Fixed score (1000, 2000, or 3000) based on easiest clue base chosen that day
  timeSeconds: number;
  hintsUsed: number;
  easiestDifficultyUsed: ClueDifficulty;
  clueDifficulty: ClueDifficulty;
  accuracy: number;
  completedAt: string;
  isCloudSynced?: boolean;
}

export interface PlayerProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  puzzlesSolved: number;
  totalScore: number;
}
