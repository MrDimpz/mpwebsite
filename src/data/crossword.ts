/**
 * The first solo game: a 5×5 crossword.
 *
 * Grid layout (`null` = black block, otherwise the solution letter):
 *
 *   # C A R #
 *   T H R E W
 *   R A I S E
 *   A S S E T
 *   M E E T #
 *
 * Verified by a backtracking solver so every across and down run is a real
 * word and every shared cell agrees in both directions. Ten distinct answers.
 */

export type CrosswordCell = { row: number; col: number };

export type CrosswordEntry = {
	number: number;
	direction: 'across' | 'down';
	clue: string;
	answer: string;
	cells: CrosswordCell[];
};

export const CROSSWORD_SIZE = 5;

export const CROSSWORD_GRID: (string | null)[][] = [
	[null, 'C', 'A', 'R', null],
	['T', 'H', 'R', 'E', 'W'],
	['R', 'A', 'I', 'S', 'E'],
	['A', 'S', 'S', 'E', 'T'],
	['M', 'E', 'E', 'T', null],
];

/** Cells that begin an across or down entry, mapped `"row,col" -> number`. */
export const CROSSWORD_NUMBERS: Record<string, number> = {
	'0,1': 1,
	'0,2': 2,
	'0,3': 3,
	'1,0': 4,
	'1,4': 5,
	'2,0': 6,
	'3,0': 7,
	'4,0': 8,
};

export const CROSSWORD_ACROSS: CrosswordEntry[] = [
	{ number: 1, direction: 'across', clue: 'Vehicle with four wheels', answer: 'CAR', cells: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }] },
	{ number: 4, direction: 'across', clue: 'Past tense of toss', answer: 'THREW', cells: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }] },
	{ number: 6, direction: 'across', clue: 'Lift up, or increase a bet', answer: 'RAISE', cells: [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }] },
	{ number: 7, direction: 'across', clue: 'A valuable possession', answer: 'ASSET', cells: [{ row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }] },
	{ number: 8, direction: 'across', clue: 'Come face to face, or gather together', answer: 'MEET', cells: [{ row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }] },
];

export const CROSSWORD_DOWN: CrosswordEntry[] = [
	{ number: 1, direction: 'down', clue: 'Pursue rapidly', answer: 'CHASE', cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }] },
	{ number: 2, direction: 'down', clue: 'Emerge, or get out of bed', answer: 'ARISE', cells: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }] },
	{ number: 3, direction: 'down', clue: 'Restore to the starting state', answer: 'RESET', cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 }] },
	{ number: 4, direction: 'down', clue: 'Streetcar on rails', answer: 'TRAM', cells: [{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }] },
	{ number: 5, direction: 'down', clue: 'Opposite of dry', answer: 'WET', cells: [{ row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }] },
];
