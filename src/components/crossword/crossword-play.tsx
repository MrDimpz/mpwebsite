import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, Check, Eye, RotateCcw, Trophy } from 'lucide-react';
import type { VisualTheme, VisualThemeId } from '@/data/crossword-types';
import type { PlacedClue, PuzzleDefinition, GridCellData } from '@/data/crossword-types';
import {
	type GameDifficulty,
	calculateScore,
	formatClock,
	loadSavedGrid,
	saveGrid,
	clearSavedGrid,
	saveProgress,
	addLeaderboardEntry,
} from '@/lib/crossword-progress';

type Dir = 'across' | 'down';

const DIFFICULTY_OPTIONS: { key: GameDifficulty; label: string }[] = [
	{ key: 'standard', label: 'Standard' },
	{ key: 'easy', label: 'Easy' },
	{ key: 'medium', label: 'Medium' },
	{ key: 'hard', label: 'Hard' },
	{ key: 'cryptic', label: 'Cryptic' },
];

const cellKey = (row: number, col: number) => `${row},${col}`;

function clueText(clue: PlacedClue, difficulty: GameDifficulty): string {
	switch (difficulty) {
		case 'easy':
			return clue.easyClue;
		case 'medium':
			return clue.mediumClue;
		case 'hard':
			return clue.hardClue;
		case 'cryptic':
			return clue.crypticClue;
		case 'standard':
		default:
			return clue.standardClue;
	}
}

function clueCells(clue: PlacedClue): { row: number; col: number }[] {
	const cells: { row: number; col: number }[] = [];
	for (let i = 0; i < clue.length; i++) {
		cells.push(
			clue.direction === 'across'
				? { row: clue.row, col: clue.col + i }
				: { row: clue.row + i, col: clue.col },
		);
	}
	return cells;
}

function entryFor(
	row: number,
	col: number,
	dir: Dir,
	puzzle: PuzzleDefinition,
): PlacedClue | undefined {
	return puzzle.clues[dir].find((clue) => {
		if (dir === 'across') {
			return clue.row === row && col >= clue.col && col < clue.col + clue.length;
		}
		return clue.col === col && row >= clue.row && row < clue.row + clue.length;
	});
}

/** Concrete colour values for each visual theme (the data file stores class names). */
const THEME_COLORS: Record<VisualThemeId, VisualTheme> & {
	[k: string]: VisualTheme;
} = {
	editorial: {
		id: 'editorial',
		name: 'Broadsheet Ink',
		subtitle: 'Crisp newsprint & charcoal',
		bgCanvas: '#F8FAFC',
		bgSurface: '#FFFFFF',
		bgElevated: '#F1F5F9',
		textPrimary: '#0F172A',
		textSecondary: '#334155',
		textMuted: '#64748B',
		borderSubtle: '#CBD5E1',
		gridBlocked: '#1E293B',
		gridCellBg: '#FFFFFF',
		gridCellActiveWord: '#FEF3C7',
		gridCellFocused: '#D97706',
		gridCellText: '#0F172A',
		gridCellFocusedText: '#FFFFFF',
		accentBg: '#0F172A',
		accentText: '#FFFFFF',
		accentBorder: '#0F172A',
	},
	observatory: {
		id: 'observatory',
		name: 'Velvet Observatory',
		subtitle: 'Deep navy & starlight amber',
		bgCanvas: '#0A192F',
		bgSurface: '#152A4A',
		bgElevated: '#1E3A63',
		textPrimary: '#F8FAFC',
		textSecondary: '#CBD5E1',
		textMuted: '#94A3B8',
		borderSubtle: '#233554',
		gridBlocked: '#050D1A',
		gridCellBg: '#152A4A',
		gridCellActiveWord: '#264673',
		gridCellFocused: '#F59E0B',
		gridCellText: '#F8FAFC',
		gridCellFocusedText: '#0A192F',
		accentBg: '#F59E0B',
		accentText: '#0A192F',
		accentBorder: '#F59E0B',
	},
	botanical: {
		id: 'botanical',
		name: 'Conservatory Felt',
		subtitle: 'Classic tournament green & ivory',
		bgCanvas: '#062214',
		bgSurface: '#0F3D27',
		bgElevated: '#1E6B45',
		textPrimary: '#F8FAFC',
		textSecondary: '#D1FAE5',
		textMuted: '#A7F3D0',
		borderSubtle: '#1E6B45',
		gridBlocked: '#062214',
		gridCellBg: '#F8FAFC',
		gridCellActiveWord: '#D1FAE5',
		gridCellFocused: '#10B981',
		gridCellText: '#062214',
		gridCellFocusedText: '#062214',
		accentBg: '#10B981',
		accentText: '#062214',
		accentBorder: '#10B981',
	},
	mahogany: {
		id: 'mahogany',
		name: 'Archive Study',
		subtitle: 'Deep espresso & parchment',
		bgCanvas: '#1F120F',
		bgSurface: '#2E1B16',
		bgElevated: '#543831',
		textPrimary: '#FAF5F0',
		textSecondary: '#E7D8C9',
		textMuted: '#BFA896',
		borderSubtle: '#543831',
		gridBlocked: '#160D0B',
		gridCellBg: '#FAF5F0',
		gridCellActiveWord: '#FDE68A',
		gridCellFocused: '#DC2626',
		gridCellText: '#1F120F',
		gridCellFocusedText: '#FFFFFF',
		accentBg: '#DC2626',
		accentText: '#FFFFFF',
		accentBorder: '#DC2626',
	},
};

interface PlayProps {
	puzzle: PuzzleDefinition;
	onExit: () => void;
}

export function CrosswordPlay({ puzzle, onExit }: PlayProps) {
	const size = puzzle.gridSize;
	const theme = THEME_COLORS[puzzle.recommendedVisualTheme] ?? THEME_COLORS.editorial;
	const isDark = ['observatory', 'botanical', 'mahogany'].includes(theme.id);

	const [letters, setLetters] = useState<string[][]>(() => {
		const saved = loadSavedGrid(puzzle.id);
		if (saved && saved.length === size) return saved;
		return Array.from({ length: size }, () => Array<string>(size).fill(''));
	});
	const [selected, setSelected] = useState<{ row: number; col: number }>(() => {
		const first = puzzle.clues.across[0] ?? puzzle.clues.down[0];
		return first ? { row: first.row, col: first.col } : { row: 0, col: 0 };
	});
	const [dir, setDir] = useState<Dir>('across');
	const [difficulty, setDifficulty] = useState<GameDifficulty>('standard');
	const [checked, setChecked] = useState(false);
	const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
	const [elapsed, setElapsed] = useState(0);
	const [finalScore, setFinalScore] = useState<number | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const isBlocked = (r: number, c: number) => puzzle.grid[r][c].isBlocked;

	// Reset per-puzzle state when the puzzle changes.
	useEffect(() => {
		const saved = loadSavedGrid(puzzle.id);
		setLetters(
			saved && saved.length === size
				? saved
				: Array.from({ length: size }, () => Array<string>(size).fill('')),
		);
		const first = puzzle.clues.across[0] ?? puzzle.clues.down[0];
		setSelected(first ? { row: first.row, col: first.col } : { row: 0, col: 0 });
		setDir('across');
		setChecked(false);
		setRevealed(new Set());
		setElapsed(0);
		setFinalScore(null);
		gridRef.current?.focus();
	}, [puzzle, size]);

	const activeEntry = useMemo(
		() => entryFor(selected.row, selected.col, dir, puzzle),
		[selected, dir, puzzle],
	);

	const activeCells = useMemo(() => {
		const set = new Set<string>();
		if (activeEntry) clueCells(activeEntry).forEach((c) => set.add(cellKey(c.row, c.col)));
		return set;
	}, [activeEntry]);

	const solved = useMemo(() => {
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				const cell = puzzle.grid[r][c];
				if (!cell.isBlocked && letters[r][c] !== cell.solution) {
					return false;
				}
			}
		}
		return true;
	}, [letters, puzzle, size]);

	const wrongCount = useMemo(() => {
		if (!checked) return 0;
		let count = 0;
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				const cell = puzzle.grid[r][c];
				if (!cell.isBlocked && letters[r][c] && letters[r][c] !== cell.solution) {
					count++;
				}
			}
		}
		return count;
	}, [checked, letters, puzzle, size]);

	// Timer: counts up while playing, freezes on solve.
	useEffect(() => {
		if (solved || finalScore !== null) return;
		const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
		return () => window.clearInterval(id);
	}, [solved, finalScore]);

	// Persist grid as the player types.
	useEffect(() => {
		saveGrid(puzzle.id, letters);
	}, [letters, puzzle.id]);

	// On solve: compute score, record progress + leaderboard once.
	useEffect(() => {
		if (!solved || finalScore !== null) return;
		const score = calculateScore(difficulty, elapsed);
		setFinalScore(score);
		saveProgress(puzzle.id, {
			solved: true,
			timeSeconds: elapsed,
			score,
			difficulty,
			completedAt: new Date().toISOString(),
		});
		addLeaderboardEntry({
			puzzleId: puzzle.id,
			puzzleTitle: puzzle.title,
			themeName: puzzle.themeName,
			gridSize: puzzle.gridSize,
			score,
			timeSeconds: elapsed,
			difficulty,
		});
		clearSavedGrid(puzzle.id);
	}, [solved, finalScore, difficulty, elapsed, puzzle]);

	const setLetter = useCallback((row: number, col: number, letter: string) => {
		setLetters((prev) => {
			const next = prev.map((r) => r.slice());
			next[row][col] = letter;
			return next;
		});
	}, []);

	const moveNext = useCallback(
		(row: number, col: number, direction: Dir) => {
			const entry = entryFor(row, col, direction, puzzle);
			if (!entry) return { row, col };
			const cells = clueCells(entry);
			const idx = cells.findIndex((c) => c.row === row && c.col === col);
			if (idx < cells.length - 1) return cells[idx + 1];
			return { row, col };
		},
		[puzzle],
	);

	const movePrev = useCallback(
		(row: number, col: number, direction: Dir) => {
			const entry = entryFor(row, col, direction, puzzle);
			if (!entry) return { row, col };
			const cells = clueCells(entry);
			const idx = cells.findIndex((c) => c.row === row && c.col === col);
			if (idx > 0) return cells[idx - 1];
			return { row, col };
		},
		[puzzle],
	);

	const selectEntry = (entry: PlacedClue) => {
		setDir(entry.direction);
		setSelected({ row: entry.row, col: entry.col });
		gridRef.current?.focus();
	};

	const selectCell = (row: number, col: number) => {
		if (isBlocked(row, col)) return;
		if (selected.row === row && selected.col === col) {
			const other: Dir = dir === 'across' ? 'down' : 'across';
			if (entryFor(row, col, other, puzzle)) setDir(other);
		} else if (!entryFor(row, col, dir, puzzle)) {
			setDir(dir === 'across' ? 'down' : 'across');
			setSelected({ row, col });
		} else {
			setSelected({ row, col });
		}
		gridRef.current?.focus();
	};

	const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
		if (isBlocked(selected.row, selected.col)) return;
		const k = e.key;
		if (/^[a-zA-Z]$/.test(k)) {
			e.preventDefault();
			setLetter(selected.row, selected.col, k.toUpperCase());
			setChecked(false);
			setSelected(moveNext(selected.row, selected.col, dir));
		} else if (k === 'Backspace') {
			e.preventDefault();
			if (letters[selected.row][selected.col]) {
				setLetter(selected.row, selected.col, '');
			} else {
				const p = movePrev(selected.row, selected.col, dir);
				setSelected(p);
				setLetter(p.row, p.col, '');
			}
			setChecked(false);
		} else if (k === 'ArrowRight') {
			e.preventDefault();
			setDir('across');
			let c = selected.col + 1;
			while (c < size && isBlocked(selected.row, c)) c++;
			if (c < size) setSelected({ row: selected.row, col: c });
		} else if (k === 'ArrowLeft') {
			e.preventDefault();
			setDir('across');
			let c = selected.col - 1;
			while (c >= 0 && isBlocked(selected.row, c)) c--;
			if (c >= 0) setSelected({ row: selected.row, col: c });
		} else if (k === 'ArrowDown') {
			e.preventDefault();
			setDir('down');
			let r = selected.row + 1;
			while (r < size && isBlocked(r, selected.col)) r++;
			if (r < size) setSelected({ row: r, col: selected.col });
		} else if (k === 'ArrowUp') {
			e.preventDefault();
			setDir('down');
			let r = selected.row - 1;
			while (r >= 0 && isBlocked(r, selected.col)) r--;
			if (r >= 0) setSelected({ row: r, col: selected.col });
		} else if (k === ' ') {
			e.preventDefault();
			const other: Dir = dir === 'across' ? 'down' : 'across';
			if (entryFor(selected.row, selected.col, other, puzzle)) setDir(other);
		} else if (k === 'Enter') {
			e.preventDefault();
			const list = dir === 'across' ? puzzle.clues.across : puzzle.clues.down;
			const idx = list.findIndex((entry) => entry.id === activeEntry?.id);
			if (idx >= 0 && idx < list.length - 1) {
				selectEntry(list[idx + 1]);
			}
		}
	};

	const handleCheck = () => setChecked(true);

	const handleReveal = () => {
		if (!activeEntry) return;
		const cells = clueCells(activeEntry);
		setLetters((prev) => {
			const next = prev.map((r) => r.slice());
			cells.forEach((c) => {
				next[c.row][c.col] = puzzle.grid[c.row][c.col].solution;
			});
			return next;
		});
		setRevealed((prev) => {
			const n = new Set(prev);
			cells.forEach((c) => n.add(cellKey(c.row, c.col)));
			return n;
		});
		setChecked(false);
	};

	const handleClear = () => {
		setLetters(Array.from({ length: size }, () => Array<string>(size).fill('')));
		setChecked(false);
		setRevealed(new Set());
		clearSavedGrid(puzzle.id);
	};

	const boardWidth = size >= 20 ? 'min(620px, 94vw)' : 'min(420px, 86vw)';
	const surfaceStyle: React.CSSProperties = {
		background: theme.bgCanvas,
		color: theme.textPrimary,
	};
	const panelStyle: React.CSSProperties = {
		background: theme.bgSurface,
		color: theme.textPrimary,
		borderColor: theme.borderSubtle,
	};
	const cluePanelStyle: React.CSSProperties = {
		background: theme.bgSurface,
		color: theme.textPrimary,
		borderColor: theme.borderSubtle,
	};

	return (
		<div className="crossword-play" style={surfaceStyle}>
			<button type="button" className="solo-back" style={{ color: theme.textSecondary }} onClick={onExit}>
				<ArrowLeft size={16} /> Back to catalogue
			</button>

			<div className="crossword-head">
				<p className="eyebrow" style={{ color: theme.textMuted }}>
					<span className="status-dot" style={{ background: theme.accentBg }} /> {puzzle.editionType === 'quick-8x8' ? 'QUICK 8×8' : 'STANDARD 20×20'} · {puzzle.editionDate}
				</p>
				<h1 style={{ color: theme.textPrimary }}>{puzzle.title}</h1>
				<p style={{ color: theme.textSecondary }}>
					{puzzle.subtitle}
					{puzzle.themeName ? ` — ${puzzle.themeName}.` : '.'} Theme: {theme.name}. Click a square or a clue, then type.
				</p>
			</div>

			<div className="crossword-layout">
				<div className="crossword-board">
					<div className="crossword-active-clue" style={panelStyle}>
						{activeEntry ? (
							<>
								<span className="ac-num" style={{ color: theme.accentBg === theme.gridCellFocused && isDark ? theme.gridCellFocused : theme.accentBg }}>
									{activeEntry.number} {activeEntry.direction === 'across' ? 'Across' : 'Down'}
								</span>
								{clueText(activeEntry, difficulty)}
							</>
						) : (
							'Pick a square to begin'
						)}
					</div>
					<div
						ref={gridRef}
						className="crossword-grid"
						role="grid"
						aria-label="Crossword grid"
						tabIndex={0}
						onKeyDown={handleKey}
						style={{
							gridTemplateColumns: `repeat(${size}, 1fr)`,
							gridTemplateRows: `repeat(${size}, 1fr)`,
							width: boardWidth,
						}}
					>
						{puzzle.grid.map((row: GridCellData[], r) =>
							row.map((cell: GridCellData, c) => {
								if (cell.isBlocked) {
									return (
										<div
											key={`${r}-${c}`}
											className="crossword-cell black"
											style={{ background: theme.gridBlocked, borderColor: theme.gridBlocked }}
											aria-hidden="true"
										/>
									);
								}
								const k = cellKey(r, c);
								const isSelected = selected.row === r && selected.col === c;
								const inWord = activeCells.has(k);
								const letter = letters[r][c];
								const num = cell.number;
								let bg = theme.gridCellBg;
								if (isSelected) bg = theme.gridCellFocused;
								else if (inWord) bg = theme.gridCellActiveWord;
								if (checked && letter && letter !== cell.solution) bg = '#F3C0C0';
								else if (checked && letter === cell.solution) bg = '#C9E3B0';
								return (
									<div
										key={`${r}-${c}`}
										role="gridcell"
										className="crossword-cell"
										style={{
											background: bg,
											borderColor: theme.borderSubtle,
											color: isSelected ? theme.gridCellFocusedText : theme.gridCellText,
										}}
										onClick={() => selectCell(r, c)}
										aria-label={`Row ${r + 1}, column ${c + 1}${letter ? `, ${letter}` : ', empty'}`}
									>
										{num ? <span className="crossword-number">{num}</span> : null}
										<span className="crossword-letter">{letter}</span>
									</div>
								);
							}),
						)}
					</div>
					<div className="crossword-controls">
						<button type="button" className="primary" style={{ background: theme.accentBg, color: theme.accentText, borderColor: theme.accentBorder }} onClick={handleCheck}>
							<Check size={16} /> Check
						</button>
						<button type="button" style={{ background: theme.bgSurface, color: theme.textPrimary, borderColor: theme.borderSubtle }} onClick={handleReveal}>
							<Eye size={16} /> Reveal word
						</button>
						<button type="button" style={{ background: theme.bgSurface, color: theme.textPrimary, borderColor: theme.borderSubtle }} onClick={handleClear}>
							<RotateCcw size={16} /> Clear
						</button>
					</div>
					<div className="crossword-meta-row">
						<div className="crossword-timer" style={{ color: theme.textPrimary }}>
							⏱ {formatClock(elapsed)}
						</div>
						<div className="crossword-status" style={{ color: solved ? '#2F7D32' : theme.textMuted }}>
							{solved
								? 'Solved! Nicely done.'
								: checked
									? wrongCount > 0
										? `${wrongCount} letter${wrongCount > 1 ? 's' : ''} to fix.`
										: 'All correct so far — keep going.'
										: `${puzzle.totalWhiteCells} squares to fill`}
						</div>
					</div>
					{solved && finalScore !== null ? (
						<div className="crossword-solved-banner" style={{ background: theme.accentBg, color: theme.accentText, borderColor: theme.accentBorder }}>
							<Trophy size={28} />
							<h2 style={{ color: theme.accentText }}>You found every missing piece.</h2>
							<p style={{ color: theme.accentText }}>
								Solved in {formatClock(elapsed)} on {difficulty} clues.
							</p>
							<p className="crossword-score" style={{ color: theme.accentText }}>
								Score: <strong>{finalScore.toLocaleString('en-GB')}</strong>
							</p>
							<div className="crossword-solved-actions">
								<button type="button" style={{ background: theme.bgCanvas, color: theme.textPrimary, borderColor: theme.textPrimary }} onClick={handleClear}>
									Play again
								</button>
								<button type="button" style={{ background: 'transparent', color: theme.accentText, borderColor: theme.accentText }} onClick={onExit}>
									Back to catalogue
								</button>
							</div>
						</div>
					) : null}
				</div>
				<div className="crossword-clues" style={cluePanelStyle}>
					<div className="crossword-difficulty">
						<span className="crossword-difficulty-label" style={{ color: theme.textMuted }}>Clue style</span>
						<div className="crossword-difficulty-row">
							{DIFFICULTY_OPTIONS.map((opt) => (
								<button
									key={opt.key}
									type="button"
									className={difficulty === opt.key ? 'active' : ''}
									style={
										difficulty === opt.key
											? { background: theme.accentBg, color: theme.accentText, borderColor: theme.accentBorder }
											: { background: theme.bgCanvas, color: theme.textPrimary, borderColor: theme.borderSubtle }
									}
									onClick={() => setDifficulty(opt.key)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>
					<div className="crossword-clue-col">
						<h3 style={{ color: theme.textMuted }}>Across</h3>
						{puzzle.clues.across.map((entry) => (
							<div
								key={entry.id}
								className={`crossword-clue${activeEntry?.id === entry.id && dir === 'across' ? ' active' : ''}`}
								style={
									activeEntry?.id === entry.id && dir === 'across'
										? { background: theme.gridCellActiveWord, color: theme.textPrimary }
										: { color: theme.textSecondary }
								}
								onClick={() => selectEntry(entry)}
								role="button"
								tabIndex={0}
							>
								<span className="clue-num">{entry.number}</span>
								<span>{clueText(entry, difficulty)}</span>
							</div>
						))}
					</div>
					<div className="crossword-clue-col">
						<h3 style={{ color: theme.textMuted }}>Down</h3>
						{puzzle.clues.down.map((entry) => (
							<div
								key={entry.id}
								className={`crossword-clue${activeEntry?.id === entry.id && dir === 'down' ? ' active' : ''}`}
								style={
									activeEntry?.id === entry.id && dir === 'down'
										? { background: theme.gridCellActiveWord, color: theme.textPrimary }
										: { color: theme.textSecondary }
								}
								onClick={() => selectEntry(entry)}
								role="button"
								tabIndex={0}
							>
								<span className="clue-num">{entry.number}</span>
								<span>{clueText(entry, difficulty)}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
