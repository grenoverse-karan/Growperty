import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DropdownSelect = ({ label, options, value, onChange, placeholder, required, error }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="form-field-label">
          {label} {required && <span className="form-required-asterisk">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-12 rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-1 focus:ring-black ${error ? 'border-destructive' : ''}`}>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default DropdownSelect;