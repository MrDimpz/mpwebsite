import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Play, Clock, Lock } from 'lucide-react';
import { getArchivePuzzles, getPuzzleById } from '../data/puzzles';
import { Puzzle } from '../types/game';
import { loadPuzzleProgress } from '../utils/storage';
import { getLondonDateString } from '../utils/londonTime';

interface ArchiveModalProps {
  isOpen: boolean;
  currentPuzzleId: string;
  onClose: () => void;
  onSelectPuzzle: (puzzle: Puzzle) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  currentPuzzleId,
  onClose,
  onSelectPuzzle,
}) => {
  const todayLondon = getLondonDateString(); // e.g. '2026-11-01' or '2026-10-31'
  const archivePuzzles = useMemo(() => getArchivePuzzles(), []);

  // Compute available months up to today in London
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    archivePuzzles.forEach((p) => {
      const [y, m] = p.date.split('-');
      monthSet.add(`${y}-${m}`);
    });

    return Array.from(monthSet).sort().reverse().map((ym) => {
      const [y, m] = ym.split('-');
      const mIdx = parseInt(m, 10) - 1;
      return {
        year: y,
        month: m,
        name: `${MONTH_NAMES[mIdx]} ${y}`,
        shortMonth: m,
      };
    });
  }, [archivePuzzles]);

  const initialYear = currentPuzzleId.split('-')[0] || todayLondon.split('-')[0];
  const initialMonth = currentPuzzleId.split('-')[1] || todayLondon.split('-')[1];
  const initialDay = currentPuzzleId.split('-')[2] || todayLondon.split('-')[2];

  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<string>(initialDay);

  // Compute completed stats
  const completionStats = useMemo(() => {
    let completedCount = 0;
    const progressMap: Record<string, { isSolved: boolean; guesses: number }> = {};

    archivePuzzles.forEach((p) => {
      const prog = loadPuzzleProgress(p.id);
      if (prog && prog.isSolved) {
        completedCount++;
        progressMap[p.id] = { isSolved: true, guesses: prog.letterGuessesCount || 0 };
      }
    });

    return {
      total: archivePuzzles.length,
      completed: completedCount,
      percent: Math.round((completedCount / (archivePuzzles.length || 1)) * 100),
      progressMap,
    };
  }, [archivePuzzles, isOpen]);

  if (!isOpen) return null;

  const yearNum = parseInt(selectedYear, 10);
  const monthNum = parseInt(selectedMonth, 10); // 1-12

  // Calendar calculations
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)

  // Selected date key
  const selectedDateKey = `${selectedYear}-${selectedMonth}-${selectedDay.padStart(2, '0')}`;
  const isSelectedFuture = selectedDateKey > todayLondon;
  const selectedPuzzle = !isSelectedFuture ? getPuzzleById(selectedDateKey) : undefined;
  const selectedProgress = completionStats.progressMap[selectedDateKey];

  const handlePickDate = (dayNum: number) => {
    const dayStr = String(dayNum).padStart(2, '0');
    const targetKey = `${selectedYear}-${selectedMonth}-${dayStr}`;
    if (targetKey <= todayLondon) {
      setSelectedDay(dayStr);
    }
  };

  const handleLaunchPuzzle = () => {
    if (selectedPuzzle) {
      onSelectPuzzle(selectedPuzzle);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col p-5 sm:p-6 relative text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mb-1.5">
            Daily Archive (Updated at 00:00 London UK Time)
          </div>
          <h2 className="text-2xl font-serif-title font-bold">
            Puzzle Calendar
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completionStats.completed} Completed
            </span>
            <span>•</span>
            <span>{completionStats.total} Playable Daily Puzzles</span>
            <span>•</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {completionStats.percent}% Solved
            </span>
          </div>
        </div>

        {/* Dropdowns for Year, Month, and Date */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Year Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Month Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                const newM = e.target.value;
                setSelectedMonth(newM);
                const maxDay = new Date(yearNum, parseInt(newM, 10), 0).getDate();
                let dayNum = parseInt(selectedDay, 10);
                if (dayNum > maxDay) dayNum = maxDay;
                let dayStr = String(dayNum).padStart(2, '0');
                if (`${selectedYear}-${newM}-${dayStr}` > todayLondon) {
                  const [tY, tM, tD] = todayLondon.split('-');
                  if (selectedYear === tY && newM === tM) {
                    dayStr = tD;
                  }
                }
                setSelectedDay(dayStr);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              {availableMonths.map((m) => (
                <option key={`${m.year}-${m.month}`} value={m.month}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Dropdown - only shows unlocked dates */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
              Date
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              {Array.from({ length: daysInMonth })
                .map((_, idx) => idx + 1)
                .filter((dayNum) => `${selectedYear}-${selectedMonth}-${String(dayNum).padStart(2, '0')}` <= todayLondon)
                .map((dayNum) => {
                  const dayStr = String(dayNum).padStart(2, '0');
                  const pKey = `${selectedYear}-${selectedMonth}-${dayStr}`;
                  const isDone = completionStats.progressMap[pKey]?.isSolved;
                  return (
                    <option key={dayStr} value={dayStr}>
                      {dayNum} {isDone ? '✓ (Solved)' : ''}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Calendar Style Grid */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 mb-4 select-none">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank filler cells before the 1st day of the month */}
            {Array.from({ length: firstDayOfWeek }).map((_, bIdx) => (
              <div key={`blank-${bIdx}`} className="h-10 sm:h-11 rounded-lg" />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, dIdx) => {
              const dayNum = dIdx + 1;
              const dayStr = String(dayNum).padStart(2, '0');
              const cellDateKey = `${selectedYear}-${selectedMonth}-${dayStr}`;
              const isFuture = cellDateKey > todayLondon;
              const isSelected = selectedDay === dayStr && !isFuture;
              const isPlaying = currentPuzzleId === cellDateKey;
              const isDone = completionStats.progressMap[cellDateKey]?.isSolved;
              const guesses = completionStats.progressMap[cellDateKey]?.guesses;

              if (isFuture) {
                // Completely hide dates that haven't unlocked yet
                return (
                  <div key={cellDateKey} className="h-10 sm:h-11 rounded-xl" />
                );
              }

              return (
                <button
                  key={cellDateKey}
                  type="button"
                  onClick={() => handlePickDate(dayNum)}
                  className={`h-10 sm:h-11 rounded-xl p-1 flex flex-col items-center justify-between transition-all cursor-pointer relative text-xs font-bold ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 scale-[1.03] z-10'
                      : isPlaying
                      ? 'bg-purple-100 dark:bg-purple-950/70 border-2 border-purple-500 text-purple-700 dark:text-purple-300'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-slate-800'
                  }`}
                  title={`${cellDateKey}: ${isDone ? `Solved in ${guesses} guesses` : 'Available to play'}`}
                >
                  <span className="leading-none mt-0.5">{dayNum}</span>

                  {/* Completed status indicator with checkmark */}
                  {isDone ? (
                    <span
                      className={`text-[9px] font-black flex items-center gap-0.5 ${
                        isSelected ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      ✓ {guesses ? `${guesses}g` : ''}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Puzzle Card & Action Footer */}
        {selectedPuzzle ? (
          <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                  {selectedPuzzle.formattedDate}
                </span>

                {selectedProgress?.isSolved ? (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed ({selectedProgress.guesses} Guesses)
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded-md">
                    Unsolved
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedPuzzle.themeClue}
              </h4>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Difficulty: <span className="font-semibold text-amber-600 dark:text-amber-400 capitalize">{selectedPuzzle.difficulty}</span> • 6 Alphabetical Words
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchPuzzle}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f5b82e] to-[#e5a820] hover:brightness-105 active:scale-95 text-[#240638] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0 border border-amber-300"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{selectedProgress?.isSolved ? 'Review Puzzle' : 'Play This Date'}</span>
            </button>
          </div>
        ) : isSelectedFuture ? (
          <div className="text-center py-3 text-xs text-slate-400 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>This puzzle will automatically unlock at 00:00 London (UK) time.</span>
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-slate-400">
            No puzzle data found for this date.
          </div>
        )}
      </div>
    </div>
  );
};
