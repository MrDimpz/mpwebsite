import { useEffect } from 'react';
import ThematixApp from '@/thematix/App';

export default function ThematixPage() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark', 'theme-classic');
    };
  }, []);

  return <ThematixApp />;
}
