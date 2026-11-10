import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';

export function SiteHeader() {
  return (
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
      <Link className="header-action" to="/#games">
        Find your game <ArrowUpRight size={17} />
      </Link>
    </header>
  );
}
