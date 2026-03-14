'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface SFBInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

const SFBInput = forwardRef<HTMLInputElement, SFBInputProps>(
  ({ label, error, hint, leftAddon, rightAddon, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

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
            <div className="absolute left-3 flex items-center text-[color:var(--color-text-muted)]">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]',
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center text-[color:var(--color-text-muted)]">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[color:var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

SFBInput.displayName = 'SFBInput';
export default SFBInput;
