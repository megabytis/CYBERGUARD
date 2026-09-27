import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-base sm:text-lg font-medium text-text-primary tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'glass-input w-full h-12 px-4 text-base rounded-xl font-mono text-text-primary placeholder:text-text-muted placeholder:font-sans transition-all duration-200',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-critical focus:border-critical focus:ring-1 focus:ring-critical',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-sm font-medium text-critical flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-critical" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
