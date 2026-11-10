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
import CrosswordPage from '@/routes/crossword';

const PAGE_TITLES: Record<string, string> = {
  '/': 'The Missing Piece — TikTok interactive & solo games',
  '/interactive-games': 'TikTok interactive games — The Missing Piece',
  '/solo-games': 'Solo games — The Missing Piece',
  '/solo-games/crossword': 'Crossword — Solo game — The Missing Piece',
};

function RouteWatcher() {
  const location = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] ?? 'The Missing Piece — TikTok interactive & solo games';
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

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteWatcher />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interactive-games" element={<InteractiveGamesPage />} />
        <Route path="/solo-games" element={<SoloGamesPage />} />
        <Route path="/solo-games/crossword" element={<CrosswordPage />} />
      </Routes>
      <SiteFooter />
      <CookieBanner />
    </BrowserRouter>
  );
}
