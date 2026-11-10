import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Grid3x3, Play } from 'lucide-react';
import { CURATED_PUZZLES } from '@/data/puzzles';
import type { PuzzleDefinition } from '@/data/crossword-types';
import { formatClock, loadProgress, type ProgressMap } from '@/lib/crossword-progress';

interface CatalogProps {
	onPlay: (puzzle: PuzzleDefinition) => void;
}

export function CrosswordCatalog({ onPlay }: CatalogProps) {
	const [progress, setProgress] = useState<ProgressMap>({});

	useEffect(() => {
		setProgress(loadProgress());
	}, []);

	// Group puzzles by archive date, newest first.
	const grouped = useMemo(() => {
		const map = new Map<string, PuzzleDefinition[]>();
		for (const p of CURATED_PUZZLES) {
			const list = map.get(p.archiveDate) ?? [];
			list.push(p);
			map.set(p.archiveDate, list);
		}
		return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
	}, []);

	const solvedCount = Object.values(progress).filter((p) => p.solved).length;
	const bestScore = Object.values(progress).reduce(
		(max, p) => (p.solved && p.score > max ? p.score : max),
		0,
	);

	return (
		<div className="crossword-catalog">
			<div className="catalog-stats">
				<div className="catalog-stat">
					<span className="catalog-stat-num">{solvedCount}</span>
					<span className="catalog-stat-label">Solved</span>
				</div>
				<div className="catalog-stat">
					<span className="catalog-stat-num">{CURATED_PUZZLES.length}</span>
					<span className="catalog-stat-label">Puzzles</span>
				</div>
				<div className="catalog-stat">
					<span className="catalog-stat-num">{bestScore.toLocaleString('en-GB')}</span>
					<span className="catalog-stat-label">Best score</span>
				</div>
			</div>

			<p className="catalog-intro">
				A rolling 21-day archive — a Standard 20×20 and a Quick 8×8 every day, generated
				deterministically from the MrDimpz/Crossword lexicon. Pick any edition to play;
				your progress saves automatically.
			</p>

			<div className="catalog-list">
				{grouped.map(([date, puzzles]) => {
					const [yyyy, mm, dd] = date.split('-');
					const label = new Date(Date.UTC(+yyyy, +mm - 1, +dd)).toLocaleDateString(
						'en-GB',
						{ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' },
					);
					return (
						<div key={date} className="catalog-day">
							<h3 className="catalog-day-title">{label}</h3>
							<div className="catalog-day-grid">
								{puzzles.map((p) => {
									const prog = progress[p.id];
									const solved = prog?.solved;
									return (
										<button
											key={p.id}
											type="button"
											className={`catalog-card${solved ? ' solved' : ''}`}
											onClick={() => onPlay(p)}
										>
											<div className="catalog-card-top">
												<span className="catalog-card-size">
													<Grid3x3 size={14} /> {p.gridSize}×{p.gridSize}
												</span>
												{solved ? (
													<span className="catalog-card-badge solved">
														<CheckCircle2 size={15} /> Solved
													</span>
												) : (
													<span className="catalog-card-badge">
														<Clock size={14} /> {p.totalWhiteCells} cells
													</span>
												)}
											</div>
											<h4 className="catalog-card-title">{p.title}</h4>
											<p className="catalog-card-sub">{p.subtitle}</p>
											{solved ? (
												<p className="catalog-card-score">
													{prog!.score.toLocaleString('en-GB')} pts · {formatClock(prog!.timeSeconds)}
												</p>
											) : (
												<p className="catalog-card-cta">
													<Play size={14} /> Play
												</p>
											)}
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
