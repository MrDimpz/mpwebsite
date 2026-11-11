import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function InteractiveGamesPage() {
  useEffect(() => {
    document.title = 'Interactive Live Games | The Missing Piece';
  }, []);

  return (
    <main aria-label="Interactive live games">
      <section className="solo-page" aria-labelledby="interactive-title">
        <div className="solo-hero">
          <p className="eyebrow">
            <span className="status-dot" /> TIKTOK INTERACTIVE GAMES
          </p>
          <h1 id="interactive-title">Interactive live games.</h1>
          <p>
            Built for chat, speed, and shared momentum. Jump in when the stream goes live or host
            interactive sessions directly with your TikTok Live chat community.
          </p>
        </div>

        <div className="game-list">
          {/* Card 01 / WiKirecTangled */}
          <article className="game-card is-first">
            <div className="card-top">
              <span className="category-label">
                <span className="status-dot" /> NOW PLAYING
              </span>
              <span className="card-number">01 /</span>
            </div>
            <a
              href="https://wikirec.missingpiecepuzzles.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="game-art game-art-thumb"
              aria-label="Open WiKirecTangled (opens in new tab)"
            >
              <img
                className="game-thumbnail"
                src="/wikirec-website-thumbnail.svg"
                alt="Preview of the WiKirecTangled 8-connected Wikipedia word grid and TikTok Live chat bridge"
              />
            </a>
            <h3>WiKirecTangled</h3>
            <p>
              Trace 8-connected word paths across a tactile 3D keycap board to unlock Common,
              Rare, and Ultra tiers while racing to uncover the hidden Wikipedia Article Title.
              Supports Solo Daily, Endless Practice, 4×4 Blitz, and TikTok Live Streamer mode.
            </p>
            <div className="mt-auto pt-2">
              <a
                className="game-link"
                href="https://wikirec.missingpiecepuzzles.fun"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play WiKirecTangled{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </a>
            </div>
          </article>

          {/* Card 02 / WikiContexto */}
          <article className="game-card">
            <div className="card-top">
              <span className="category-label">
                <span className="status-dot" /> NOW PLAYING
              </span>
              <span className="card-number">02 /</span>
            </div>
            <a
              href="https://wikicon.missingpiecepuzzles.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="game-art game-art-thumb"
              aria-label="Open WikiContexto (opens in new tab)"
            >
              <img
                className="game-thumbnail"
                src="/wikicon-website-thumbnail.svg"
                alt="Preview of the WikiContexto redacted Wikipedia article discovery arena and 3D keycap matrix"
              />
            </a>
            <h3>WikiContexto</h3>
            <p>
              Uncover a redacted Wikipedia article word-by-word using semantic closeness rankings,
              swipe hidden target words on the 3D keycap matrix, or connect your TikTok Live chat
              so viewers can solve the article together in real time.
            </p>
            <div className="mt-auto pt-2">
              <a
                className="game-link"
                href="https://wikicon.missingpiecepuzzles.fun"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play WikiContexto{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </a>
            </div>
          </article>

          {/* Card 03 / Squared Interactive */}
          <article className="game-card">
            <div className="card-top">
              <span className="category-label">
                <span className="status-dot" /> NOW PLAYING
              </span>
              <span className="card-number">03 /</span>
            </div>
            <a
              href="https://squared.missingpiecepuzzles.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="game-art game-art-thumb"
              aria-label="Open Squared Interactive (opens in new tab)"
            >
              <img
                className="game-thumbnail"
                src="/squaredint-website-thumbnail.svg"
                alt="Preview of Squared Interactive 4x4 word grid with TikTok Live player leaderboard"
              />
            </a>
            <h3>Squared Interactive</h3>
            <p>
              Host the 4×4 word grid live on TikTok. Viewers race in chat to claim 4+ letter words
              and bonus words, trigger <code>!rotate</code> and <code>!hint</code> commands, and
              climb the live stream leaderboard.
            </p>
            <div className="mt-auto pt-2">
              <a
                className="game-link"
                href="https://squared.missingpiecepuzzles.fun"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play Squared Interactive{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </a>
            </div>
          </article>

          {/* Card 04 / Lexi Tiles */}
          <article className="game-card">
            <div className="card-top">
              <span className="category-label">
                <span className="status-dot" /> NOW PLAYING
              </span>
              <span className="card-number">04 /</span>
            </div>
            <a
              href="https://lexi.missingpiecepuzzles.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="game-art game-art-thumb"
              aria-label="Open Lexi Tiles (opens in new tab)"
            >
              <img
                className="game-thumbnail"
                src="/lexi-website-thumbnail.svg"
                alt="Preview of Lexi Tiles interactive lexicon word arena and TikTok Live chat duel"
              />
            </a>
            <h3>Lexi Tiles</h3>
            <p>
              The fast-paced live lexicon showdown. Race against the clock and chat to assemble
              words from dynamic letter pools, score combo multipliers, and discover rare
              high-value vocabulary in real time.
            </p>
            <div className="mt-auto pt-2">
              <a
                className="game-link"
                href="https://lexi.missingpiecepuzzles.fun"
                target="_blank"
                rel="noopener noreferrer"
              >
                Play Lexi Tiles{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </a>
            </div>
          </article>
        </div>

        {/* Collection Notice / TikTok Stream announcement */}
        <div className="collection-notice">
          <div>
            <h3>Live interactive stream schedule</h3>
            <p>
              Streaming live soon on TikTok: Follow <strong>@MissingPiecePuzzles</strong> to play along
              in chat with fellow solvers and join the interactive live community.
            </p>
          </div>
          <a
            className="button button-dark"
            style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
            href="https://www.tiktok.com/@MissingPiecePuzzles"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow on TikTok <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}

export default InteractiveGamesPage;
