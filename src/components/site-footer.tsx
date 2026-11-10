import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowUpRight, Download, Loader2, Shield } from 'lucide-react';
import { openCookiePreferences } from '@/lib/cookie-consent';

export function SiteFooter() {
  const location = useLocation();
  const isInteractivePage = location.pathname === '/interactive-games';
  const [downloadingZip, setDownloadingZip] = useState(false);

  const showHostingerDownload =
    import.meta.env.VITE_HIDE_HOSTINGER_DOWNLOAD !== 'true' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.run.app'));

  const handleDownloadHostingerZip = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (downloadingZip) return;

    setDownloadingZip(true);
    try {
      const response = await fetch(`/api/download-hostinger-zip?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = 'the-missing-piece-hostinger.zip';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      // Fallback to direct anchor navigation if fetch fails
      const fallbackLink = document.createElement('a');
      fallbackLink.href = '/the-missing-piece-hostinger.zip';
      fallbackLink.download = 'the-missing-piece-hostinger.zip';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setDownloadingZip(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isInteractivePage && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-interactive-admin-portal'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                color: 'var(--ink)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontSize: '10px',
                padding: 0,
              }}
              title="Site Admin: Manage Keys & Users"
            >
              <Shield size={12} /> Admin Key Portal
            </button>
          )}
          {showHostingerDownload && (
            <a
              href="/the-missing-piece-hostinger.zip"
              download="the-missing-piece-hostinger.zip"
              onClick={handleDownloadHostingerZip}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 700,
                color: 'var(--ink)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                cursor: downloadingZip ? 'wait' : 'pointer',
                opacity: downloadingZip ? 0.7 : 1,
              }}
            >
              {downloadingZip ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Preparing .zip...
                </>
              ) : (
                <>
                  <Download size={12} /> Download Hostinger .zip
                </>
              )}
            </a>
          )}
          <button type="button" onClick={openCookiePreferences}>
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
}
