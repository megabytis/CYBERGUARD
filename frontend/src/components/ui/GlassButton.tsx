import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'destructive' | 'protected';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-9 px-3 text-sm rounded-lg',
      md: 'h-11 px-5 text-base font-medium rounded-xl min-h-[44px]',
      lg: 'h-13 px-7 text-lg font-semibold rounded-xl min-h-[48px]',
    }[size];

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-information/20 via-information/30 to-information/20 hover:from-information/30 hover:to-information/40 text-text-primary border border-information/40 hover:border-information shadow-[0_0_20px_rgba(0,217,255,0.25)] hover:shadow-[0_0_25px_rgba(0,217,255,0.4)]',
      protected:
        'bg-gradient-to-r from-protected/20 via-protected/30 to-protected/20 hover:from-protected/30 hover:to-protected/40 text-text-primary border border-protected/40 hover:border-protected shadow-[0_0_20px_rgba(0,255,157,0.25)] hover:shadow-[0_0_25px_rgba(0,255,157,0.4)]',
      secondary:
        'bg-surface-glass hover:bg-surface-glass-hover text-text-primary border border-border hover:border-border-bright shadow-glass',
      ghost:
        'bg-transparent hover:bg-surface-glass text-text-secondary hover:text-text-primary border border-transparent hover:border-border',
      icon:
        'h-11 w-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center bg-surface-glass hover:bg-surface-glass-hover text-text-primary border border-border hover:border-border-bright rounded-xl',
      destructive:
        'bg-critical/20 hover:bg-critical/30 text-critical hover:text-white border border-critical/40 hover:border-critical shadow-[0_0_20px_rgba(255,77,109,0.25)]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 cursor-pointer font-sans select-none overflow-hidden backdrop-blur-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {/* Subtle Liquid Top Sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
