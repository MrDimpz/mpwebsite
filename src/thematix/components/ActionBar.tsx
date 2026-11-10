import React from 'react';
import { CheckCircle2, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { GameMode } from '../types/game';

interface ActionBarProps {
  mode: GameMode;
  isSolved: boolean;
  onSolve: () => void;
  onReset: () => void;
  onGiveUp: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  isSolved,
  onSolve,
  onReset,
  onGiveUp,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      <div className="flex items-center justify-between gap-3">
        {/* Reset / Give up secondary buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset this puzzle"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {!isSolved && (
            <button
              type="button"
              onClick={onGiveUp}
              className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Give up and reveal answers"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Reveal</span>
            </button>
          )}
        </div>

        {/* Primary Solve Button */}
        {!isSolved ? (
          <button
            type="button"
            onClick={onSolve}
            className={`flex-1 sm:flex-initial sm:min-w-[200px] py-3 px-6 rounded-xl font-bold text-sm sm:text-base text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95 ${
              mode === 'FILL'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Check & Solve</span>
          </button>
        ) : (
          <div className="flex-1 sm:flex-initial py-3 px-6 rounded-xl font-bold text-sm sm:text-base bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Puzzle Completed!</span>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-2">
        Tip: Pressing <strong className="text-slate-600 dark:text-slate-300">Check & Solve</strong> checks your work with zero score penalty!
      </p>
    </div>
  );
};
