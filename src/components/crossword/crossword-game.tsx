import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, LayoutGrid, Plus, Trophy } from 'lucide-react';
import type { PuzzleDefinition } from '@/data/crossword-types';
import { CURATED_PUZZLES, getTodayIsoDate } from '@/data/puzzles';
import { formatClock, loadLeaderboard } from '@/lib/crossword-progress';
import { CrosswordCatalog } from '@/components/crossword/crossword-catalog';
import { CrosswordCreate } from '@/components/crossword/crossword-create';
import { CrosswordPlay } from '@/components/crossword/crossword-play';

type View = 'catalog' | 'create' | 'leaderboard' | 'play';

export function CrosswordGame() {
	const [view, setView] = useState<View>('catalog');
	const [activePuzzle, setActivePuzzle] = useState<PuzzleDefinition | null>(null);
	const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());

	// Refresh leaderboard whenever we return to it.
	useEffect(() => {
		if (view === 'leaderboard') setLeaderboard(loadLeaderboard());
	}, [view]);

	const todaysPuzzle = useMemo(() => {
		const today = getTodayIsoDate();
		return (
			CURATED_PUZZLES.find((p) => p.archiveDate === today && p.gridSize === 20) ??
			CURATED_PUZZLES[0]
		);
	}, []);

	const startPlay = (puzzle: PuzzleDefinition) => {
		setActivePuzzle(puzzle);
		setView('play');
		// Scroll to top so the board is in view.
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const exitPlay = () => {
		setActivePuzzle(null);
		setView('catalog');
	};

	if (view === 'play' && activePuzzle) {
		return (
			<section className="crossword-page" aria-label="Crossword game">
				<CrosswordPlay puzzle={activePuzzle} onExit={exitPlay} />
			</section>
		);
	}

	return (
		<section className="crossword-page" aria-labelledby="crossword-title">
			<Link to="/solo-games" className="solo-back">
				<ArrowLeft size={16} /> Back to solo games
			</Link>

			<div className="crossword-head">
				<p className="eyebrow">
					<span className="status-dot" /> SOLO GAME 01 · THE MISSING PIECE CROSSWORD
				</p>
				<h1 id="crossword-title">Crossword</h1>
				<p>
					The full MrDimpz/Crossword experience: a rolling 21-day archive of Standard 20×20
					and Quick 8×8 puzzles, five clue styles from Easy to Cryptic, four visual themes,
					timed scoring, a custom-puzzle builder, and a local leaderboard. Pick an edition
					below or build your own.
				</p>
			</div>

			<div className="crossword-tabs">
				<button
					type="button"
					className={view === 'catalog' ? 'active' : ''}
					onClick={() => setView('catalog')}
				>
					<LayoutGrid size={16} /> Catalogue
				</button>
				<button
					type="button"
					className={view === 'create' ? 'active' : ''}
					onClick={() => setView('create')}
				>
					<Plus size={16} /> Create
				</button>
				<button
					type="button"
					className={view === 'leaderboard' ? 'active' : ''}
					onClick={() => setView('leaderboard')}
				>
					<Trophy size={16} /> Leaderboard
				</button>
				<button
					type="button"
					className="crossword-tabs-cta"
					onClick={() => startPlay(todaysPuzzle)}
				>
					Play today's puzzle →
				</button>
			</div>

			{view === 'catalog' ? <CrosswordCatalog onPlay={startPlay} /> : null}
			{view === 'create' ? <CrosswordCreate onPlay={startPlay} /> : null}
			{view === 'leaderboard' ? (
				<div className="crossword-leaderboard">
					{leaderboard.length === 0 ? (
						<p className="leaderboard-empty">
							No solves yet. Complete a puzzle to claim your spot on the board.
						</p>
					) : (
						<ol className="leaderboard-list">
							{leaderboard.map((entry, idx) => (
								<li key={entry.id} className="leaderboard-row">
									<span className="leaderboard-rank">{idx + 1}</span>
									<div className="leaderboard-main">
										<span className="leaderboard-title">{entry.puzzleTitle}</span>
										<span className="leaderboard-meta">
											{entry.gridSize}×{entry.gridSize} · {entry.clueDifficulty} · {formatClock(entry.timeSeconds)}
										</span>
									</div>
									<span className="leaderboard-score">{entry.score.toLocaleString('en-GB')}</span>
								</li>
							))}
						</ol>
					)}
				</div>
			) : null}
		</section>
	);
}
