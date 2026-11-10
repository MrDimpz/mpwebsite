import { useEffect } from 'react';
import SquaredApp from '@/squared/App';

export default function SquaredPage() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark', 'theme-classic');
    };
  }, []);

  return <SquaredApp />;
}
