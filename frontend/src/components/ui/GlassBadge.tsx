import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'protected' | 'information' | 'suspicious' | 'critical' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const variantStyles = {
    protected: 'bg-protected/15 text-protected border-protected/30 shadow-[0_0_12px_rgba(0,255,157,0.15)]',
    information: 'bg-information/15 text-information border-information/30 shadow-[0_0_12px_rgba(0,217,255,0.15)]',
    suspicious: 'bg-suspicious/15 text-suspicious border-suspicious/30 shadow-[0_0_12px_rgba(255,191,63,0.15)]',
    critical: 'bg-critical/15 text-critical border-critical/30 shadow-[0_0_12px_rgba(255,77,109,0.15)]',
    neutral: 'bg-surface-glass text-text-secondary border-border',
  }[variant];

  const dotColors = {
    protected: 'bg-protected shadow-[0_0_6px_#00FF9D]',
    information: 'bg-information shadow-[0_0_6px_#00D9FF]',
    suspicious: 'bg-suspicious shadow-[0_0_6px_#FFBF3F]',
    critical: 'bg-critical shadow-[0_0_6px_#FF4D6D]',
    neutral: 'bg-text-muted',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold',
    lg: 'text-base px-4 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border backdrop-blur-md font-mono uppercase tracking-wider',
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-2 h-2 rounded-full shrink-0', dotColors)} />}
      {children}
    </span>
  );
};
