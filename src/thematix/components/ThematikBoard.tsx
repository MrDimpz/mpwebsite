import React from 'react';
import { Keyboard } from 'lucide-react';
import { GameMode, WordValidationStatus } from '../types/game';
import { getWordBreakAfterIndices } from '../utils/wordSplits';

interface ThematikBoardProps {
  themeClue: string;
  themeWord: string;
  filledThemeWord: string;
  themeValidation: WordValidationStatus;
  words: string[];
  filledWords: string[];
  guessedLetters: string[];
  mode: GameMode;
  isHardMode: boolean;
  activeRowIndex: number; // -1 for theme row, 0..5 for words
  activeLetterIndex: number;
  validationStatus: WordValidationStatus[];
  isSolved: boolean;
  onSelectCell: (wordIndex: number, letterIndex: number) => void;
  onSelectThemeCell: (letterIndex: number) => void;
  onOpenMobileKeyboard?: () => void;
}

export const ThematikBoard: React.FC<ThematikBoardProps> = ({
  themeClue,
  themeWord,
  filledThemeWord,
  themeValidation,
  words,
  filledWords,
  guessedLetters,
  mode,
  isHardMode,
  activeRowIndex,
  activeLetterIndex,
  validationStatus,
  isSolved,
  onSelectCell,
  onSelectThemeCell,
  onOpenMobileKeyboard,
}) => {
  const isGuessMode = mode === 'GUESS';

  // Compute maximum row length across all words and the theme word (at least 7 as seen in GoComics)
  const maxWordLength = Math.max(
    7,
    themeWord.length,
    ...words.map((w) => w.length)
  );

  const themeWordBreaks = getWordBreakAfterIndices(themeWord);

  const isThemeIncorrect = themeValidation === 'incorrect';
  const isThemeEvaluated = themeValidation === 'incorrect' || themeValidation === 'incomplete';
  const isAnyEvaluatedWrong =
    isThemeEvaluated ||
    validationStatus.some((s) => s === 'incorrect' || s === 'incomplete');

  return (
    <div
      className={`flex flex-col items-start select-none ${
        isHardMode && isAnyEvaluatedWrong ? 'animate-shake' : ''
      }`}
    >
      {/* The Clue (e.g. "___ or treat!") */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-3 text-left">
        {themeClue}
      </h1>

      {/* Theme Anchor Word Row (Fillable & affected by Guess and Fill Mode) */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 mb-3 ${
          !isHardMode && isThemeIncorrect ? 'animate-shake' : ''
        }`}
      >
        {Array.from({ length: maxWordLength }).map((_, colIdx) => {
          const isPartOfWord = colIdx < themeWord.length;
          const targetChar = isPartOfWord ? themeWord[colIdx] : '';
          const userChar = isPartOfWord ? filledThemeWord[colIdx] || '' : '';
          const isRevealedByGuess =
            isPartOfWord && guessedLetters.includes(targetChar);
          const hasWordBreakAfter =
            isPartOfWord && themeWordBreaks.includes(colIdx);

          const isThemeCellFocused =
            !isGuessMode &&
            activeRowIndex === -1 &&
            activeLetterIndex === colIdx &&
            isPartOfWord;

          if (!isPartOfWord) {
            // Dark recessed inactive padding tile
            return (
              <div
                key={colIdx}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md transition-colors duration-200 bg-[#160224]/60 border border-purple-950/30 opacity-60"
              />
            );
          }

          // In Guess Mode, show target if guessed or solved. Guessed letter takes precedence over any manually typed character.
          const displayChar = isSolved
            ? targetChar
            : isRevealedByGuess
            ? targetChar
            : userChar.trim();
          const isFilled = Boolean(displayChar && displayChar.trim().length > 0);

          // Only highlight in red if not in Hard Mode and this specific tile has a wrong typed letter during validation
          const isTileWrong =
            !isHardMode &&
            isPartOfWord &&
            isThemeEvaluated &&
            !isRevealedByGuess &&
            Boolean(userChar.trim()) &&
            userChar.trim().toUpperCase() !== targetChar.toUpperCase();

          return (
            <div key={colIdx} className="relative flex items-center">
              <div
                onClick={() => onSelectThemeCell(colIdx)}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md font-mono font-black text-[32px] sm:text-[38px] md:text-[45px] leading-none flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                  isTileWrong
                    ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-400'
                    : isRevealedByGuess
                    ? 'bg-gradient-to-b from-[#ffcf48] via-[#f5b82e] to-[#e6a822] text-[#220536] shadow-lg border-t-2 border-amber-100 ring-2 ring-amber-300/80 scale-[1.02]'
                    : isFilled
                    ? 'bg-white text-[#220536] shadow-md border-t-2 border-slate-100 ring-2 ring-amber-300/80 scale-[1.02]'
                    : 'bg-[#5e1d85] border-2 border-[#f5b82e]/90 shadow-md shadow-black/40 hover:bg-[#6e249b] hover:border-[#f5b82e]'
                } ${
                  isThemeCellFocused
                    ? 'ring-4 ring-[#f5b82e] ring-offset-2 ring-offset-[#250838] scale-105 z-10'
                    : ''
                }`}
              >
                <span className="leading-none">{displayChar}</span>
              </div>
              {hasWordBreakAfter && (
                <div
                  aria-hidden="true"
                  title="Word break"
                  className="pointer-events-none absolute -top-1 -bottom-1 left-full ml-[1.5px] sm:ml-[2px] w-[3px] sm:w-[4px] rounded-full bg-[#f5b82e] shadow-[0_0_6px_rgba(24,4,36,0.95)] z-20"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Horizontal Divider Line with +20px extra spacing between top clue answer and bottom words */}
      <div className="w-full h-[3px] bg-gradient-to-r from-amber-400/30 via-[#f5b82e] to-amber-400/30 my-[18px] rounded-full shadow-xs" />

      {/* The 6 Word Rows (6 rows x maxWordLength columns) with +20px extra spacing */}
      <div className="space-y-1.5 sm:space-y-2 mt-[18px]">
        {words.map((word, rowIdx) => {
          const wordLen = word.length;
          const userFilled = filledWords[rowIdx] || '';
          const isRowIncorrect = validationStatus[rowIdx] === 'incorrect';
          const isRowEvaluated =
            validationStatus[rowIdx] === 'incorrect' || validationStatus[rowIdx] === 'incomplete';
          const rowWordBreaks = getWordBreakAfterIndices(word);

          return (
            <div
              key={rowIdx}
              className={`flex items-center gap-1.5 sm:gap-2 ${
                !isHardMode && isRowIncorrect ? 'animate-shake' : ''
              }`}
            >
              {Array.from({ length: maxWordLength }).map((_, colIdx) => {
                const isPartOfWord = colIdx < wordLen;
                const targetChar = isPartOfWord ? word[colIdx] : '';
                const userChar = isPartOfWord ? userFilled[colIdx] || '' : '';
                const isRevealedByGuess =
                  isPartOfWord && guessedLetters.includes(targetChar);
                const hasWordBreakAfter =
                  isPartOfWord && rowWordBreaks.includes(colIdx);
                const isFocused =
                  !isGuessMode &&
                  activeRowIndex === rowIdx &&
                  activeLetterIndex === colIdx;

                if (!isPartOfWord) {
                  // Dark recessed inactive padding tile
                  return (
                    <div
                      key={colIdx}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md transition-colors duration-200 bg-[#160224]/60 border border-purple-950/30 opacity-60"
                    />
                  );
                }

                // Displayed letter: if solved, target; else if revealed by guess, target (overwrites typed); else user typed
                const displayChar = isSolved
                  ? targetChar
                  : isRevealedByGuess
                  ? targetChar
                  : userChar.trim();
                const isFilled = Boolean(displayChar && displayChar.trim().length > 0);

                // Only highlight in red if not in Hard Mode and this specific tile has a wrong typed letter during validation
                const isTileWrong =
                  !isHardMode &&
                  isPartOfWord &&
                  isRowEvaluated &&
                  !isRevealedByGuess &&
                  Boolean(userChar.trim()) &&
                  userChar.trim().toUpperCase() !== targetChar.toUpperCase();

                return (
                  <div key={colIdx} className="relative flex items-center">
                    <div
                      onClick={() => onSelectCell(rowIdx, colIdx)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md font-mono font-black text-[32px] sm:text-[38px] md:text-[45px] leading-none flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                        isTileWrong
                          ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-400'
                          : isRevealedByGuess
                          ? 'bg-gradient-to-b from-[#ffcf48] via-[#f5b82e] to-[#e6a822] text-[#220536] shadow-lg border-t-2 border-amber-100 ring-2 ring-amber-300/80 scale-[1.02]'
                          : isFilled
                          ? 'bg-white text-[#220536] shadow-md border-t-2 border-slate-100 ring-2 ring-amber-300/80 scale-[1.02]'
                          : isGuessMode
                          ? 'bg-[#5e1d85] border-2 border-[#f5b82e]/90 shadow-md shadow-black/40 hover:bg-[#6e249b] hover:border-[#f5b82e]'
                          : 'bg-[#561a7a] border-2 border-amber-200/80 shadow-md shadow-black/40 hover:bg-[#662090] hover:border-white'
                      } ${
                        isFocused
                          ? 'ring-4 ring-[#f5b82e] ring-offset-2 ring-offset-[#250838] scale-105 z-10'
                          : ''
                      }`}
                    >
                      <span className="leading-none">{displayChar}</span>
                    </div>
                    {hasWordBreakAfter && (
                      <div
                        aria-hidden="true"
                        title="Word break"
                        className="pointer-events-none absolute -top-1 -bottom-1 left-full ml-[1.5px] sm:ml-[2px] w-[3px] sm:w-[4px] rounded-full bg-[#f5b82e] shadow-[0_0_6px_rgba(24,4,36,0.95)] z-20"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Row beneath the grid: Copied Logo on bottom-left + Authentic Speech Bubble Pointer */}
      <div className="w-full flex items-center justify-between gap-4 mt-5 relative">
        {/* Copied Logo & Title below the bottom-left of the grid */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <img
            src="/assets/aistudio/3d_logo_944e5372.png"
            alt="The Missing Piece Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm tracking-wider text-[#f5b82e] uppercase font-serif leading-tight drop-shadow-xs">
              The Missing Piece
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/70 tracking-widest uppercase font-semibold leading-none">
              Find Your Space
            </span>
          </div>
        </div>

        {/* Speech Bubble Pointer (tappable on mobile to pop up device keyboard) */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={onOpenMobileKeyboard}
            className={`relative px-6 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-lg transition-colors duration-200 bg-[#3d0f57] hover:bg-[#4b136b] border border-[#f5b82e]/50 flex items-center gap-2 cursor-pointer ${
              isGuessMode ? 'text-[#f5b82e]' : 'text-white'
            }`}
            title="Tap to open device keyboard"
          >
            {/* Triangular pointer pointing UP */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[#3d0f57]" />
            <Keyboard className="w-4 h-4 sm:hidden shrink-0 opacity-85" />
            <span>{isGuessMode ? 'Guess a letter' : 'Tap any tile to type'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
