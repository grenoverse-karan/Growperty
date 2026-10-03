import React from 'react';
import { CONNECTIVITY_TYPES } from '@/lib/listingOptions.js';
import { getConnectivityIcon } from '@/lib/connectivityIcons.js';

// Read-only Connectivity cards (icon · category · place · distance chip) for
// the property and project detail pages.
const ConnectivityList = ({ rows }) => {
  if (!Array.isArray(rows) || !rows.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((c, i) => {
        const Icon = getConnectivityIcon(c.type);
        const label = CONNECTIVITY_TYPES.find(t => t.key === c.type)?.label || c.type;
        return (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50">
            <span className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
            </div>
            {c.distance && <span className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{c.distance}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default ConnectivityList;
