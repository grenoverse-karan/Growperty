import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { CONNECTIVITY_TYPES } from '@/lib/listingOptions.js';
import { getConnectivityIcon } from '@/lib/connectivityIcons.js';

/**
 * Metro / Airport / Highway / … rows — nearest place + distance or drive
 * time, typed by the lister. Shared by the property and project forms.
 * `value` is { [key]: { name, distance } }; `onChange(key, field, text)`.
 */
const ConnectivityFields = ({ value, onChange, inputClassName = 'form-input' }) => (
  <div className="space-y-2.5">
    {CONNECTIVITY_TYPES.map(({ key, label, placeholder }) => {
      const Icon = getConnectivityIcon(key);
      return (
        <div key={key} className="grid grid-cols-1 sm:grid-cols-[150px_1fr_160px] gap-2 sm:items-center">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            {label}
          </span>
          <Input
            placeholder={placeholder}
            maxLength={80}
            className={inputClassName}
            value={value[key]?.name || ''}
            onChange={(e) => onChange(key, 'name', e.target.value)}
          />
          <Input
            placeholder="e.g. 2 km / 10 min"
            maxLength={20}
            className={inputClassName}
            value={value[key]?.distance || ''}
            onChange={(e) => onChange(key, 'distance', e.target.value)}
          />
        </div>
      );
    })}
  </div>
);

export default ConnectivityFields;
