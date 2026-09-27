import React from 'react';
import { motion } from 'motion/react';
import { RollingNumber } from './RollingNumber';
import { getRiskVariant } from '@/lib/utils';

export interface AnimatedRiskGaugeProps {
  score: number;
  className?: string;
  showDetails?: boolean;
}

export const AnimatedRiskGauge: React.FC<AnimatedRiskGaugeProps> = ({
  score,
  className = '',
  showDetails = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const variant = getRiskVariant(clampedScore);

  // SVG Gauge calculations for a 180-degree semi-circle
  // ViewBox: 320 x 200
  const width = 320;
  const height = 185;
  const cx = 160;
  const cy = 160;
  const radius = 125;
  const strokeWidth = 18;
  const circumference = Math.PI * radius; // Half-circle circumference (~392.7)
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* SVG Container */}
      <div className="relative w-full max-w-[320px] overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="riskTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFBF3F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.8" />
            </linearGradient>
            <filter id="gaugeActiveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="8"
                floodColor={variant.color}
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <motion.path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke={variant.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            filter="url(#gaugeActiveGlow)"
          />

          {/* Accent Markers */}
          <circle cx={cx - radius} cy={cy} r="3" fill="#687580" />
          <circle cx={cx} cy={cy - radius} r="3" fill="#687580" />
          <circle cx={cx + radius} cy={cy} r="3" fill="#687580" />
        </svg>

        {/* Centered Score Overlay - Strictly sized to never overlap */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 text-center pointer-events-none">
          <div className="flex items-baseline justify-center">
            <RollingNumber
              value={clampedScore}
              duration={900}
              className="text-6xl sm:text-7xl font-black font-mono tracking-tighter"
            />
            <span className="text-xl font-mono text-text-muted ml-1 font-semibold">/100</span>
          </div>

          {showDetails && (
            <div className="mt-1">
              <span
                className="inline-block px-3 py-0.5 text-xs font-bold font-mono tracking-widest uppercase rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${variant.color}15`,
                  borderColor: `${variant.color}40`,
                  color: variant.color,
                }}
              >
                {variant.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Axis Scale Legend below arc */}
      <div className="w-full max-w-[300px] flex justify-between px-1 text-[11px] font-mono text-text-muted mt-2">
        <span className="text-protected font-medium">0 &bull; LOW</span>
        <span className="text-suspicious font-medium">50</span>
        <span className="text-critical font-medium">100 &bull; CRITICAL</span>
      </div>
    </div>
  );
};
