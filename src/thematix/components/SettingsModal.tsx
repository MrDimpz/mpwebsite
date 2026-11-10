import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  BarChart2,
  HelpCircle,
  RotateCcw,
  Calendar,
  Eye,
  Flame,
  Trophy,
  User as UserIcon,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  isMuted: boolean;
  isHardMode: boolean;
  onClose: () => void;
  onToggleMute: () => void;
  onToggleHardMode: () => void;
  onOpenStats: () => void;
  onOpenHowToPlay: () => void;
  onOpenArchive: () => void;
  onOpenLeaderboardPopup?: () => void;
  onOpenAccountPopup?: () => void;
  userDisplayName?: string;
  onReset: () => void;
  onGiveUp: () => void;
  isSolved: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  isMuted,
  isHardMode,
  onClose,
  onToggleMute,
  onToggleHardMode,
  onOpenStats,
  onOpenHowToPlay,
  onOpenArchive,
  onOpenLeaderboardPopup,
  onOpenAccountPopup,
  userDisplayName,
  onReset,
  onGiveUp,
  isSolved,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 relative text-slate-900 dark:text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-4 font-serif-title">Game Settings</h3>

        <div className="space-y-2">
          {/* Hard Mode Toggle */}
          <button
            type="button"
            onClick={onToggleHardMode}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <Flame
                className={`w-5 h-5 shrink-0 ${
                  isHardMode ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
              />
              <div>
                <span className="font-semibold text-sm block">Hard Mode</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                  Hides red incorrect letter indicators on solve
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isHardMode
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {isHardMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
              <span className="font-semibold text-sm">Sound Effects</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {isMuted ? 'OFF' : 'ON'}
            </span>
          </button>

          {/* Visitor Leaderboard Popup */}
          {onOpenLeaderboardPopup && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLeaderboardPopup();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-sm">Thematix Leaderboard</span>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                VIEW
              </span>
            </button>
          )}

          {/* Account / Login Popup */}
          {onOpenAccountPopup && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAccountPopup();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-sm">
                  {userDisplayName ? `Account (${userDisplayName})` : 'Sign In (Google / Email)'}
                </span>
              </div>
            </button>
          )}

          {/* Statistics */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenStats();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-sm">Statistics & Streaks</span>
          </button>

          {/* How to Play */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenHowToPlay();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-teal-500" />
            <span className="font-semibold text-sm">How to Play</span>
          </button>

          {/* Date Selector / Archive */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchive();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-sm">Select Other Dates</span>
          </button>

          {/* Reset Game */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onReset();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="font-semibold text-sm">Restart Puzzle</span>
          </button>

          {/* Give up / Reveal */}
          {!isSolved && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGiveUp();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <Eye className="w-5 h-5" />
              <span className="font-semibold text-sm">Reveal Answers</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
