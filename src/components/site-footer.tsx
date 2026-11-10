import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { openCookiePreferences } from '@/lib/cookie-consent';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
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
        <p>Find Your Space.</p>
        <Link to="/#games">
          Back to the games <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© 2026 The Missing Piece</span>
        <span>Independent of TikTok.</span>
        <button type="button" onClick={openCookiePreferences}>
          Cookie settings
        </button>
      </div>
    </footer>
  );
}
