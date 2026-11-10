import React from 'react';
import { Sparkles, Calendar, Layers } from 'lucide-react';
import { GameMode } from '../types/game';

interface ThemeBannerProps {
  themeClue: string;
  themeWord: string;
  formattedDate: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  guessedLetters: string[];
  isSolved: boolean;
  mode: GameMode;
  onOpenArchive: () => void;
}

export const ThemeBanner: React.FC<ThemeBannerProps> = ({
  themeClue,
  themeWord,
  formattedDate,
  difficulty,
  guessedLetters,
  isSolved,
  mode,
  onOpenArchive,
}) => {
  // Break themeWord into characters
  const chars = themeWord.split('');

  const difficultyColors = {
    Easy: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    Medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    Challenging: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 text-center relative overflow-hidden">
        {/* Subtle accent top border matching current mode */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
            mode === 'GUESS' ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        />

        {/* Date and Difficulty badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
          <button
            onClick={onOpenArchive}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium cursor-pointer"
            title="Click to change date"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                difficultyColors[difficulty]
              }`}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Thematic Clue Headline */}
        <div className="mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" />
            Theme Clue
          </span>
          <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-slate-900 dark:text-white tracking-wide">
            "{themeClue}"
          </h2>
        </div>

        {/* Theme Word letter boxes (revealed as letters are guessed or on win) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-2">
            Category Anchor
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            {chars.map((char, idx) => {
              if (char === ' ') {
                return <span key={idx} className="w-2 sm:w-3" />;
              }
              const isRevealed = guessedLetters.includes(char) || isSolved;

              return (
                <div
                  key={idx}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border flex items-center justify-center font-mono-letter font-bold text-sm sm:text-base transition-all duration-200 ${
                    isRevealed
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 shadow-xs scale-100'
                      : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-transparent'
                  }`}
                >
                  {isRevealed ? char : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
