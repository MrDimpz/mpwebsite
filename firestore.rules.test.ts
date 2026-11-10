/**
 * Firestore Security Rules Specification Tests
 * Verifies positive and negative access patterns for /leaderboard/{entryId} and /highscores/{scoreId}
 */

export interface LeaderboardTestVector {
  description: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  entryId: string;
  payload?: Record<string, unknown>;
  expectedAllowed: boolean;
}

export const LEADERBOARD_RULE_TESTS: LeaderboardTestVector[] = [
  {
    description: 'Unauthenticated visitor can list public game leaderboards',
    operation: 'list',
    authUid: null,
    entryId: 'user123_crossword_daily',
    expectedAllowed: true,
  },
  {
    description: 'Signed-in player can create their own valid leaderboard score',
    operation: 'create',
    authUid: 'user123',
    entryId: 'user123_crossword_daily',
    payload: {
      userId: 'user123',
      displayName: 'Puzzle Seeker',
      gameId: 'crossword',
      puzzleId: 'daily-2026-11-09',
      puzzleTitle: 'Standard 20x20 Crossword',
      score: 2850,
      metricLabel: '2,850 pts',
      subMetricLabel: '20x20 · medium · 04:12',
    },
    expectedAllowed: true,
  },
  {
    description: 'Unauthenticated visitor cannot create a leaderboard score',
    operation: 'create',
    authUid: null,
    entryId: 'anon_crossword_daily',
    payload: {
      userId: 'anon',
      displayName: 'Anon',
      gameId: 'crossword',
      puzzleId: 'daily-2026-11-09',
      puzzleTitle: 'Standard 20x20 Crossword',
      score: 2850,
      metricLabel: '2,850 pts',
      subMetricLabel: '20x20 · medium · 04:12',
    },
    expectedAllowed: false,
  },
  {
    description: 'Signed-in player cannot spoof another userId on create',
    operation: 'create',
    authUid: 'user123',
    entryId: 'user999_crossword_daily',
    payload: {
      userId: 'user999',
      displayName: 'Spoofed',
      gameId: 'crossword',
      puzzleId: 'daily-2026-11-09',
      puzzleTitle: 'Standard 20x20 Crossword',
      score: 9999,
      metricLabel: '9,999 pts',
      subMetricLabel: '20x20',
    },
    expectedAllowed: false,
  },
];
