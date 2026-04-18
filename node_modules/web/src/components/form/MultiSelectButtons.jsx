import React from 'react';
import { cn } from '@/lib/utils';

const MultiSelectButtons = ({ label, options, values = [], onChange, required, error, columns = 3, note }) => {
  const toggleValue = (val) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="form-field-label">
          {label} {required && <span className="form-required-asterisk">*</span>}
        </label>
      )}
      {note && <p className="form-helper-text mb-3">{note}</p>}
      
      <div className={cn(
        "grid gap-3",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 md:grid-cols-3",
        columns === 4 && "grid-cols-2 md:grid-cols-4",
        columns === 'auto' && "flex flex-wrap"
      )}>
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 text-center",
                isSelected 
                  ? "bg-black text-white border-black shadow-md" 
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default MultiSelectButtons;