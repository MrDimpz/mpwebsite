import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, User as UserIcon, LogIn } from 'lucide-react';
import { useUnifiedAuth, getCleanDisplayName } from '@/lib/unified-game-auth';
import { UnifiedAuthModal } from '@/components/solo-games/unified-auth-modal';

export function SiteHeader() {
  const { user } = useUnifiedAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'account' | 'leaderboards'>('account');

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: 'account' | 'leaderboards' }>).detail;
      setAuthModalTab(detail?.tab || 'account');
      setAuthModalOpen(true);
    };
    window.addEventListener('open-site-auth-modal', handleOpenAuth);

    const params = new URLSearchParams(window.location.search);
    if (params.get('oobCode') || params.get('resetToken') || params.get('reset_token')) {
      setAuthModalTab('account');
      setAuthModalOpen(true);
    }

    return () => window.removeEventListener('open-site-auth-modal', handleOpenAuth);
  }, []);

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="The Missing Piece home">
          <img
            className="brand-logo"
            src="/brand-logo.png"
            alt="The Missing Piece — Find your space"
          />
          <span className="brand-name">
            THE MISSING
            <br />
            <span>PIECE</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/interactive-games">
            TikTok interactive <ArrowUpRight size={15} />
          </Link>
          <Link to="/solo-games">
            Solo games <ArrowUpRight size={15} />
          </Link>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="header-auth-btn"
            onClick={() => {
              setAuthModalTab('account');
              setAuthModalOpen(true);
            }}
          >
            {user ? (
              <>
                <UserIcon size={15} />
                <span>{getCleanDisplayName(user)}</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign in</span>
              </>
            )}
          </button>
          <Link className="header-action" to="/#games">
            Find your game <ArrowUpRight size={17} />
          </Link>
        </div>
      </header>

      <UnifiedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        initialTab={authModalTab}
      />
    </>
  );
}
