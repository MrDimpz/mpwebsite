import React from 'react';
import {
  HelpCircle,
  BarChart2,
  Calendar,
  Volume2,
  VolumeX,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  currentDateStr: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenArchive: () => void;
  onOpenCustom: () => void;
  onSelectPrevDate: () => void;
  onSelectNextDate: () => void;
  onSelectRandom: () => void;
  hasPrevDate: boolean;
  hasNextDate: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  isMuted,
  onToggleMute,
  onOpenHowToPlay,
  onOpenStats,
  onOpenArchive,
  onOpenCustom,
  onSelectPrevDate,
  onSelectNextDate,
  onSelectRandom,
  hasPrevDate,
  hasNextDate,
}) => {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Brand title & GoComics / Puzzle Society subtitle */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title text-2xl font-black tracking-wider bg-gradient-to-r from-purple-700 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
                THEMATIK
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                DAILY
              </span>
            </div>
            <div className="text-[10px] tracking-tight text-slate-400 font-medium">
              Word Association Puzzle
            </div>
          </div>
        </div>

        {/* Center: Date navigator */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onSelectPrevDate}
            disabled={!hasPrevDate}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenArchive}
            className="px-2 py-0.5 text-xs font-bold font-mono text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="Open Puzzle Archive"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateStr}</span>
          </button>

          <button
            type="button"
            onClick={onSelectNextDate}
            disabled={!hasNextDate}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={onSelectRandom}
            className="p-2 rounded-xl text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Play Random Puzzle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenStats}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Statistics & Streaks"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCustom}
            className="hidden sm:flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-bold transition-colors cursor-pointer"
            title="Create Custom Puzzle"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </div>
      </div>
    </header>
  );
};
