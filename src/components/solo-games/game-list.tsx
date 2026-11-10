import { ArrowUpRight } from 'lucide-react';

const CRUCI_URL = 'https://cruci.missingpiecepuzzles.fun/';

export function SoloGameList() {
	return (
		<section className="solo-page" aria-labelledby="solo-title">
			<div className="solo-hero">
				<p className="eyebrow">
					<span className="status-dot" /> SOLO GAMES
				</p>
				<h1 id="solo-title">Your game, your moment.</h1>
				<p>
					Solo games to play on your own and weave into your creator content. First up:
					Cruciverbalist, our 20×20 and 8×8 daily crossword featuring custom thematic puzzles,
					standard and cryptic clues, tiered hints, and leaderboards.
				</p>
			</div>
			<div className="game-list">
				<article className="game-card is-first">
					<div className="card-top">
						<span className="category-label">
							<span className="status-dot" /> NOW PLAYING
						</span>
						<span className="card-number">01 /</span>
					</div>
					<a
						href={CRUCI_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="game-art game-art-thumb"
						aria-label="Open Cruciverbalist 20×20 Daily Crossword at cruci.missingpiecepuzzles.fun"
					>
						<img
							className="game-thumbnail"
							src="/cruci-website-thumbnail.svg"
							alt="Cruciverbalist 20×20 Daily Crossword website thumbnail"
							referrerPolicy="no-referrer"
						/>
					</a>
					<h3>Cruciverbalist Daily Crossword</h3>
					<p>
						A 20×20 and 8×8 daily crossword game featuring custom thematic puzzles, a mixture of
						standard and cryptic clues, a tiered hint system, and local leaderboards.
					</p>
					<a
						className="game-link"
						href={CRUCI_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						Play crossword{' '}
						<span>
							<ArrowUpRight size={22} />
						</span>
					</a>
				</article>
			</div>
		</section>
	);
}
