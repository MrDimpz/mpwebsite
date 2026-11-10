import React from 'react';
import { Check, AlertCircle, ArrowDownAZ } from 'lucide-react';
import { GameMode, WordValidationStatus } from '../types/game';

interface WordRowProps {
  index: number;
  word: string; // The target solution word
  filledWord: string; // What the user has typed so far in this row
  guessedLetters: string[]; // Letters unlocked in Guess Mode
  mode: GameMode;
  isActive: boolean;
  activeLetterIndex: number;
  validationStatus: WordValidationStatus;
  isSolved: boolean;
  onSelectWord: (index: number) => void;
  onSelectLetter: (wordIndex: number, letterIndex: number) => void;
}

export const WordRow: React.FC<WordRowProps> = ({
  index,
  word,
  filledWord,
  guessedLetters,
  mode,
  isActive,
  activeLetterIndex,
  validationStatus,
  isSolved,
  onSelectWord,
  onSelectLetter,
}) => {
  const letters = word.split('');
  const isRowComplete = filledWord.length === word.length;

  // Row status styling
  const isCorrect = isSolved || validationStatus === 'correct';
  const isIncorrect = validationStatus === 'incorrect';
  const isIncomplete = validationStatus === 'incomplete';

  return (
    <div
      onClick={() => onSelectWord(index)}
      className={`relative w-full p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isCorrect
          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
          : isIncorrect
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 animate-shake'
          : isActive && mode === 'FILL'
          ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left order index badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
              isCorrect
                ? 'bg-emerald-500 text-white'
                : isIncorrect
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title={`Word #${index + 1} (in alphabetical order)`}
          >
            {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
          </div>

          <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
            {index === 0 ? 'A...' : ''}
          </span>
        </div>

        {/* Word Letter Tiles */}
        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {letters.map((targetChar, lIdx) => {
            const hasGuessedLetter = guessedLetters.includes(targetChar);
            const userLetter = filledWord[lIdx] || '';
            const isTargetLetter = isSolved ? targetChar : (userLetter || (hasGuessedLetter ? targetChar : ''));
            const isFromGuessMode = hasGuessedLetter && !userLetter;
            const isCurrentCursor = isActive && mode === 'FILL' && activeLetterIndex === lIdx && !isSolved;

            return (
              <div
                key={lIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWord(index);
                  onSelectLetter(index, lIdx);
                }}
                className={`relative w-8 h-10 sm:w-10 sm:h-12 rounded-lg border flex items-center justify-center font-mono-letter font-bold text-base sm:text-lg select-none transition-all duration-150 ${
                  isCorrect
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : isIncorrect
                    ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : isCurrentCursor
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white ring-2 ring-emerald-500 shadow-xs'
                    : isFromGuessMode
                    ? 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                    : userLetter
                    ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-transparent'
                }`}
              >
                <span>{isTargetLetter}</span>

                {/* Blinking cursor line in active cell in Fill Mode */}
                {isCurrentCursor && !userLetter && !isFromGuessMode && (
                  <span className="absolute bottom-1.5 w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400 animate-pulse rounded-full" />
                )}

                {/* Small indicator if letter was revealed by Guess Mode */}
                {isFromGuessMode && !isSolved && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500"
                    title="Letter revealed by Guess Mode"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right status icon / validation hint */}
        <div className="w-6 shrink-0 flex items-center justify-end">
          {isCorrect && (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ✓
            </span>
          )}
          {isIncorrect && (
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          )}
        </div>
      </div>
    </div>
  );
};
