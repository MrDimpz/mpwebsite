/**
 * Client-side progress, scoring and leaderboard for the crossword game,
 * synced with the unified Firebase Auth & Firestore public leaderboard.
 */

import type { ClueDifficulty, GridSizeOption, LeaderboardEntry } from '@/data/crossword-types';
import {
	auth,
	getCleanDisplayName,
	saveUnifiedLeaderboardScore,
	type User,
} from '@/lib/unified-game-auth';

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

export function formatClock(totalSeconds: number): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
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
	const currentUser = auth.currentUser;
	const playerName = currentUser ? getCleanDisplayName(currentUser) : 'You';

	const entry: LeaderboardEntry = {
		id: `${args.puzzleId}-${Date.now()}`,
		playerName,
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
		isCloudSynced: Boolean(currentUser),
	};
	const board = loadLeaderboard();
	board.push(entry);
	board.sort((a, b) => b.score - a.score);
	const trimmed = board.slice(0, 50);
	safeWrite(LEADERBOARD_KEY, trimmed);

	if (currentUser && args.score > 0) {
		saveUnifiedLeaderboardScore({
			user: currentUser,
			gameId: 'crossword',
			puzzleId: args.puzzleId,
			puzzleTitle: args.puzzleTitle,
			score: args.score,
			metricLabel: `${args.score.toLocaleString('en-GB')} pts`,
			subMetricLabel: `${args.gridSize}×${args.gridSize} · ${tier} · ${formatClock(args.timeSeconds)}`,
		}).catch(() => {});
	}

	return entry;
}

export async function syncLocalCrosswordScoresToCloud(user: User): Promise<void> {
	const localEntries = loadLeaderboard();
	for (const entry of localEntries.slice(0, 15)) {
		if (entry.score > 0) {
			await saveUnifiedLeaderboardScore({
				user,
				gameId: 'crossword',
				puzzleId: entry.puzzleId || 'crossword-daily',
				puzzleTitle: entry.puzzleTitle || 'Daily Crossword',
				score: entry.score,
				metricLabel: `${entry.score.toLocaleString('en-GB')} pts`,
				subMetricLabel: `${entry.gridSize}×${entry.gridSize} · ${entry.clueDifficulty} · ${formatClock(entry.timeSeconds)}`,
			}).catch(() => {});
		}
	}
}
