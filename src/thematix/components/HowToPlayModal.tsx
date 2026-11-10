import React from 'react';
import { X, KeyRound, PenLine, ArrowDownAZ, CheckCircle2, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-2">
            Game Guide
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-white">
            How to Play Thematik
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solve the hidden theme and uncover 6 related words in as few guesses as possible!
          </p>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          {/* Rule 1: The Theme & 6 Words */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">The Clue & Words</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every puzzle has a central theme clue and <strong>6 hidden related words</strong>. All 6 words tie directly into the category.
              </p>
            </div>
          </div>

          {/* Rule 2: Alphabetical order */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ArrowDownAZ className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 dark:text-amber-200">Strict Alphabetical Order (A to Z)</h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                The 6 words are <strong>strictly sorted from A to Z</strong>! If word #2 starts with "C" and word #4 starts with "M", word #3 must alphabetically lie between C and M.
              </p>
            </div>
          </div>

          {/* Rule 3: Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Guess Mode */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold mb-1">
                <KeyRound className="w-4 h-4" />
                <span>Guess Mode</span>
              </div>
              <p className="text-xs text-purple-900/80 dark:text-purple-200/80">
                Tap letters on the keyboard. If found, <strong>all instances</strong> across the puzzle are revealed! Each letter guess adds <strong>+1 to your score</strong>.
              </p>
            </div>

            {/* Fill Mode */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold mb-1">
                <PenLine className="w-4 h-4" />
                <span>Fill Mode</span>
              </div>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80">
                Know an answer? Click any word row and type letters directly. <strong>Zero penalty</strong>! Type and modify answers freely as much as you like.
              </p>
            </div>
          </div>

          {/* Rule 4: Solve & Check */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Check Your Answers Anytime</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hit <strong>"Check & Solve"</strong> whenever you want to test your board. There is <strong>no penalty</strong> for checking. You can fix mistakes and keep playing!
              </p>
            </div>
          </div>

          {/* Rule 5: Scoring */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Scoring & Stars</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The fewer letter guesses you use, the higher your score!
                <br />
                ⭐ <strong>0–3 Guesses:</strong> Mastermind / Genius
                <br />
                ⭐ <strong>4–7 Guesses:</strong> Word Detective
                <br />
                ⭐ <strong>8+ Guesses:</strong> Puzzler
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors shadow-md shadow-purple-600/30 cursor-pointer"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
