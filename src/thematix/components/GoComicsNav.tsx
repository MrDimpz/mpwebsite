import React from 'react';
import { Link } from 'react-router';
import { ChevronDown, Clock, Flame, Trophy } from 'lucide-react';

interface GoComicsNavProps {
  currentDateStr: string;
  countdownText: string;
  containerWidth?: number;
  isHardMode: boolean;
  onToggleHardMode: () => void;
  onOpenArchive: () => void;
  onOpenHowToPlay: () => void;
  onOpenLeaderboardPopup?: () => void;
  isSignedIn?: boolean;
  userDisplayName?: string;
  onResetOrClose?: () => void;
}

export const GoComicsNav: React.FC<GoComicsNavProps> = ({
  currentDateStr,
  countdownText,
  containerWidth,
  isHardMode,
  onToggleHardMode,
  onOpenArchive,
  onOpenHowToPlay,
  onOpenLeaderboardPopup,
  isSignedIn,
  userDisplayName,
}) => {
  return (
    <nav className="w-full bg-[#180424] text-white select-none border-b border-[#f5b82e]/25 text-xs sm:text-sm shadow-md">
      <div className="w-full flex justify-center px-4">
        <div
          style={{ width: containerWidth ? `${containerWidth}px` : undefined }}
          className="w-full max-w-6xl h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-150"
        >
          {/* Logo in top bar above the top left of the main board */}
          <Link
            to="/solo-games"
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group"
            title="Back to Solo Games"
          >
            <img
              src="/assets/aistudio/3d_logo_944e5372.png"
              alt="The Missing Piece Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-black text-xs sm:text-sm tracking-wider text-[#f5b82e] uppercase font-serif leading-tight drop-shadow-xs">
                The Missing Piece
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/70 tracking-widest uppercase font-semibold leading-none">
                Find Your Space
              </span>
            </div>
          </Link>

          {/* Center / Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Help button (?) */}
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#f5b82e]/50 hover:border-[#f5b82e] bg-[#2d0a3d] hover:bg-[#3d0e52] text-[#f5b82e] hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              title="How to Play"
            >
              ?
            </button>

            {/* Leaderboard & Account Pop-up Button (compact icon matching ? button) */}
            {onOpenLeaderboardPopup && (
              <button
                type="button"
                onClick={onOpenLeaderboardPopup}
                className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#f5b82e]/50 hover:border-[#f5b82e] bg-[#2d0a3d] hover:bg-[#3d0e52] text-[#f5b82e] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                title={
                  isSignedIn
                    ? `Leaderboards & Account (${userDisplayName || 'Signed In'})`
                    : 'Leaderboards & Sign In'
                }
              >
                <Trophy className="w-3.5 h-3.5" />
                {isSignedIn && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#180424]" />
                )}
              </button>
            )}

            {/* Hard Mode Toggle */}
            <button
              type="button"
              onClick={onToggleHardMode}
              className={`flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-full border transition-all cursor-pointer shadow-xs ${
                isHardMode
                  ? 'bg-[#f5b82e] text-[#220536] border-amber-300 shadow-amber-500/20'
                  : 'bg-[#2a073a] hover:bg-[#380c4d] text-white/80 hover:text-[#f5b82e] border-purple-800/60'
              }`}
              title="Hard Mode: Hides red incorrect letter indicators upon solve"
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  isHardMode ? 'text-[#220536] fill-[#220536]' : 'text-[#f5b82e]'
                }`}
              />
              <span>Hard Mode: {isHardMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Date Selector (Saturday, October 31 ⌄) */}
            <button
              type="button"
              onClick={onOpenArchive}
              className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white hover:text-[#f5b82e] py-1.5 px-3 rounded-full bg-[#2a073a] hover:bg-[#380c4d] border border-purple-800/60 transition-colors cursor-pointer shadow-xs"
              title="Choose Date or Archive"
            >
              <span>{currentDateStr}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#f5b82e]" />
            </button>

            {/* London UK 00:00 Countdown Pill */}
            <div
              className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-amber-200/90 bg-[#250634] border border-[#f5b82e]/30 px-2.5 py-1 rounded-full cursor-help shadow-xs"
              title="New puzzle releases daily at 00:00 London (UK) time"
            >
              <Clock className="w-3.5 h-3.5 text-[#f5b82e] animate-pulse" />
              <span>Next: {countdownText}</span>
              <span className="text-[10px] text-[#f5b82e] font-sans font-black">UK</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
