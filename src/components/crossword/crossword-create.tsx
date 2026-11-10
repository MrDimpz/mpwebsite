import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { createCustomThemePuzzle } from '@/data/puzzles';
import type { PuzzleDefinition, VisualThemeId } from '@/data/crossword-types';

interface CreateProps {
	onPlay: (puzzle: PuzzleDefinition) => void;
}

const THEME_OPTIONS: { id: VisualThemeId; label: string }[] = [
	{ id: 'editorial', label: 'Broadsheet Ink' },
	{ id: 'observatory', label: 'Velvet Observatory' },
	{ id: 'botanical', label: 'Conservatory Felt' },
	{ id: 'mahogany', label: 'Archive Study' },
];

interface EntryDraft {
	answer: string;
	standardClue: string;
}

const STARTER_ENTRIES: EntryDraft[] = [
	{ answer: '', standardClue: '' },
	{ answer: '', standardClue: '' },
	{ answer: '', standardClue: '' },
	{ answer: '', standardClue: '' },
	{ answer: '', standardClue: '' },
];

export function CrosswordCreate({ onPlay }: CreateProps) {
	const [title, setTitle] = useState('');
	const [theme, setTheme] = useState<VisualThemeId>('editorial');
	const [gridSize, setGridSize] = useState<8 | 20>(8);
	const [entries, setEntries] = useState<EntryDraft[]>(STARTER_ENTRIES);
	const [error, setError] = useState<string | null>(null);

	const updateEntry = (idx: number, field: keyof EntryDraft, value: string) => {
		setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
	};

	const addEntry = () => setEntries((prev) => [...prev, { answer: '', standardClue: '' }]);

	const removeEntry = (idx: number) =>
		setEntries((prev) => prev.filter((_, i) => i !== idx));

	const handleGenerate = () => {
		const valid = entries.filter((e) => e.answer.trim() && e.standardClue.trim());
		if (!title.trim()) {
			setError('Give your puzzle a title.');
			return;
		}
		if (valid.length < 3) {
			setError('Add at least 3 words with answers and clues.');
			return;
		}
		setError(null);
		const puzzle = createCustomThemePuzzle(
			title.trim(),
			valid.map((e) => ({
				answer: e.answer.trim(),
				standardClue: e.standardClue.trim(),
			})),
			theme,
			gridSize,
		);
		onPlay(puzzle);
	};

	return (
		<div className="crossword-create">
			<p className="catalog-intro">
				Build your own themed crossword. Enter a title, pick a visual theme and grid size,
				then list your words and clues. The generator weaves them into a solvable grid
				using the MrDimpz/Crossword compiler.
			</p>

			<div className="create-field">
				<label htmlFor="cw-title">Puzzle title</label>
				<input
					id="cw-title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g. My Movie Night Quiz"
					maxLength={60}
				/>
			</div>

			<div className="create-row">
				<div className="create-field">
					<span className="create-field-label">Visual theme</span>
					<div className="create-chips">
						{THEME_OPTIONS.map((opt) => (
							<button
								key={opt.id}
								type="button"
								className={theme === opt.id ? 'active' : ''}
								onClick={() => setTheme(opt.id)}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>
				<div className="create-field">
					<span className="create-field-label">Grid size</span>
					<div className="create-chips">
						<button
							type="button"
							className={gridSize === 8 ? 'active' : ''}
							onClick={() => setGridSize(8)}
						>
							8×8 Quick
						</button>
						<button
							type="button"
							className={gridSize === 20 ? 'active' : ''}
							onClick={() => setGridSize(20)}
						>
							20×20 Standard
						</button>
					</div>
				</div>
			</div>

			<div className="create-entries">
				<span className="create-field-label">Words & clues</span>
				{entries.map((entry, idx) => (
					<div key={idx} className="create-entry">
						<input
							type="text"
							value={entry.answer}
							onChange={(e) => updateEntry(idx, 'answer', e.target.value)}
							placeholder={`Word ${idx + 1}`}
							maxLength={20}
							className="create-entry-word"
						/>
						<input
							type="text"
							value={entry.standardClue}
							onChange={(e) => updateEntry(idx, 'standardClue', e.target.value)}
							placeholder="Clue for this word"
							maxLength={120}
							className="create-entry-clue"
						/>
						{entries.length > 1 ? (
							<button
								type="button"
								className="create-entry-remove"
								onClick={() => removeEntry(idx)}
								aria-label={`Remove word ${idx + 1}`}
							>
								×
							</button>
						) : null}
					</div>
				))}
				<button type="button" className="create-add" onClick={addEntry}>
					+ Add another word
				</button>
			</div>

			{error ? <p className="create-error">{error}</p> : null}

			<button type="button" className="create-generate" onClick={handleGenerate}>
				<Wand2 size={18} /> Generate & play
			</button>
		</div>
	);
}
