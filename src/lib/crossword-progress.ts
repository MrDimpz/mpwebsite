/**
 * Client-side progress, scoring and leaderboard for the crossword game.
 *
 * The repository's scoring model (see `crossword-types.ts`) awards a fixed
 * base score by the easiest clue difficulty the solver used, then deducts a
 * time penalty of 10 points per full minute elapsed. We persist per-puzzle
 * completion and a rolling local leaderboard in localStorage so progress
 * survives reloads without a backend.
 *
 * All access is guarded for SSR — these helpers are no-ops on the server.
 */

import type { ClueDifficulty, GridSizeOption, LeaderboardEntry } from '@/data/crossword-types';

export type GameDifficulty = 'standard' | 'easy' | 'medium' | 'hard' | 'cryptic';

const PROGRESS_KEY = 'tmp_crossword_progress_v1';
const LEADERBOARD_KEY = 'tmp_crossword_leaderboard_v1';
const SAVED_GRIDS_KEY = 'tmp_crossword_grids_v1';

export interface PuzzleProgress {
	solved: boolean;
	timeSeconds: number;
	score: number;
	difficulty: GameDifficulty;
	completedAt: string;
}

export type ProgressMap = Record<string, PuzzleProgress>;

/** Fixed base score by the easiest clue difficulty used during a solve. */
const BASE_SCORE: Record<ClueDifficulty, number> = {
	easy: 1000,
	medium: 2000,
	hard: 3000,
};

/** Maps the in-game difficulty selector to the scoring model's three tiers. */
export function difficultyToTier(d: GameDifficulty): ClueDifficulty {
	switch (d) {
		case 'easy':
			return 'easy';
		case 'hard':
		case 'cryptic':
			return 'hard';
		case 'medium':
		case 'standard':
		default:
			return 'medium';
	}
}

const TIME_PENALTY_PER_MINUTE = 10;

export function calculateScore(
	easiest: GameDifficulty,
	timeSeconds: number,
): number {
	const tier = difficultyToTier(easiest);
	const base = BASE_SCORE[tier];
	const penalty =
		Math.floor(Math.max(0, timeSeconds) / 60) * TIME_PENALTY_PER_MINUTE;
	return Math.max(0, base - penalty);
}

function safeRead<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function safeWrite(key: string, value: unknown): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage full or disabled — ignore */
	}
}

export function loadProgress(): ProgressMap {
	return safeRead<ProgressMap>(PROGRESS_KEY, {});
}

export function loadProgressFor(puzzleId: string): PuzzleProgress | undefined {
	return loadProgress()[puzzleId];
}

export function saveProgress(puzzleId: string, progress: PuzzleProgress): void {
	const all = loadProgress();
	all[puzzleId] = progress;
	safeWrite(PROGRESS_KEY, all);
}

export function loadSavedGrid(puzzleId: string): string[][] | undefined {
	const all = safeRead<Record<string, string[][]>>(SAVED_GRIDS_KEY, {});
	return all[puzzleId];
}

export function saveGrid(puzzleId: string, letters: string[][]): void {
	const all = safeRead<Record<string, string[][]>>(SAVED_GRIDS_KEY, {});
	all[puzzleId] = letters;
	safeWrite(SAVED_GRIDS_KEY, all);
}

export function clearSavedGrid(puzzleId: string): void {
	const all = safeRead<Record<string, string[][]>>(SAVED_GRIDS_KEY, {});
	delete all[puzzleId];
	safeWrite(SAVED_GRIDS_KEY, all);
}

export function loadLeaderboard(): LeaderboardEntry[] {
	return safeRead<LeaderboardEntry[]>(LEADERBOARD_KEY, []);
}

export interface AddLeaderboardArgs {
	puzzleId: string;
	puzzleTitle: string;
	themeName: string;
	gridSize: GridSizeOption;
	score: number;
	timeSeconds: number;
	difficulty: GameDifficulty;
}

export function addLeaderboardEntry(args: AddLeaderboardArgs): LeaderboardEntry {
	const tier = difficultyToTier(args.difficulty);
	const entry: LeaderboardEntry = {
		id: `${args.puzzleId}-${Date.now()}`,
		playerName: 'You',
		puzzleId: args.puzzleId,
		puzzleTitle: args.puzzleTitle,
		themeName: args.themeName,
		gridSize: args.gridSize,
		score: args.score,
		timeSeconds: args.timeSeconds,
		hintsUsed: 0,
		easiestDifficultyUsed: tier,
		clueDifficulty: tier,
		accuracy: 100,
		completedAt: new Date().toISOString(),
		isCloudSynced: false,
	};
	const board = loadLeaderboard();
	board.push(entry);
	board.sort((a, b) => b.score - a.score);
	const trimmed = board.slice(0, 50);
	safeWrite(LEADERBOARD_KEY, trimmed);
	return entry;
}

export function formatClock(totalSeconds: number): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
