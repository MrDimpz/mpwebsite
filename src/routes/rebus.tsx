import { useEffect } from 'react';
import RebusApp from '@/rebus/App';

export default function RebusPage() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark', 'theme-classic');
    };
  }, []);

  return <RebusApp />;
}
