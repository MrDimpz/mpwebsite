import React from 'react';
import { X, Flame, Trophy } from 'lucide-react';
import { loadStats } from '../utils/storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboardPopup?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboardPopup,
}) => {
  if (!isOpen) return null;

  const stats = loadStats();
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  // Max value in distribution to scale bar chart
  const maxGuessesCount = Math.max(1, ...Object.values(stats.guessDistribution));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-2">
            Player Records
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-white">
            Statistics & Streaks
          </h2>
        </div>

        {/* 4 Key KPI cards */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white block">
              {stats.played}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Played
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
              {winRate}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Win Rate
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-0.5 text-amber-500 font-mono font-bold text-xl">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{stats.currentStreak}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Streak
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-0.5 text-purple-600 dark:text-purple-400 font-mono font-bold text-xl">
              <Trophy className="w-4 h-4" />
              <span>{stats.maxStreak}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Best
            </span>
          </div>
        </div>

        {/* Guess Distribution Bar Chart */}
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Guess Distribution (Letter Guesses)
          </h4>

          <div className="space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const count = stats.guessDistribution[num] || 0;
              const pct = (count / maxGuessesCount) * 100;

              return (
                <div key={num} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-mono font-bold text-slate-400 text-right">
                    {num === 10 ? '10+' : num}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-md h-5 overflow-hidden flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-2 font-mono font-bold text-[11px] transition-all duration-500 ${
                        count > 0
                          ? 'bg-purple-600 text-white min-w-[24px]'
                          : 'bg-transparent text-slate-400'
                      }`}
                      style={{ width: count > 0 ? `${Math.max(8, pct)}%` : '0%' }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {onOpenLeaderboardPopup && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLeaderboardPopup();
              }}
              className="w-full py-3 rounded-xl bg-[#2B0938] text-[#F6C915] hover:opacity-95 font-bold text-sm flex items-center justify-center gap-2 transition-opacity cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>View Visitor Leaderboard</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
