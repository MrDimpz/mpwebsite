/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, Puzzle, WordValidationStatus } from './types/game';
import { DAILY_PUZZLES, getTodayPuzzle, getRandomPuzzle } from './data/puzzles';
import {
  loadPuzzleProgress,
  savePuzzleProgress,
  recordWin,
  recordLoss,
} from './utils/storage';
import { sound } from './utils/sound';
import {
  getMsUntilNextLondonMidnight,
  formatTimeRemaining,
  getLondonDateString,
} from './utils/londonTime';

import { GoComicsNav } from './components/GoComicsNav';
import { ThematikBoard } from './components/ThematikBoard';
import { GameSidebar } from './components/GameSidebar';
import { HowToPlayModal } from './components/HowToPlayModal';
import { WinModal } from './components/WinModal';
import { ArchiveModal } from './components/ArchiveModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { CustomPuzzleModal } from './components/CustomPuzzleModal';
import {
  useUnifiedAuth,
  getCleanDisplayName,
  saveUnifiedLeaderboardScore,
} from '@/lib/unified-game-auth';
import { UnifiedAuthModal } from '@/components/solo-games/unified-auth-modal';

export default function App() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => getTodayPuzzle());
  const [mode, setMode] = useState<GameMode>('GUESS');
  const [view, setView] = useState<'CHOICE' | 'KEYBOARD'>('CHOICE');

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [letterGuessesCount, setLetterGuessesCount] = useState<number>(0);
  const [filledWords, setFilledWords] = useState<string[]>(['', '', '', '', '', '']);
  const [filledThemeWord, setFilledThemeWord] = useState<string>('');

  // activeRowIndex: -1 for the top theme clue answer row, 0..5 for the 6 word rows
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState<number>(0);

  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isGivenUp, setIsGivenUp] = useState<boolean>(false);

  const [wordValidation, setWordValidation] = useState<WordValidationStatus[]>([
    'neutral',
    'neutral',
    'neutral',
    'neutral',
    'neutral',
    'neutral',
  ]);
  const [themeValidation, setThemeValidation] = useState<WordValidationStatus>('neutral');

  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isHardMode, setIsHardMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('thematik_hard_mode') === 'true';
    } catch {
      return false;
    }
  });

  // London UK 00:00 midnight ticker
  const [countdownText, setCountdownText] = useState<string>(() =>
    formatTimeRemaining(getMsUntilNextLondonMidnight())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const msLeft = getMsUntilNextLondonMidnight();
      setCountdownText(formatTimeRemaining(msLeft));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Measure game container width to horizontally align the top bar logo with the main board
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setContentWidth(Math.round(rect.width));
      }
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [puzzle.id]);

  // Modals state
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'account' | 'leaderboards'>('leaderboards');
  const { user: currentUser, authReady } = useUnifiedAuth();

  // Sync solved puzzle score to unified Firestore leaderboard when user is signed in
  useEffect(() => {
    if (isSolved && !isGivenUp && authReady && currentUser) {
      const computedScore = Math.max(100, 1000 - letterGuessesCount * 35);
      saveUnifiedLeaderboardScore({
        user: currentUser,
        gameId: 'thematix',
        puzzleId: String(puzzle.id),
        puzzleTitle: `${puzzle.formattedDate} (${puzzle.themeWord})`,
        score: computedScore,
        metricLabel: `${computedScore} pts`,
        subMetricLabel: `${letterGuessesCount} letter ${
          letterGuessesCount === 1 ? 'guess' : 'guesses'
        }${isHardMode ? ' · Hard Mode' : ''}`,
      }).catch(() => {});
    }
  }, [
    isSolved,
    isGivenUp,
    authReady,
    currentUser,
    letterGuessesCount,
    puzzle.id,
    puzzle.formattedDate,
    puzzle.themeWord,
    isHardMode,
  ]);

  // Set of all unique letters in this puzzle
  const puzzleLetters = useMemo(() => {
    const letters = new Set<string>();
    puzzle.words.forEach((w) => {
      for (const char of w) {
        if (/^[A-Z]$/.test(char)) letters.add(char);
      }
    });
    for (const char of puzzle.themeWord) {
      if (/^[A-Z]$/.test(char)) letters.add(char);
    }
    return letters;
  }, [puzzle]);

  // Load saved progress when puzzle changes
  useEffect(() => {
    const saved = loadPuzzleProgress(puzzle.id);
    const isMismatched =
      saved &&
      ((saved.themeWord && saved.themeWord !== puzzle.themeWord) ||
        (saved.filledThemeWord && saved.filledThemeWord.length > puzzle.themeWord.length) ||
        (saved.filledWords &&
          saved.filledWords.some(
            (w, idx) => w.length > (puzzle.words[idx]?.length || 0)
          )));

    if (saved && !isMismatched) {
      setGuessedLetters(saved.guessedLetters || []);
      setLetterGuessesCount(saved.letterGuessesCount || 0);
      setFilledWords(saved.filledWords || ['', '', '', '', '', '']);
      setFilledThemeWord(saved.filledThemeWord || '');
      setIsSolved(saved.isSolved || false);
      setIsGivenUp(saved.isGivenUp || false);

      if (saved.isSolved) {
        setWordValidation(['correct', 'correct', 'correct', 'correct', 'correct', 'correct']);
        setThemeValidation('correct');
        setView('KEYBOARD');
      } else if (
        (saved.guessedLetters && saved.guessedLetters.length > 0) ||
        (saved.filledWords && saved.filledWords.some((w) => w.length > 0)) ||
        (saved.filledThemeWord && saved.filledThemeWord.length > 0)
      ) {
        setView('KEYBOARD');
        setWordValidation(['neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral']);
        setThemeValidation('neutral');
      } else {
        setView('CHOICE');
        setWordValidation(['neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral']);
        setThemeValidation('neutral');
      }
    } else {
      setGuessedLetters([]);
      setLetterGuessesCount(0);
      setFilledWords(['', '', '', '', '', '']);
      setFilledThemeWord('');
      setIsSolved(false);
      setIsGivenUp(false);
      setView('CHOICE');
      setWordValidation(['neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral']);
      setThemeValidation('neutral');
    }
    setActiveRowIndex(0);
    setActiveLetterIndex(0);
  }, [puzzle.id]);

  const persistProgress = useCallback(
    (
      newGuessed: string[],
      newGuessesCount: number,
      newFilled: string[],
      newTheme: string,
      solved: boolean,
      givenUp: boolean
    ) => {
      savePuzzleProgress(puzzle.id, {
        guessedLetters: newGuessed,
        letterGuessesCount: newGuessesCount,
        filledWords: newFilled,
        filledThemeWord: newTheme,
        themeWord: puzzle.themeWord,
        isSolved: solved,
        isGivenUp: givenUp,
      });
    },
    [puzzle.id, puzzle.themeWord]
  );

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2ec4b6', '#c2b1cb', '#ffb703', '#ffffff', '#8338ec'],
      });
    } catch {
      // Fallback
    }
  };

  // Check if puzzle is completely resolved (Theme Word + 6 Alphabetical Words)
  const checkWinCondition = useCallback(
    (currentGuessed: string[], currentFilled: string[], currentTheme: string) => {
      // 1. Check Theme Word
      for (let j = 0; j < puzzle.themeWord.length; j++) {
        const char = puzzle.themeWord[j];
        const typedChar = currentTheme[j];
        if (typedChar && typedChar !== ' ') {
          if (typedChar !== char) return false;
        } else if (currentGuessed.includes(char)) {
          // revealed
        } else {
          return false;
        }
      }

      // 2. Check 6 Words
      for (let i = 0; i < puzzle.words.length; i++) {
        const target = puzzle.words[i];
        const userTyped = currentFilled[i] || '';

        for (let j = 0; j < target.length; j++) {
          const char = target[j];
          const typedChar = userTyped[j];
          if (typedChar && typedChar !== ' ') {
            if (typedChar !== char) return false;
          } else if (currentGuessed.includes(char)) {
            // revealed
          } else {
            return false;
          }
        }
      }
      return true;
    },
    [puzzle.themeWord, puzzle.words]
  );

  // Guess Mode letter handler (reveals occurrences in theme word and the 6 words)
  const handleGuessLetter = useCallback(
    (letter: string) => {
      if (isSolved || isGivenUp || guessedLetters.includes(letter)) return;

      const newGuessed = [...guessedLetters, letter];
      const newGuessesCount = letterGuessesCount + 1;
      setGuessedLetters(newGuessed);
      setLetterGuessesCount(newGuessesCount);

      const letterIsPresent = puzzleLetters.has(letter);
      if (letterIsPresent) {
        sound.playLetterFound();
      } else {
        sound.playLetterMissed();
      }

      // When a letter is guessed, fill it in the correct place overwriting the existing letter if necessary
      let nextThemeWord = filledThemeWord;
      let nextFilledWords = filledWords;

      if (letterIsPresent) {
        // 1. Overwrite in theme word where letter matches
        const themeChars = filledThemeWord.split('');
        while (themeChars.length < puzzle.themeWord.length) {
          themeChars.push(' ');
        }
        for (let j = 0; j < puzzle.themeWord.length; j++) {
          if (puzzle.themeWord[j] === letter) {
            themeChars[j] = letter;
          }
        }
        nextThemeWord = themeChars.join('').trimEnd();
        setFilledThemeWord(nextThemeWord);

        // 2. Overwrite in all 6 word rows where letter matches
        nextFilledWords = filledWords.map((rowStr, rIdx) => {
          const targetWord = puzzle.words[rIdx];
          if (!targetWord || !targetWord.includes(letter)) return rowStr;
          const chars = rowStr.split('');
          while (chars.length < targetWord.length) {
            chars.push(' ');
          }
          for (let cIdx = 0; cIdx < targetWord.length; cIdx++) {
            if (targetWord[cIdx] === letter) {
              chars[cIdx] = letter;
            }
          }
          return chars.join('').trimEnd();
        });
        setFilledWords(nextFilledWords);
      }

      const hasWon = checkWinCondition(newGuessed, nextFilledWords, nextThemeWord);
      if (hasWon) {
        setIsSolved(true);
        setWordValidation(['correct', 'correct', 'correct', 'correct', 'correct', 'correct']);
        setThemeValidation('correct');
        sound.playWin();
        triggerConfetti();
        recordWin(newGuessesCount, puzzle.date);
        persistProgress(newGuessed, newGuessesCount, nextFilledWords, nextThemeWord, true, false);
        setTimeout(() => setShowWinModal(true), 600);
      } else {
        persistProgress(newGuessed, newGuessesCount, nextFilledWords, nextThemeWord, false, false);
      }
    },
    [
      isSolved,
      isGivenUp,
      guessedLetters,
      letterGuessesCount,
      puzzleLetters,
      puzzle.themeWord,
      puzzle.words,
      checkWinCondition,
      filledWords,
      filledThemeWord,
      puzzle.date,
      persistProgress,
    ]
  );

  // Helper: Check if a tile at (rowIndex, colIndex) is a guessed letter (fixed)
  const isGuessedTile = useCallback(
    (rIdx: number, cIdx: number): boolean => {
      if (rIdx === -1) {
        const char = puzzle.themeWord[cIdx];
        return Boolean(char && guessedLetters.includes(char));
      } else {
        const word = puzzle.words[rIdx];
        if (!word) return false;
        const char = word[cIdx];
        return Boolean(char && guessedLetters.includes(char));
      }
    },
    [puzzle.themeWord, puzzle.words, guessedLetters]
  );

  // Helper: Find next un-guessed tile starting from (startRow, startCol)
  const findNextUnguessedTile = useCallback(
    (startRow: number, startCol: number): { r: number; c: number } | null => {
      let r = startRow;
      let c = startCol;

      while (r <= puzzle.words.length - 1) {
        const wordLen = r === -1 ? puzzle.themeWord.length : (puzzle.words[r]?.length || 0);
        while (c < wordLen) {
          if (!isGuessedTile(r, c)) {
            return { r, c };
          }
          c++;
        }
        r++;
        c = 0;
      }
      return null;
    },
    [puzzle.themeWord.length, puzzle.words, isGuessedTile]
  );

  // Helper: Find previous un-guessed tile starting from (startRow, startCol)
  const findPrevUnguessedTile = useCallback(
    (startRow: number, startCol: number): { r: number; c: number } | null => {
      let r = startRow;
      let c = startCol;

      while (r >= -1) {
        while (c >= 0) {
          if (!isGuessedTile(r, c)) {
            return { r, c };
          }
          c--;
        }
        r--;
        if (r === -1) {
          c = puzzle.themeWord.length - 1;
        } else if (r >= 0) {
          c = (puzzle.words[r]?.length || 1) - 1;
        }
      }
      return null;
    },
    [puzzle.themeWord.length, puzzle.words, isGuessedTile]
  );

  // Fill Mode letter typing (free, zero penalty)
  const handleTypeLetter = useCallback(
    (letter: string) => {
      if (isSolved || isGivenUp || guessedLetters.includes(letter)) return;

      const target = findNextUnguessedTile(activeRowIndex, activeLetterIndex);
      if (!target) return; // All remaining tiles are fixed guessed letters

      const { r: rIdx, c: cIdx } = target;

      if (rIdx === -1) {
        // Typing into the Top Theme Clue Answer Row
        const maxLen = puzzle.themeWord.length;
        const chars = filledThemeWord.split('');
        while (chars.length < maxLen) {
          chars.push(' ');
        }
        if (!isGuessedTile(-1, cIdx)) {
          chars[cIdx] = letter;
        }

        let newThemeStr = '';
        for (let i = 0; i < maxLen; i++) {
          newThemeStr += chars[i] || ' ';
        }
        newThemeStr = newThemeStr.trimEnd();
        setFilledThemeWord(newThemeStr);

        if (themeValidation !== 'neutral') {
          setThemeValidation('neutral');
        }

        // Advance cursor to next un-guessed tile
        const nextPos = findNextUnguessedTile(-1, cIdx + 1);
        if (nextPos) {
          setActiveRowIndex(nextPos.r);
          setActiveLetterIndex(nextPos.c);
        } else {
          setActiveRowIndex(-1);
          setActiveLetterIndex(cIdx);
        }

        persistProgress(guessedLetters, letterGuessesCount, filledWords, newThemeStr, false, false);
      } else {
        // Typing into one of the 6 Word Rows
        const targetWord = puzzle.words[rIdx];
        const maxLen = targetWord.length;
        const currentWordStr = filledWords[rIdx] || '';

        const chars = currentWordStr.split('');
        while (chars.length < maxLen) {
          chars.push(' ');
        }

        if (!isGuessedTile(rIdx, cIdx)) {
          chars[cIdx] = letter;
        }

        let newWordStr = '';
        for (let i = 0; i < maxLen; i++) {
          newWordStr += chars[i] || ' ';
        }
        newWordStr = newWordStr.trimEnd();

        const newFilled = [...filledWords];
        newFilled[rIdx] = newWordStr;
        setFilledWords(newFilled);

        if (wordValidation[rIdx] !== 'neutral') {
          const nextValidation = [...wordValidation];
          nextValidation[rIdx] = 'neutral';
          setWordValidation(nextValidation);
        }

        // Advance cursor to next un-guessed tile
        const nextPos = findNextUnguessedTile(rIdx, cIdx + 1);
        if (nextPos) {
          setActiveRowIndex(nextPos.r);
          setActiveLetterIndex(nextPos.c);
        } else {
          setActiveRowIndex(rIdx);
          setActiveLetterIndex(cIdx);
        }

        persistProgress(guessedLetters, letterGuessesCount, newFilled, filledThemeWord, false, false);
      }
    },
    [
      isSolved,
      isGivenUp,
      activeRowIndex,
      activeLetterIndex,
      findNextUnguessedTile,
      isGuessedTile,
      puzzle.themeWord,
      puzzle.words,
      filledThemeWord,
      filledWords,
      themeValidation,
      wordValidation,
      persistProgress,
      guessedLetters,
      letterGuessesCount,
    ]
  );

  // Backspace handler
  const handleBackspace = useCallback(() => {
    if (isSolved || isGivenUp) return;

    if (activeRowIndex === -1) {
      // Backspace on Theme Clue Answer Row
      const chars = filledThemeWord.split('');

      if (
        activeLetterIndex < chars.length &&
        chars[activeLetterIndex] &&
        chars[activeLetterIndex] !== ' ' &&
        !isGuessedTile(-1, activeLetterIndex)
      ) {
        chars[activeLetterIndex] = ' ';
        const newTheme = chars.join('').trimEnd();
        setFilledThemeWord(newTheme);
        if (themeValidation !== 'neutral') setThemeValidation('neutral');
        persistProgress(guessedLetters, letterGuessesCount, filledWords, newTheme, false, false);
        return;
      }

      // Step backward to find nearest un-guessed tile to erase
      const prevPos = findPrevUnguessedTile(-1, activeLetterIndex - 1);
      if (prevPos) {
        setActiveRowIndex(prevPos.r);
        setActiveLetterIndex(prevPos.c);

        if (prevPos.r === -1) {
          if (!isGuessedTile(-1, prevPos.c) && chars[prevPos.c]) {
            chars[prevPos.c] = ' ';
          }
          const newTheme = chars.join('').trimEnd();
          setFilledThemeWord(newTheme);
          if (themeValidation !== 'neutral') setThemeValidation('neutral');
          persistProgress(guessedLetters, letterGuessesCount, filledWords, newTheme, false, false);
        } else {
          const rowChars = (filledWords[prevPos.r] || '').split('');
          if (!isGuessedTile(prevPos.r, prevPos.c) && rowChars[prevPos.c]) {
            rowChars[prevPos.c] = ' ';
          }
          const newFilled = [...filledWords];
          newFilled[prevPos.r] = rowChars.join('').trimEnd();
          setFilledWords(newFilled);
          persistProgress(guessedLetters, letterGuessesCount, newFilled, filledThemeWord, false, false);
        }
      }
    } else {
      // Backspace on Word Rows
      const currentWordStr = filledWords[activeRowIndex] || '';
      const chars = currentWordStr.split('');

      if (
        activeLetterIndex < chars.length &&
        chars[activeLetterIndex] &&
        chars[activeLetterIndex] !== ' ' &&
        !isGuessedTile(activeRowIndex, activeLetterIndex)
      ) {
        chars[activeLetterIndex] = ' ';
        const newFilled = [...filledWords];
        newFilled[activeRowIndex] = chars.join('').trimEnd();
        setFilledWords(newFilled);
        if (wordValidation[activeRowIndex] !== 'neutral') {
          const nextValidation = [...wordValidation];
          nextValidation[activeRowIndex] = 'neutral';
          setWordValidation(nextValidation);
        }
        persistProgress(guessedLetters, letterGuessesCount, newFilled, filledThemeWord, false, false);
        return;
      }

      // Step backward
      const prevPos = findPrevUnguessedTile(activeRowIndex, activeLetterIndex - 1);
      if (prevPos) {
        setActiveRowIndex(prevPos.r);
        setActiveLetterIndex(prevPos.c);

        if (prevPos.r === -1) {
          const themeChars = filledThemeWord.split('');
          if (!isGuessedTile(-1, prevPos.c) && themeChars[prevPos.c]) {
            themeChars[prevPos.c] = ' ';
          }
          const newTheme = themeChars.join('').trimEnd();
          setFilledThemeWord(newTheme);
          persistProgress(guessedLetters, letterGuessesCount, filledWords, newTheme, false, false);
        } else {
          const rowChars = (filledWords[prevPos.r] || '').split('');
          if (!isGuessedTile(prevPos.r, prevPos.c) && rowChars[prevPos.c]) {
            rowChars[prevPos.c] = ' ';
          }
          const newFilled = [...filledWords];
          newFilled[prevPos.r] = rowChars.join('').trimEnd();
          setFilledWords(newFilled);
          if (wordValidation[prevPos.r] !== 'neutral') {
            const nextValidation = [...wordValidation];
            nextValidation[prevPos.r] = 'neutral';
            setWordValidation(nextValidation);
          }
          persistProgress(guessedLetters, letterGuessesCount, newFilled, filledThemeWord, false, false);
        }
      }
    }
  }, [
    isSolved,
    isGivenUp,
    activeRowIndex,
    activeLetterIndex,
    filledThemeWord,
    filledWords,
    isGuessedTile,
    findPrevUnguessedTile,
    themeValidation,
    wordValidation,
    persistProgress,
    guessedLetters,
    letterGuessesCount,
  ]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (e.key === 'Backspace') {
        e.preventDefault();
        sound.playKeyClick();
        handleBackspace();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeRowIndex === 0) {
          setActiveRowIndex(-1);
          setActiveLetterIndex(0);
        } else if (activeRowIndex > 0) {
          setActiveRowIndex(activeRowIndex - 1);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeRowIndex === -1) {
          setActiveRowIndex(0);
          setActiveLetterIndex(0);
        } else if (activeRowIndex < puzzle.words.length - 1) {
          setActiveRowIndex(activeRowIndex + 1);
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveLetterIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const maxLen =
          activeRowIndex === -1
            ? puzzle.themeWord.length
            : puzzle.words[activeRowIndex].length;
        setActiveLetterIndex((prev) => Math.min(maxLen - 1, prev + 1));
        return;
      }

      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        if (mode === 'GUESS') {
          if (view === 'CHOICE') setView('KEYBOARD');
          handleGuessLetter(key);
        } else {
          sound.playKeyClick();
          if (view === 'CHOICE') setView('KEYBOARD');
          handleTypeLetter(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSolved,
    mode,
    view,
    handleGuessLetter,
    handleTypeLetter,
    handleBackspace,
    activeRowIndex,
    puzzle.themeWord.length,
    puzzle.words,
  ]);

  const solveRevertTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Solve button check (validates both the top theme answer and the 6 words)
  const handleSolve = () => {
    if (isSolved) return;

    let allCorrect = true;

    // 1. Validate Top Theme Clue Answer
    let themeComposite = '';
    let themeComplete = true;
    for (let j = 0; j < puzzle.themeWord.length; j++) {
      const char = puzzle.themeWord[j];
      const typed = filledThemeWord[j];
      if (typed && typed !== ' ') {
        themeComposite += typed;
      } else if (guessedLetters.includes(char)) {
        themeComposite += char;
      } else {
        themeComplete = false;
        themeComposite += ' ';
      }
    }

    if (themeComposite === puzzle.themeWord) {
      setThemeValidation('correct');
    } else if (!themeComplete) {
      setThemeValidation('incomplete');
      allCorrect = false;
    } else {
      setThemeValidation('incorrect');
      allCorrect = false;
    }

    // 2. Validate the 6 Words
    const newValidation: WordValidationStatus[] = [];
    for (let i = 0; i < puzzle.words.length; i++) {
      const target = puzzle.words[i];
      const userTyped = filledWords[i] || '';

      let composite = '';
      let isComplete = true;

      for (let j = 0; j < target.length; j++) {
        const char = target[j];
        const typedChar = userTyped[j];

        if (typedChar && typedChar !== ' ') {
          composite += typedChar;
        } else if (guessedLetters.includes(char)) {
          composite += char;
        } else {
          isComplete = false;
          composite += ' ';
        }
      }

      if (composite === target) {
        newValidation.push('correct');
      } else if (!isComplete) {
        newValidation.push('incomplete');
        allCorrect = false;
      } else {
        newValidation.push('incorrect');
        allCorrect = false;
      }
    }

    setWordValidation(newValidation);

    if (allCorrect) {
      if (solveRevertTimerRef.current) clearTimeout(solveRevertTimerRef.current);
      setIsSolved(true);
      sound.playWin();
      triggerConfetti();
      recordWin(letterGuessesCount, puzzle.date);
      persistProgress(guessedLetters, letterGuessesCount, filledWords, filledThemeWord, true, false);
      setTimeout(() => setShowWinModal(true), 500);
    } else {
      sound.playError();

      // Revert red/incorrect status after 10 seconds
      if (solveRevertTimerRef.current) {
        clearTimeout(solveRevertTimerRef.current);
      }
      solveRevertTimerRef.current = setTimeout(() => {
        setThemeValidation('neutral');
        setWordValidation(['neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral']);
      }, 10000);
    }
  };

  // Give Up / Reveal answers
  const handleGiveUp = () => {
    if (isSolved) return;
    if (solveRevertTimerRef.current) {
      clearTimeout(solveRevertTimerRef.current);
      solveRevertTimerRef.current = null;
    }

    setIsGivenUp(true);
    setIsSolved(true);
    setThemeValidation('correct');
    setWordValidation(['correct', 'correct', 'correct', 'correct', 'correct', 'correct']);
    recordLoss(puzzle.date);
    persistProgress(
      guessedLetters,
      letterGuessesCount,
      [...puzzle.words],
      puzzle.themeWord,
      true,
      true
    );
  };

  // Reset current puzzle to its exact starting state
  const handleReset = () => {
    if (solveRevertTimerRef.current) {
      clearTimeout(solveRevertTimerRef.current);
      solveRevertTimerRef.current = null;
    }

    sound.playKeyClick();
    setMode('GUESS');
    setView('CHOICE');
    setGuessedLetters([]);
    setLetterGuessesCount(0);
    setFilledWords(['', '', '', '', '', '']);
    setFilledThemeWord('');
    setIsSolved(false);
    setIsGivenUp(false);
    setShowWinModal(false);
    setWordValidation(['neutral', 'neutral', 'neutral', 'neutral', 'neutral', 'neutral']);
    setThemeValidation('neutral');
    setActiveRowIndex(0);
    setActiveLetterIndex(0);
    persistProgress([], 0, ['', '', '', '', '', ''], '', false, false);
  };

  const mobileInputRef = React.useRef<HTMLInputElement>(null);

  const focusMobileKeyboard = useCallback(() => {
    if (isSolved) return;
    if (mobileInputRef.current) {
      mobileInputRef.current.value = ' ';
      mobileInputRef.current.focus({ preventScroll: true });
    }
  }, [isSolved]);

  const handleMobileInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSolved) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      sound.playKeyClick();
      handleBackspace();
      if (mobileInputRef.current) {
        mobileInputRef.current.value = ' ';
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      mobileInputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeRowIndex === 0) {
        setActiveRowIndex(-1);
        setActiveLetterIndex(0);
      } else if (activeRowIndex > 0) {
        setActiveRowIndex(activeRowIndex - 1);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeRowIndex === -1) {
        setActiveRowIndex(0);
        setActiveLetterIndex(0);
      } else if (activeRowIndex < puzzle.words.length - 1) {
        setActiveRowIndex(activeRowIndex + 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveLetterIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const maxLen =
        activeRowIndex === -1
          ? puzzle.themeWord.length
          : puzzle.words[activeRowIndex].length;
      setActiveLetterIndex((prev) => Math.min(maxLen - 1, prev + 1));
      return;
    }
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSolved) {
      e.target.value = ' ';
      return;
    }

    const val = e.target.value;

    // If sentinel space was deleted (e.g. Android soft keyboard Backspace)
    if (val.length === 0) {
      sound.playKeyClick();
      handleBackspace();
      e.target.value = ' ';
      return;
    }

    // Extract any newly typed alphabetic character
    const letters = val.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (letters.length > 0) {
      const char = letters[letters.length - 1];
      if (mode === 'GUESS') {
        if (view === 'CHOICE') setView('KEYBOARD');
        handleGuessLetter(char);
      } else {
        sound.playKeyClick();
        if (view === 'CHOICE') setView('KEYBOARD');
        handleTypeLetter(char);
      }
    }

    // Reset sentinel space for continuous typing & backspace detection
    e.target.value = ' ';
  };

  const handleSelectGuessMode = () => {
    sound.playModeToggle('GUESS');
    setMode('GUESS');
    setView('KEYBOARD');
    focusMobileKeyboard();
  };

  const handleSelectFillMode = () => {
    sound.playModeToggle('FILL');
    setMode('FILL');
    setView('KEYBOARD');
    focusMobileKeyboard();
  };

  const handleSelectWordCell = (rowIdx: number, colIdx: number) => {
    setActiveRowIndex(rowIdx);
    setActiveLetterIndex(colIdx);
    if (mode !== 'FILL') {
      sound.playModeToggle('FILL');
      setMode('FILL');
    }
    if (view !== 'KEYBOARD') {
      setView('KEYBOARD');
    }
    focusMobileKeyboard();
  };

  const handleSelectThemeCell = (colIdx: number) => {
    setActiveRowIndex(-1);
    setActiveLetterIndex(colIdx);
    if (mode !== 'FILL') {
      sound.playModeToggle('FILL');
      setMode('FILL');
    }
    if (view !== 'KEYBOARD') {
      setView('KEYBOARD');
    }
    focusMobileKeyboard();
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleToggleHardMode = () => {
    sound.playKeyClick();
    setIsHardMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('thematik_hard_mode', String(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const isGuessMode = mode === 'GUESS';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
        isGuessMode ? 'bg-[#230638]' : 'bg-[#1b032e]'
      }`}
    >
      {/* Hidden input to trigger native pop-up keyboard on mobile & tablet devices */}
      <input
        ref={mobileInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        defaultValue=" "
        aria-label="Mobile keyboard input"
        onKeyDown={handleMobileInputKeyDown}
        onChange={handleMobileInputChange}
        className="fixed top-1/2 left-1/2 w-px h-px opacity-0 pointer-events-none text-base -z-10"
      />

      {/* GoComics Top Navbar */}
      <GoComicsNav
        currentDateStr={puzzle.formattedDate}
        countdownText={countdownText}
        containerWidth={contentWidth}
        isHardMode={isHardMode}
        onToggleHardMode={handleToggleHardMode}
        onOpenArchive={() => setShowArchive(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenLeaderboardPopup={() => {
          setAuthModalTab('leaderboards');
          setShowAuthModal(true);
        }}
        isSignedIn={Boolean(currentUser)}
        userDisplayName={currentUser ? getCleanDisplayName(currentUser) : undefined}
        onResetOrClose={handleReset}
      />

      {/* Main Play Area - Centered on screen */}
      <main className="flex-1 w-full flex items-center justify-center px-4 py-4 sm:py-6 overflow-y-auto">
        <div
          ref={contentRef}
          className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 sm:gap-10 lg:gap-12 my-auto"
        >
          {/* Left Side: Clue, Fillable Theme Word, Divider, 6 Alphabetical Words Grid, Speech Bubble */}
          <ThematikBoard
            themeClue={puzzle.themeClue}
            themeWord={puzzle.themeWord}
            filledThemeWord={filledThemeWord}
            themeValidation={themeValidation}
            words={puzzle.words}
            filledWords={filledWords}
            guessedLetters={guessedLetters}
            mode={mode}
            isHardMode={isHardMode}
            activeRowIndex={activeRowIndex}
            activeLetterIndex={activeLetterIndex}
            validationStatus={wordValidation}
            isSolved={isSolved}
            onSelectCell={handleSelectWordCell}
            onSelectThemeCell={handleSelectThemeCell}
            onOpenMobileKeyboard={focusMobileKeyboard}
          />

          {/* Right Side: 00 GUESSES ribbon, 4x7 Alphabetical Keyboard or Choice Cards, Mode Toggle, SOLVE button */}
          <GameSidebar
            mode={mode}
            guessesCount={letterGuessesCount}
            view={view}
            guessedLetters={guessedLetters}
            puzzleLetters={puzzleLetters}
            isSolved={isSolved}
            onSelectGuessMode={handleSelectGuessMode}
            onSelectFillMode={handleSelectFillMode}
            onGuessLetter={handleGuessLetter}
            onTypeLetter={handleTypeLetter}
            onBackspace={handleBackspace}
            onSolve={handleSolve}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>
      </main>

      {/* Modals */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <WinModal
        isOpen={showWinModal}
        puzzle={puzzle}
        letterGuessesCount={letterGuessesCount}
        onClose={() => setShowWinModal(false)}
        onSelectNext={() => {
          const idx = DAILY_PUZZLES.findIndex((p) => p.id === puzzle.id);
          if (idx < DAILY_PUZZLES.length - 1) {
            setPuzzle(DAILY_PUZZLES[idx + 1]);
          }
        }}
        onSelectRandom={() => setPuzzle(getRandomPuzzle())}
        onOpenArchive={() => setShowArchive(true)}
        onOpenLeaderboardPopup={() => {
          setAuthModalTab('leaderboards');
          setShowAuthModal(true);
        }}
      />

      <ArchiveModal
        isOpen={showArchive}
        currentPuzzleId={puzzle.id}
        onClose={() => setShowArchive(false)}
        onSelectPuzzle={(p) => setPuzzle(p)}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        onOpenLeaderboardPopup={() => {
          setAuthModalTab('leaderboards');
          setShowAuthModal(true);
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        isMuted={isMuted}
        isHardMode={isHardMode}
        onClose={() => setShowSettings(false)}
        onToggleMute={handleToggleMute}
        onToggleHardMode={handleToggleHardMode}
        onOpenStats={() => setShowStats(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenArchive={() => setShowArchive(true)}
        onOpenLeaderboardPopup={() => {
          setAuthModalTab('leaderboards');
          setShowAuthModal(true);
        }}
        onOpenAccountPopup={() => {
          setAuthModalTab('account');
          setShowAuthModal(true);
        }}
        userDisplayName={currentUser ? getCleanDisplayName(currentUser) : undefined}
        onReset={handleReset}
        onGiveUp={handleGiveUp}
        isSolved={isSolved}
      />

      <CustomPuzzleModal
        isOpen={showCustom}
        onClose={() => setShowCustom(false)}
        onPlayCustomPuzzle={(p) => setPuzzle(p)}
      />

      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        user={currentUser}
        initialGameId="thematix"
        initialTab={authModalTab}
      />
    </div>
  );
}
