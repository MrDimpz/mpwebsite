import React from 'react';
import { GameMode } from '../types/game';
import { HelpCircle, KeyRound, PenLine } from 'lucide-react';
import { sound } from '../utils/sound';

interface ModeToggleProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  guessesCount: number;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange, guessesCount }) => {
  const handleSelect = (newMode: GameMode) => {
    if (newMode !== mode) {
      sound.playModeToggle(newMode);
      onModeChange(newMode);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-3">
      <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center justify-between shadow-inner border border-slate-200 dark:border-slate-800">
        {/* Guess Mode Button (Purple) */}
        <button
          type="button"
          onClick={() => handleSelect('GUESS')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
            mode === 'GUESS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <KeyRound className="w-5 h-5 shrink-0" />
          <div className="flex flex-col sm:flex-row items-center sm:gap-2 text-center sm:text-left">
            <span>Guess Mode</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                mode === 'GUESS'
                  ? 'bg-purple-700/80 text-purple-100'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              +1 Guess / letter
            </span>
          </div>
        </button>

        {/* Fill Mode Button (Green) */}
        <button
          type="button"
          onClick={() => handleSelect('FILL')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
            mode === 'FILL'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <PenLine className="w-5 h-5 shrink-0" />
          <div className="flex flex-col sm:flex-row items-center sm:gap-2 text-center sm:text-left">
            <span>Fill Mode</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                mode === 'FILL'
                  ? 'bg-emerald-700/80 text-emerald-100'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              0 Guess penalty
            </span>
          </div>
        </button>
      </div>

      {/* Mode hint & Guess counter bar */}
      <div className="flex items-center justify-between text-xs mt-2 px-1 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              mode === 'GUESS' ? 'bg-purple-500 animate-ping' : 'bg-emerald-500 animate-ping'
            }`}
          />
          <span className="font-medium">
            {mode === 'GUESS'
              ? 'Tap any letter below to reveal all matches in the puzzle.'
              : 'Click any letter slot and type answers directly.'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-slate-400">Letter Guesses:</span>
          <span
            className={`px-2 py-0.5 rounded-md font-mono text-sm ${
              guessesCount === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {guessesCount}
          </span>
        </div>
      </div>
    </div>
  );
};
