import React from 'react';
import { RollingNumber } from './RollingNumber';
import { GlassPanel } from './GlassPanel';
import { cn } from '@/lib/utils';

export interface RollingKPIProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: string;
  status?: 'protected' | 'information' | 'suspicious' | 'critical' | 'neutral';
  className?: string;
}

export const RollingKPI: React.FC<RollingKPIProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  subtitle,
  trend,
  status = 'neutral',
  className,
}) => {
  const statusColors = {
    protected: 'text-protected border-protected/30 group-hover:border-protected',
    information: 'text-information border-information/30 group-hover:border-information',
    suspicious: 'text-suspicious border-suspicious/30 group-hover:border-suspicious',
    critical: 'text-critical border-critical/30 group-hover:border-critical',
    neutral: 'text-text-primary border-border',
  }[status];

  const glowShadow = {
    protected: 'shadow-[0_0_20px_rgba(0,255,157,0.15)]',
    information: 'shadow-[0_0_20px_rgba(0,217,255,0.15)]',
    suspicious: 'shadow-[0_0_20px_rgba(255,191,63,0.15)]',
    critical: 'shadow-[0_0_20px_rgba(255,77,109,0.2)]',
    neutral: '',
  }[status];

  return (
    <GlassPanel
      className={cn(
        'group p-6 flex flex-col justify-between transition-all duration-300 hover:border-border-bright',
        glowShadow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-base font-medium text-text-secondary tracking-wide uppercase">
          {title}
        </span>
        {icon && (
          <div className={cn('p-2.5 rounded-xl bg-surface-glass border', statusColors)}>
            {icon}
          </div>
        )}
      </div>

      <div className="my-3">
        <RollingNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          className={cn('text-4xl sm:text-5xl font-black font-mono tracking-tight', statusColors)}
        />
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-sm text-text-muted pt-2 border-t border-border/50">
          <span>{subtitle}</span>
          {trend && <span className="font-mono text-text-secondary">{trend}</span>}
        </div>
      )}
    </GlassPanel>
  );
};

export interface EvidenceStrengthBarProps {
  confidence: number; // 0 to 1 or 0 to 100
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  className?: string;
  showLabel?: boolean;
}

export const EvidenceStrengthBar: React.FC<EvidenceStrengthBarProps> = ({
  confidence,
  severity,
  className = '',
  showLabel = true,
}) => {
  const normalized = confidence > 1 ? confidence : Math.round(confidence * 100);

  const severityColor = {
    CRITICAL: 'bg-critical',
    HIGH: 'bg-critical/80',
    MEDIUM: 'bg-suspicious',
    LOW: 'bg-protected',
    INFO: 'bg-information',
  }[severity] || 'bg-information';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono text-text-muted mb-1">
          <span>EVIDENCE CONFIDENCE</span>
          <span className="text-text-primary font-bold">{normalized}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface-glass-active rounded-full overflow-hidden border border-border/40">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${severityColor}`}
          style={{ width: `${Math.max(5, Math.min(100, normalized))}%` }}
        />
      </div>
    </div>
  );
};
