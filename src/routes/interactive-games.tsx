import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, KeyRound } from 'lucide-react';
import { AdminPortalModal } from '@/components/interactive-games/admin-portal-modal';
import { useInteractiveAuthStore } from '@/lib/interactive-key-auth';

export function InteractiveGamesPage() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { activeStreamer } = useInteractiveAuthStore();

  useEffect(() => {
    document.title = 'Interactive Live Games | The Missing Piece';

    const handleOpenAdmin = () => setAdminModalOpen(true);
    window.addEventListener('open-interactive-admin-portal', handleOpenAdmin);
    return () => window.removeEventListener('open-interactive-admin-portal', handleOpenAdmin);
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
            Built for chat, speed, and shared momentum. Jump in when the stream goes live, or unlock
            TikTok Live Streamer mode across all interactive games with a unified{' '}
            <code>LIVE-xxxx-xxxx</code> key from the site admin.
          </p>

          {activeStreamer && (
            <div
              style={{
                marginTop: '1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 16, 68, 0.08)',
                border: '1px solid var(--ink)',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              <KeyRound size={14} />
              <span>
                Authorized Streamer: <strong>{activeStreamer.displayHandle}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="game-list">
          {/* Card 01 / WiKirecTangled - Yellow Accent */}
          <article className="game-card is-first">
            <div className="card-top">
              <span className="category-label">
                <span className="status-dot" /> NOW PLAYING
              </span>
              <span className="card-number">01 /</span>
            </div>
            <Link
              to="/interactive-games/wikirec"
              className="game-art game-art-thumb"
              aria-label="Open WiKirecTangled"
            >
              <img
                className="game-thumbnail"
                src="/wikirec-website-thumbnail.svg"
                alt="Preview of the WiKirecTangled 8-connected Wikipedia word grid and TikTok Live chat bridge"
              />
            </Link>
            <h3>WiKirecTangled</h3>
            <p>
              Trace 8-connected word paths across a tactile 3D keycap board to unlock Common,
              Rare, and Ultra tiers while racing to uncover the hidden Wikipedia Article Title.
              Supports Solo Daily, Endless Practice, 4×4 Blitz, and TikTok Live Streamer mode
              powered by your <code>LIVE-xxxx-xxxx</code> key.
            </p>
            <div className="mt-auto pt-2">
              <Link className="game-link" to="/interactive-games/wikirec">
                Play WiKirecTangled{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </Link>
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
            <Link
              to="/interactive-games/wikicon"
              className="game-art game-art-thumb"
              aria-label="Open WikiContexto"
            >
              <img
                className="game-thumbnail"
                src="/wikicon-website-thumbnail.svg"
                alt="Preview of the WikiContexto redacted Wikipedia article discovery arena and 3D keycap matrix"
              />
            </Link>
            <h3>WikiContexto</h3>
            <p>
              Uncover a redacted Wikipedia article word-by-word using semantic closeness rankings,
              swipe hidden target words on the 3D keycap matrix, or connect your TikTok Live chat
              using the same <code>LIVE-xxxx-xxxx</code> streamer key so viewers can solve the
              article together in real time.
            </p>
            <div className="mt-auto pt-2">
              <Link className="game-link" to="/interactive-games/wikicon">
                Play WikiContexto{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </Link>
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
            <Link
              to="/interactive-games/squared"
              className="game-art game-art-thumb"
              aria-label="Open Squared Interactive"
            >
              <img
                className="game-thumbnail"
                src="/squaredint-website-thumbnail.svg"
                alt="Preview of Squared Interactive 4x4 word grid with TikTok Live player leaderboard"
              />
            </Link>
            <h3>Squared Interactive</h3>
            <p>
              Host the 4×4 word grid live on TikTok. Viewers race in chat to claim 4+ letter words
              and bonus words, trigger <code>!rotate</code> and <code>!hint</code> commands, and
              climb the live stream leaderboard — unlocked with your unified{' '}
              <code>LIVE-xxxx-xxxx</code> streamer key.
            </p>
            <div className="mt-auto pt-2">
              <Link className="game-link" to="/interactive-games/squared">
                Play Squared Interactive{' '}
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </Link>
            </div>
          </article>
        </div>

        {/* Collection Notice / TikTok Stream announcement */}
        <div className="collection-notice">
          <div>
            <h3>Live interactive stream schedule</h3>
            <p>
              Streaming live soon on TikTok: Follow <strong>@MissingPiecePuzzles</strong> to play along
              in chat with fellow solvers, or host your own stream with a site admin key.
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

      {/* Admin Portal Modal (Protected with MPAdmin / MPPassword1) */}
      <AdminPortalModal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </main>
  );
}

export default InteractiveGamesPage;
