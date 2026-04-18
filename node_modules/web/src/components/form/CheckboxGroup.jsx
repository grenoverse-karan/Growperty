import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const CheckboxGroup = ({ label, options, values = [], onChange, required, error, columns = 2 }) => {
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
      
      <div className={cn(
        "grid gap-4 mt-2",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-3">
            <Checkbox 
              id={`checkbox-${option.value}`}
              checked={values.includes(option.value)}
              onCheckedChange={() => toggleValue(option.value)}
              className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
            />
            <label 
              htmlFor={`checkbox-${option.value}`}
              className="text-sm font-medium text-gray-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default CheckboxGroup;