export type GameMode = 'GUESS' | 'FILL';

export interface Puzzle {
  id: string; // date string 'YYYY-MM-DD'
  date: string;
  formattedDate: string;
  themeClue: string;
  themeWord: string; // The answer to the theme clue (e.g. TRICK for "___ or treat!")
  words: string[]; // Strictly 6 words in alphabetical order
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  funFact: string;
}

export type WordValidationStatus = 'neutral' | 'correct' | 'incorrect' | 'incomplete';

export interface GameState {
  puzzleId: string;
  mode: GameMode;
  guessedLetters: string[];
  letterGuessesCount: number;
  filledWords: string[]; // 6 strings
  filledThemeWord: string; // answer to the top theme clue
  activeRowIndex: number; // -1 for theme row, 0..5 for word rows
  activeLetterIndex: number;
  isSolved: boolean;
  isGivenUp: boolean;
  wordValidation: WordValidationStatus[];
  themeValidation: WordValidationStatus;
  errorFlash: boolean;
}

export interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDate: string;
}

export interface SavedPuzzleProgress {
  guessedLetters: string[];
  letterGuessesCount: number;
  filledWords: string[];
  filledThemeWord?: string;
  isSolved: boolean;
  isGivenUp: boolean;
}
