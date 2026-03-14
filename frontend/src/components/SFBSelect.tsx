'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SFBSelectOption {
  value: string;
  label: string;
}

interface SFBSelectProps {
  label?: string;
  options: SFBSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  leftAddon?: React.ReactNode;
}

export default function SFBSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  error,
  disabled,
  containerClassName,
  className,
  leftAddon,
}: SFBSelectProps) {
  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[color:var(--color-text)]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 flex items-center z-10 pointer-events-none">
            {leftAddon}
          </div>
        )}
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'input-base appearance-none cursor-pointer pr-10',
            leftAddon && 'pl-20',
            error && 'border-danger',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 text-[color:var(--color-text-muted)] pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
