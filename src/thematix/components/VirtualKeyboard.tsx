import React, { useEffect, useCallback } from 'react';
import { GameMode } from '../types/game';
import { Delete, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { sound } from '../utils/sound';

interface VirtualKeyboardProps {
  mode: GameMode;
  guessedLetters: string[];
  puzzleLetters: Set<string>;
  onGuessLetter: (letter: string) => void;
  onTypeLetter: (letter: string) => void;
  onBackspace: () => void;
  onNavigateWord: (direction: 'prev' | 'next') => void;
  onClearActiveWord: () => void;
  isSolved: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  mode,
  guessedLetters,
  puzzleLetters,
  onGuessLetter,
  onTypeLetter,
  onBackspace,
  onNavigateWord,
  onClearActiveWord,
  isSolved,
}) => {
  // Physical keyboard listener
  const handlePhysicalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isSolved) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // ignore if user typing in a real input (e.g. search or custom modal)
      }

      const key = e.key.toUpperCase();

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (mode === 'FILL') {
          sound.playKeyClick();
          onBackspace();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigateWord('prev');
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigateWord('next');
        return;
      }

      // Check if letter A-Z
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        if (mode === 'GUESS') {
          onGuessLetter(key);
        } else {
          sound.playKeyClick();
          onTypeLetter(key);
        }
      }
    },
    [isSolved, mode, onGuessLetter, onTypeLetter, onBackspace, onNavigateWord]
  );

  useEffect(() => {
    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
  }, [handlePhysicalKeyDown]);

  const handleKeyClick = (letter: string) => {
    if (isSolved) return;
    if (mode === 'GUESS') {
      onGuessLetter(letter);
    } else {
      sound.playKeyClick();
      onTypeLetter(letter);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 mt-2 mb-4 select-none">
      <div className="bg-slate-100/90 dark:bg-slate-900/90 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Fill mode auxiliary navigation toolbar */}
        {mode === 'FILL' && (
          <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Fill Mode Active
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigateWord('prev')}
                className="p-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 font-medium cursor-pointer"
                title="Previous word row"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Prev Row</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateWord('next')}
                className="p-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 font-medium cursor-pointer"
                title="Next word row"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Next Row</span>
              </button>
              <button
                type="button"
                onClick={() => onClearActiveWord()}
                className="p-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 font-medium cursor-pointer"
                title="Clear current word"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Rows of keys */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {/* Backspace on left or right of 3rd row in fill mode */}
              {rIdx === 2 && mode === 'FILL' && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playKeyClick();
                    onBackspace();
                  }}
                  disabled={isSolved}
                  className="px-2 sm:px-3 h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Backspace"
                >
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {row.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isMatch = isGuessed && puzzleLetters.has(letter);
                const isMissed = isGuessed && !puzzleLetters.has(letter);

                let keyStyle = '';

                if (isMatch) {
                  keyStyle =
                    'bg-[#f5b82e] text-[#220536] border-amber-300 shadow-md font-extrabold cursor-not-allowed opacity-90';
                } else if (isMissed) {
                  keyStyle =
                    'bg-slate-200/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 border-transparent line-through cursor-not-allowed opacity-60';
                } else if (mode === 'GUESS') {
                  keyStyle =
                    'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-xs cursor-pointer active:scale-95';
                } else {
                  // Fill Mode styling for un-guessed letters
                  keyStyle =
                    'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-xs cursor-pointer active:scale-95';
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={isSolved || isGuessed}
                    onClick={() => handleKeyClick(letter)}
                    className={`flex-1 max-w-[42px] h-11 sm:h-12 rounded-lg font-bold text-sm sm:text-base border flex items-center justify-center transition-all ${keyStyle}`}
                  >
                    {letter}
                  </button>
                );
              })}

              {/* Backspace on right of 3rd row in fill mode */}
              {rIdx === 2 && mode === 'FILL' && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playKeyClick();
                    onBackspace();
                  }}
                  disabled={isSolved}
                  className="px-2 sm:px-3 h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
                  title="Backspace"
                >
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
