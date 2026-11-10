import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useUnifiedAuth, getCleanDisplayName } from '@/lib/unified-game-auth';

export function LoggedInIndicator() {
  const { user } = useUnifiedAuth();
  if (!user) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 shadow-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
      <span className="truncate max-w-[90px] sm:max-w-[140px]">
        {getCleanDisplayName(user)}
      </span>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline" />
    </div>
  );
}
