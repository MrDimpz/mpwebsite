import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Trophy, LogIn, LogOut, CheckCircle2, User as UserIcon } from 'lucide-react';
import {
	useUnifiedAuth,
	logoutUser,
	getCleanDisplayName,
	type SoloGameId,
} from '@/lib/unified-game-auth';
import { UnifiedAuthModal } from '@/components/solo-games/unified-auth-modal';

const CRUCI_URL = 'https://cruci.missingpiecepuzzles.fun/';

export function SoloGameList() {
	const { user } = useUnifiedAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authModalTab, setAuthModalTab] = useState<'account' | 'leaderboards'>('leaderboards');
	const [activeLeaderboardGame, setActiveLeaderboardGame] = useState<SoloGameId>('crossword');

	const openModal = (
		gameId: SoloGameId = 'crossword',
		tab: 'account' | 'leaderboards' = 'leaderboards'
	) => {
		setActiveLeaderboardGame(gameId);
		setAuthModalTab(tab);
		setAuthModalOpen(true);
	};

	return (
		<section className="solo-page" aria-labelledby="solo-title">
			<div className="solo-hero">
				<p className="eyebrow">
					<span className="status-dot" /> SOLO GAMES
				</p>
				<h1 id="solo-title">Your game, your moment.</h1>
				<p>
					Solo games to play on your own and weave into your creator content. Explore our
					daily 20×20 &amp; 8×8 crosswords, 733+ visual rebus challenges, tactile daily
					word grids, and daily word association puzzles.
				</p>
			</div>

			{/* Unified Solo Games Account & Login Banner */}
			<div className="mb-10 rounded-2xl bg-gradient-to-r from-[#23063A] via-[#340A54] to-[#23063A] border-2 border-[#D4A437] p-4 sm:p-6 text-[#F5F3F7] shadow-[0_14px_34px_rgba(35,6,58,0.22)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div className="flex items-start sm:items-center gap-3.5">
					<img
						src="/assets/aistudio/3d_logo_944e5372.png"
						alt="The Missing Piece Emblem"
						className="w-11 h-11 rounded-full object-contain shrink-0 drop-shadow"
					/>
					<div>
						{user ? (
							<>
								<div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold">
									<CheckCircle2 size={14} />
									<span>UNIFIED SOLO GAMES ACCOUNT ACTIVE</span>
								</div>
								<div className="text-lg sm:text-xl font-extrabold text-[#F6C915] tracking-tight mt-0.5">
									Welcome back, {getCleanDisplayName(user)}
								</div>
								<p className="text-xs sm:text-sm text-[#D6CBE2] mt-0.5">
									Your Google / Email login is synced across Crossword, Missing Rebus, Squared &amp; Thematix.
								</p>
							</>
						) : (
							<>
								<div className="text-xs font-mono uppercase tracking-widest text-[#F6C915] font-bold">
									ONE LOGIN · ALL SOLO GAMES · PUBLIC LEADERBOARDS
								</div>
								<div className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
									Sign in with Google or Email &amp; Password
								</div>
								<p className="text-xs sm:text-sm text-[#D6CBE2] mt-0.5">
									Use a single account across all 4 solo games to record your high scores and compete on the visitor leaderboards.
								</p>
							</>
						)}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
					{user ? (
						<>
							<button
								type="button"
								onClick={() => openModal(activeLeaderboardGame, 'account')}
								className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F6C915] hover:bg-[#FFE047] text-[#1D0830] font-bold text-xs transition-all cursor-pointer"
							>
								<UserIcon size={15} />
								<span>Account &amp; Display Name</span>
							</button>
							<button
								type="button"
								onClick={() => openModal(activeLeaderboardGame, 'leaderboards')}
								className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#F6C915]/40 text-[#F6C915] font-bold text-xs transition-all cursor-pointer"
							>
								<Trophy size={15} />
								<span>Leaderboards</span>
							</button>
							<button
								type="button"
								onClick={() => logoutUser()}
								className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/25 text-[#D6CBE2] hover:text-rose-200 font-semibold text-xs transition-all cursor-pointer"
							>
								<LogOut size={15} />
								<span>Sign Out</span>
							</button>
						</>
					) : (
						<>
							<button
								type="button"
								onClick={() => openModal('crossword', 'account')}
								className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F6C915] hover:bg-[#FFE047] text-[#1D0830] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
							>
								<LogIn size={16} />
								<span>Sign In / Create Account</span>
							</button>
							<button
								type="button"
								onClick={() => openModal('crossword', 'leaderboards')}
								className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#F6C915]/50 text-[#F6C915] font-bold text-xs sm:text-sm transition-all cursor-pointer"
							>
								<Trophy size={16} />
								<span>Leaderboards</span>
							</button>
						</>
					)}
				</div>
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
						standard and cryptic clues, a tiered hint system, and cloud leaderboards.
					</p>
					<div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-2">
						<a
							className="game-link flex-1"
							href={CRUCI_URL}
							target="_blank"
							rel="noopener noreferrer"
						>
							Play crossword{' '}
							<span>
								<ArrowUpRight size={22} />
							</span>
						</a>
						<button
							type="button"
							onClick={() => openModal('crossword', 'leaderboards')}
							className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2B0938] text-[#F6C915] hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer mt-3"
						>
							<Trophy size={13} />
							<span>Leaderboard</span>
						</button>
					</div>
				</article>

				<article className="game-card">
					<div className="card-top">
						<span className="category-label">
							<span className="status-dot" /> NOW PLAYING
						</span>
						<span className="card-number">02 /</span>
					</div>
					<Link
						to="/solo-games/rebus"
						className="game-art game-art-thumb"
						aria-label="Open Missing Rebus Challenge Archive"
					>
						<img
							className="game-thumbnail"
							src="/rebus-website-thumbnail.svg"
							alt="Missing Rebus — Rebus Challenge Archive website thumbnail"
							referrerPolicy="no-referrer"
						/>
					</Link>
					<h3>Missing Rebus</h3>
					<p>
						Interactive rebus puzzle archive featuring 733+ visual wordplay challenges, 53
						printable worksheet grids, 4-tier progressive hints, and a 5-round timed sprint mode.
					</p>
					<div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-2">
						<Link className="game-link flex-1" to="/solo-games/rebus">
							Play Missing Rebus{' '}
							<span>
								<ArrowUpRight size={22} />
							</span>
						</Link>
						<button
							type="button"
							onClick={() => openModal('rebus', 'leaderboards')}
							className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2B0938] text-[#F6C915] hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer mt-3"
						>
							<Trophy size={13} />
							<span>Leaderboard</span>
						</button>
					</div>
				</article>

				<article className="game-card">
					<div className="card-top">
						<span className="category-label">
							<span className="status-dot" /> NOW PLAYING
						</span>
						<span className="card-number">03 /</span>
					</div>
					<Link
						to="/solo-games/squared"
						className="game-art game-art-thumb"
						aria-label="Open Squared Daily Word Grid Puzzle"
					>
						<img
							className="game-thumbnail"
							src="/squared-website-thumbnail.svg"
							alt="Squared — Daily Word Grid Puzzle website thumbnail"
							referrerPolicy="no-referrer"
						/>
					</Link>
					<h3>Squared — Daily Word Grid</h3>
					<p>
						A tactile daily word-finding grid puzzle across 3×3 Express, 4×4 Classic, and 5×5
						Royal boards. Swipe adjacent letters, rotate the board 90°, and uncover the daily
						Missing Piece word.
					</p>
					<div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-2">
						<Link className="game-link flex-1" to="/solo-games/squared">
							Play Squared{' '}
							<span>
								<ArrowUpRight size={22} />
							</span>
						</Link>
						<button
							type="button"
							onClick={() => openModal('squared', 'leaderboards')}
							className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2B0938] text-[#F6C915] hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer mt-3"
						>
							<Trophy size={13} />
							<span>Leaderboard</span>
						</button>
					</div>
				</article>

				<article className="game-card">
					<div className="card-top">
						<span className="category-label">
							<span className="status-dot" /> NOW PLAYING
						</span>
						<span className="card-number">04 /</span>
					</div>
					<Link
						to="/solo-games/thematix"
						className="game-art game-art-thumb"
						aria-label="Open Thematix Daily Word Association Puzzle"
					>
						<img
							className="game-thumbnail"
							src="/thematix-website-thumbnail.svg"
							alt="Thematix — Daily Word Association Puzzle website thumbnail"
							referrerPolicy="no-referrer"
						/>
					</Link>
					<h3>Thematix — Word Association</h3>
					<p>
						Daily word association and trivia puzzle featuring Guess Mode, Fill Mode, six
						alphabetical theme-linked words, custom puzzle creation, daily archive, and streaks.
					</p>
					<div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-2">
						<Link className="game-link flex-1" to="/solo-games/thematix">
							Play Thematix{' '}
							<span>
								<ArrowUpRight size={22} />
							</span>
						</Link>
						<button
							type="button"
							onClick={() => openModal('thematix', 'leaderboards')}
							className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2B0938] text-[#F6C915] hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer mt-3"
						>
							<Trophy size={13} />
							<span>Leaderboard</span>
						</button>
					</div>
				</article>
			</div>

			{/* Pop-up Unified Auth & Leaderboard Modal */}
			<UnifiedAuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
				user={user}
				initialGameId={activeLeaderboardGame}
				initialTab={authModalTab}
			/>
		</section>
	);
}
