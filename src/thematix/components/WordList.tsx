import React from 'react';
import { WordRow } from './WordRow';
import { GameMode, WordValidationStatus } from '../types/game';
import { ArrowDownAZ, HelpCircle } from 'lucide-react';

interface WordListProps {
  words: string[];
  filledWords: string[];
  guessedLetters: string[];
  mode: GameMode;
  activeWordIndex: number;
  activeLetterIndex: number;
  wordValidation: WordValidationStatus[];
  isSolved: boolean;
  onSelectWord: (index: number) => void;
  onSelectLetter: (wordIndex: number, letterIndex: number) => void;
}

export const WordList: React.FC<WordListProps> = ({
  words,
  filledWords,
  guessedLetters,
  mode,
  activeWordIndex,
  activeLetterIndex,
  wordValidation,
  isSolved,
  onSelectWord,
  onSelectLetter,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-4">
      {/* Alphabetical Order reminder header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
          <ArrowDownAZ className="w-4 h-4" />
          <span>6 Related Words — Arranged in Alphabetical Order (A to Z)</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Deduce positions!
        </span>
      </div>

      {/* The 6 Word Rows */}
      <div className="flex flex-col gap-2">
        {words.map((word, idx) => (
          <WordRow
            key={idx}
            index={idx}
            word={word}
            filledWord={filledWords[idx] || ''}
            guessedLetters={guessedLetters}
            mode={mode}
            isActive={activeWordIndex === idx}
            activeLetterIndex={activeLetterIndex}
            validationStatus={wordValidation[idx] || 'neutral'}
            isSolved={isSolved}
            onSelectWord={onSelectWord}
            onSelectLetter={onSelectLetter}
          />
        ))}
      </div>
    </div>
  );
};
