import React from 'react';
import { cn } from '@/lib/utils';

const RadioButtonGroup = ({ label, options, value, onChange, required, error, columns = 3, note }) => {
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
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
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

export default RadioButtonGroup;