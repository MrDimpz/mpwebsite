/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import HomePage from '@/routes/home';
import InteractiveGamesPage from '@/routes/interactive-games';
import SoloGamesPage from '@/routes/solo-games';
import RebusPage from '@/routes/rebus';
import SquaredPage from '@/routes/squared';
import ThematixPage from '@/routes/thematix';
import WikirecGamePage from '@/routes/wikirec-game';
import WikiconGamePage from '@/routes/wikicon-game';

const PAGE_TITLES: Record<string, string> = {
  '/': 'The Missing Piece — TikTok interactive & solo games',
  '/interactive-games': 'TikTok interactive games — The Missing Piece',
  '/interactive-games/wikirec': 'WiKirecTangled — Interactive game — The Missing Piece',
  '/interactive-games/wikicon': 'WikiContexto — Interactive game — The Missing Piece',
  '/solo-games': 'Solo games — The Missing Piece',
  '/solo-games/rebus': 'Missing Rebus — Solo game — The Missing Piece',
  '/solo-games/squared': 'Squared — Daily Word Grid — The Missing Piece',
  '/solo-games/thematix': 'Thematix — Word Association — The Missing Piece',
};

const STANDALONE_GAME_PATHS = new Set([
  '/solo-games/rebus',
  '/solo-games/squared',
  '/solo-games/thematix',
  '/interactive-games/wikirec',
  '/interactive-games/wikicon',
]);

function AppShell() {
  const location = useLocation();
  const isStandaloneGame = STANDALONE_GAME_PATHS.has(location.pathname);

  useEffect(() => {
    const title =
      PAGE_TITLES[location.pathname] ?? 'The Missing Piece — TikTok interactive & solo games';
    document.title = title;

    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  if (isStandaloneGame) {
    return (
      <Routes>
        <Route path="/solo-games/rebus" element={<RebusPage />} />
        <Route path="/solo-games/squared" element={<SquaredPage />} />
        <Route path="/solo-games/thematix" element={<ThematixPage />} />
        <Route path="/interactive-games/wikirec" element={<WikirecGamePage />} />
        <Route path="/interactive-games/wikicon" element={<WikiconGamePage />} />
      </Routes>
    );
  }

  return (
    <div className="mp-site">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interactive-games" element={<InteractiveGamesPage />} />
        <Route path="/solo-games" element={<SoloGamesPage />} />
      </Routes>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
