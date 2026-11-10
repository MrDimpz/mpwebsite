import React from 'react';
import { Trophy, Star, Eye, Calendar, Shuffle, Sparkles, X } from 'lucide-react';
import { Puzzle } from '../types/game';

interface WinModalProps {
  isOpen: boolean;
  puzzle: Puzzle;
  letterGuessesCount: number;
  onClose: () => void;
  onSelectNext: () => void;
  onSelectRandom: () => void;
  onOpenArchive: () => void;
  onOpenLeaderboardPopup?: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  puzzle,
  letterGuessesCount,
  onClose,
  onSelectRandom,
  onOpenArchive,
  onOpenLeaderboardPopup,
}) => {
  if (!isOpen) return null;

  // Star rating logic
  const getRating = (count: number) => {
    if (count <= 3) return { stars: 3, label: 'Mastermind!', color: 'text-amber-500' };
    if (count <= 7) return { stars: 2, label: 'Word Detective!', color: 'text-purple-500' };
    return { stars: 1, label: 'Puzzle Solved!', color: 'text-emerald-500' };
  };

  const rating = getRating(letterGuessesCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 text-center relative overflow-hidden">
        {/* Confetti header graphic */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#f5b82e] via-purple-600 to-[#ffd166]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close to view board"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shadow-inner border border-amber-300/40">
          <Trophy className="w-9 h-9 stroke-[2.2]" />
        </div>

        <h3 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-white">
          Brilliant Solving!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {puzzle.formattedDate}
        </p>

        {/* Rating stars with spinning 100% larger logo on either side with a 20px gap */}
        <div className="flex items-center justify-center my-4 gap-[20px]">
          <img
            src="/assets/aistudio/3d_logo_944e5372.png"
            alt="The Missing Piece Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 object-contain drop-shadow-md select-none animate-[spin_4s_linear_infinite]"
          />
          <div className="flex items-center justify-center gap-1.5 shrink-0">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-7 h-7 ${
                  star <= rating.stars
                    ? 'text-amber-400 fill-amber-400 scale-105'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <img
            src="/assets/aistudio/3d_logo_944e5372.png"
            alt="The Missing Piece Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 object-contain drop-shadow-md select-none animate-[spin_4s_linear_infinite]"
          />
        </div>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
          {rating.label}
        </div>

        {/* Score metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Letter Guesses
            </span>
            <span className="text-2xl font-bold font-mono text-amber-500 dark:text-amber-400">
              {letterGuessesCount}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Words Solved
            </span>
            <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              6 / 6
            </span>
          </div>
        </div>

        {/* Fun Fact / Trivia Card */}
        {puzzle.funFact && (
          <div className="text-left bg-purple-50/60 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 mb-5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#f5b82e]" />
              <span>Theme Trivia</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {puzzle.funFact}
            </p>
          </div>
        )}

        {/* View Game Button (Closes popup to view completed board) */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#f5b82e] via-[#ffd166] to-[#f5b82e] hover:brightness-105 active:scale-98 text-[#220536] flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all cursor-pointer mb-2.5 border border-amber-300"
        >
          <Eye className="w-4 h-4 text-[#220536]" />
          <span>View Game</span>
        </button>

        {onOpenLeaderboardPopup && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLeaderboardPopup();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#2B0938] text-[#F6C915] hover:opacity-95 flex items-center justify-center gap-1.5 transition-opacity cursor-pointer mb-2.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>View Thematix Leaderboard</span>
          </button>
        )}

        {/* Next / Archive actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Select Date</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectRandom();
            }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Puzzle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
