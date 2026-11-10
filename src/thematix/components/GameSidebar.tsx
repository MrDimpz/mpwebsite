import React from 'react';
import { Settings, Pen, HelpCircle, Delete } from 'lucide-react';
import { GameMode } from '../types/game';
import { sound } from '../utils/sound';

interface GameSidebarProps {
  mode: GameMode;
  guessesCount: number;
  view: 'CHOICE' | 'KEYBOARD';
  guessedLetters: string[];
  puzzleLetters: Set<string>;
  isSolved: boolean;
  onSelectGuessMode: () => void;
  onSelectFillMode: () => void;
  onGuessLetter: (letter: string) => void;
  onTypeLetter: (letter: string) => void;
  onBackspace: () => void;
  onSolve: () => void;
  onOpenSettings: () => void;
}

const ALPHABET_ROWS = [
  ['A', 'B', 'C', 'D'],
  ['E', 'F', 'G', 'H'],
  ['I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X'],
  ['Y', 'Z'],
];

export const GameSidebar: React.FC<GameSidebarProps> = ({
  mode,
  guessesCount,
  view,
  guessedLetters,
  puzzleLetters,
  isSolved,
  onSelectGuessMode,
  onSelectFillMode,
  onGuessLetter,
  onTypeLetter,
  onBackspace,
  onSolve,
  onOpenSettings,
}) => {
  const isGuessMode = mode === 'GUESS';
  const formattedGuesses = String(guessesCount).padStart(2, '0');

  return (
    <aside
      className="w-full max-w-[320px] rounded-3xl p-5 flex flex-col justify-between relative shadow-2xl transition-colors duration-300 min-h-[520px] bg-[#1c042b] border border-[#f5b82e]/25 text-white"
    >
      {/* Top Banner: 00 GUESSES ribbon & settings icon */}
      <div className="flex items-start justify-between -mt-5 -mx-5 px-5 pt-0 mb-4 relative">
        <div className="w-6" /> {/* spacer */}

        {/* The Hanging Ribbon Badge */}
        <div
          className="w-24 pt-3 pb-2.5 rounded-b-2xl flex flex-col items-center justify-center shadow-md select-none transition-colors duration-300 bg-[#14021f] text-[#f5b82e] border-x border-b-2 border-[#f5b82e]/80"
        >
          <span className="text-3xl font-extrabold tracking-tight leading-none font-mono">
            {formattedGuesses}
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase mt-1 opacity-90 text-[#f5b82e]/90">
            Guesses
          </span>
        </div>

        {/* Settings gear icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-3 p-1.5 rounded-full text-amber-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Game Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Controls inside Sidebar */}
      {view === 'CHOICE' ? (
        /* View 1: Initial Large Cards Choice (Image 1) */
        <div className="flex-1 flex flex-col justify-center gap-4 py-2">
          {/* GUESS a letter Card */}
          <button
            type="button"
            onClick={onSelectGuessMode}
            className="w-full bg-[#3b0f54] hover:bg-[#4a1469] active:scale-[0.98] text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group border border-[#f5b82e]/40"
          >
            <HelpCircle className="w-12 h-12 stroke-[2.2] text-[#f5b82e] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-2xl font-black tracking-wider text-[#f5b82e]">GUESS</div>
              <div className="text-xs font-medium text-purple-200">a letter</div>
            </div>
          </button>

          {/* FILL IN answers Card */}
          <button
            type="button"
            onClick={onSelectFillMode}
            className="w-full bg-gradient-to-br from-[#f5b82e] via-[#e5a820] to-[#cca028] hover:brightness-105 active:scale-[0.98] text-[#220536] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer group border border-amber-200"
          >
            <Pen className="w-10 h-10 stroke-[2.4] text-[#220536] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-2xl font-black tracking-wider text-[#220536]">FILL IN</div>
              <div className="text-xs font-bold text-[#220536]/80">answers</div>
            </div>
          </button>
        </div>
      ) : (
        /* View 2: Authentic 4x7 Alphabetical Keyboard (Image 2 & 3) */
        <div className="flex-1 flex flex-col justify-between py-1">
          {/* The 4-column Alphabetical Keyboard */}
          <div className="space-y-1.5 sm:space-y-2 select-none">
            {ALPHABET_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {row.map((letter) => {
                  const isGuessed = guessedLetters.includes(letter);
                  const isMatch = isGuessed && puzzleLetters.has(letter);
                  const isMissed = isGuessed && !puzzleLetters.has(letter);

                  let keyBg = '';
                  if (isMatch) {
                    keyBg = 'bg-[#f5b82e] text-[#220536] font-black shadow-md border-t border-amber-200 cursor-not-allowed opacity-90';
                  } else if (isMissed) {
                    keyBg = 'bg-[#2b083d] text-purple-400/40 line-through cursor-not-allowed opacity-50';
                  } else if (isGuessMode) {
                    keyBg = 'bg-[#491666] hover:bg-[#5b1c7f] active:scale-95 text-white shadow-xs border border-purple-900/40';
                  } else {
                    // Fill Mode keyboard (Image 3)
                    keyBg = 'bg-[#3b0f54] hover:bg-[#4a1469] active:scale-95 text-white shadow-xs border border-purple-800/40';
                  }

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={isSolved || isGuessed}
                      onClick={() => {
                        if (isGuessMode) {
                          onGuessLetter(letter);
                        } else {
                          sound.playKeyClick();
                          onTypeLetter(letter);
                        }
                      }}
                      className={`h-10 sm:h-11 rounded-lg font-black text-base sm:text-lg flex items-center justify-center transition-all cursor-pointer ${keyBg}`}
                    >
                      {letter}
                    </button>
                  );
                })}

                {/* Last Row 7: contains Y, Z, empty slot, and Backspace */}
                {rIdx === 6 && (
                  <>
                    <div className="h-10 sm:h-11" /> {/* empty 3rd slot */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playKeyClick();
                        onBackspace();
                      }}
                      disabled={isSolved}
                      className="h-10 sm:h-11 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer bg-[#491666] hover:bg-[#5b1c7f] text-white border border-purple-900/40"
                      title="Backspace"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Mode Switcher Toggle Pill: [? GUESS | ✎ FILL] */}
          <div className="mt-3 bg-black/30 p-1 rounded-xl flex items-center justify-between border border-purple-900/40">
            <button
              type="button"
              onClick={onSelectGuessMode}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isGuessMode
                  ? 'bg-[#f5b82e] text-[#220536] font-extrabold shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>GUESS</span>
            </button>

            <button
              type="button"
              onClick={onSelectFillMode}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isGuessMode
                  ? 'bg-white text-[#220536] font-extrabold shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span>FILL</span>
            </button>
          </div>
        </div>
      )}

      {/* Big Bottom SOLVE Button (always visible) */}
      <div className="mt-4 pt-1">
        <button
          type="button"
          onClick={onSolve}
          disabled={view === 'CHOICE' && !isSolved}
          className={`w-full py-3.5 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
            view === 'CHOICE' && !isSolved
              ? 'bg-[#310c44] text-purple-300/30 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#f5b82e] via-[#ffd166] to-[#f5b82e] hover:brightness-105 active:scale-[0.98] text-[#220536] font-black shadow-amber-500/25 border border-amber-300 cursor-pointer'
          }`}
        >
          SOLVE
        </button>
      </div>
    </aside>
  );
};
