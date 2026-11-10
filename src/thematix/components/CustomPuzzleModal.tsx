import React, { useState } from 'react';
import { X, Sparkles, ArrowDownAZ, Play } from 'lucide-react';
import { Puzzle } from '../types/game';
import { normalizeAndRegisterWord } from '../utils/wordSplits';

interface CustomPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomPuzzle: (puzzle: Puzzle) => void;
}

export const CustomPuzzleModal: React.FC<CustomPuzzleModalProps> = ({
  isOpen,
  onClose,
  onPlayCustomPuzzle,
}) => {
  const [themeClue, setThemeClue] = useState('');
  const [themeWord, setThemeWord] = useState('');
  const [words, setWords] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWordChange = (idx: number, val: string) => {
    const cleaned = val.replace(/[^A-Za-z\s-]/g, '').toUpperCase();
    const next = [...words];
    next[idx] = cleaned;
    setWords(next);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!themeClue.trim()) {
      setError('Please provide a Theme Clue.');
      return;
    }

    const normalizedThemeWord = normalizeAndRegisterWord(themeWord);
    if (!normalizedThemeWord) {
      setError('Please provide a Theme Anchor / Category title.');
      return;
    }

    const cleanedWords = words
      .map((w) => normalizeAndRegisterWord(w))
      .filter((w) => w.length > 0);

    if (cleanedWords.length !== 6) {
      setError('Please enter all 6 words.');
      return;
    }

    for (const w of cleanedWords) {
      if (w.length < 3 || w.length > 12) {
        setError('Words should be between 3 and 12 letters long.');
        return;
      }
      if (w === normalizedThemeWord) {
        setError('None of the 6 lower words can be the same as the top clue answer.');
        return;
      }
    }

    // Auto-sort into strictly alphabetical order as per Thematik rules!
    const sortedWords = [...cleanedWords].sort((a, b) => a.localeCompare(b));

    const customPuzzle: Puzzle = {
      id: 'custom-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      formattedDate: 'Custom Puzzle',
      themeClue: themeClue.trim(),
      themeWord: normalizedThemeWord,
      words: sortedWords,
      difficulty: 'Medium',
      funFact: 'Custom player-generated puzzle! Solved in authentic alphabetical order.',
    };

    onPlayCustomPuzzle(customPuzzle);
    onClose();
  };

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

        <div className="text-center mb-5">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-2">
            Puzzle Maker
          </div>
          <h2 className="text-2xl font-serif-title font-bold text-slate-900 dark:text-white">
            Create Custom Thematik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build your own themed word challenge with automatic A–Z arrangement
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Theme Clue (e.g. "Famous Detective Characters")
            </label>
            <input
              type="text"
              required
              value={themeClue}
              onChange={(e) => setThemeClue(e.target.value)}
              placeholder="e.g. Rare Tropical Fruits"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Category Title / Anchor (e.g. "EXOTIC FRUITS")
            </label>
            <input
              type="text"
              required
              value={themeWord}
              onChange={(e) => setThemeWord(e.target.value.toUpperCase())}
              placeholder="e.g. EXOTIC PRODUCE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                6 Related Words
              </label>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                <ArrowDownAZ className="w-3.5 h-3.5" />
                Will be sorted A–Z automatically
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {words.map((w, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={w}
                    onChange={(e) => handleWordChange(idx, e.target.value)}
                    placeholder={`Word ${idx + 1}`}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm font-mono font-bold uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Generate & Play Custom Thematik</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
