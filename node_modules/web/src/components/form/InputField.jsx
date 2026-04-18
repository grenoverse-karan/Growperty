import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InputField = ({ label, type = "text", value, onChange, placeholder, required, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="form-field-label">
          {label} {required && <span className="form-required-asterisk">*</span>}
        </label>
      )}
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "h-12 rounded-lg border-gray-300 bg-white text-gray-900 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-colors",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};

export default InputField;