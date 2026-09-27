import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  borderGlow?: 'none' | 'protected' | 'information' | 'suspicious' | 'critical';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  elevated = false,
  borderGlow = 'none',
  ...props
}) => {
  const glowClasses = {
    none: 'border-border',
    protected: 'border-protected/40 shadow-protected-glow',
    information: 'border-information/40 shadow-info-glow',
    suspicious: 'border-suspicious/40',
    critical: 'border-critical/40 shadow-critical-glow',
  }[borderGlow];

  return (
    <div
      className={cn(
        elevated ? 'glass-panel-elevated' : 'glass-panel',
        'rounded-2xl relative overflow-hidden',
        glowClasses,
        className
      )}
      {...props}
    >
      {/* Decorative top inner highlight reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
};

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 relative overflow-hidden',
        hoverEffect && 'cursor-pointer hover:border-border-bright',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
};
