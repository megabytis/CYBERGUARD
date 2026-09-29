import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Download,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { RollingNumber } from '@/components/ui/RollingNumber';
import type { Evidence, Verdict } from './types';

type VerdictTakeoverProps = {
  score: number;
  verdict: Verdict;
  action: string;
  evidence: Evidence[];
  scanId?: string;
  aiExplanation?: string;
  onOpenCopilot?: () => void;
  onRescan?: () => void;
};

const verdictConfig = {
  safe: {
    label: 'SAFE',
    textColor: 'text-protected',
    borderColor: 'border-protected/50',
    tint: 'rgba(0, 255, 157, 0.08)',
    radialGlow: 'rgba(0, 255, 157, 0.18)',
    dotClass: 'bg-protected shadow-[0_0_8px_#00FF9D]',
    badgeVariant: 'protected' as const,
    icon: CheckCircle2,
  },
  review: {
    label: 'REVIEW',
    textColor: 'text-suspicious',
    borderColor: 'border-suspicious/50',
    tint: 'rgba(255, 176, 32, 0.08)',
    radialGlow: 'rgba(255, 176, 32, 0.18)',
    dotClass: 'bg-suspicious shadow-[0_0_8px_#FFB020]',
    badgeVariant: 'suspicious' as const,
    icon: AlertTriangle,
  },
  critical: {
    label: 'CRITICAL',
    textColor: 'text-critical',
    borderColor: 'border-critical/50',
    tint: 'rgba(255, 70, 90, 0.10)',
    radialGlow: 'rgba(255, 70, 90, 0.22)',
    dotClass: 'bg-critical shadow-[0_0_8px_#FF465A]',
    badgeVariant: 'critical' as const,
    icon: ShieldAlert,
  },
};

export const VerdictTakeover: React.FC<VerdictTakeoverProps> = ({
  score,
  verdict,
  action,
  evidence,
  scanId,
  aiExplanation,
  onOpenCopilot,
  onRescan,
}) => {
  const reduceMotion = useReducedMotion();
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <motion.section
      className="relative overflow-hidden rounded-[28px] border p-6 md:p-10 backdrop-blur-xl transition-colors duration-700"
      style={{
        backgroundColor: config.tint,
        borderColor: 'rgba(255, 255, 255, 0.16)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 24px 80px rgba(0, 0, 0, 0.35)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.65 }}
      aria-live="polite"
      aria-label="Scan verdict"
    >
      {/* Decorative Radial Threat Aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 18% 15%, ${config.radialGlow}, transparent 40%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Left Column: AI Explanation & Score Verdict */}
        <div>
          {/* Cyan is used strictly for AI reasoning */}
          <div className="flex items-center gap-2 text-[16px] font-extrabold tracking-[0.18em] text-information">
            <Sparkles size={18} aria-hidden="true" /> AI EXPLANATION
          </div>

          <div className={`mt-5 flex items-end gap-4 ${config.textColor}`}>
            <RollingNumber
              value={score}
              duration={900}
              className="score-display font-mono font-black"
            />
            <span className="mb-4 text-2xl font-bold text-white/70">/ 100</span>
          </div>

          <div className="flex items-center gap-4">
            <Icon size={38} className={config.textColor} aria-hidden="true" />
            <h2 className="text-5xl md:text-7xl font-black tracking-[0.08em] text-white">
              {config.label}
            </h2>
          </div>

          {/* Projector Compliance: 18px body text */}
          <p className="mt-6 max-w-xl text-[18px] font-medium leading-relaxed text-white/90">
            {action}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Cyan button for AI Copilot action */}
            <button
              type="button"
              onClick={onOpenCopilot}
              className="inline-flex items-center gap-3 rounded-xl border border-information/70 bg-information hover:bg-information/90 px-6 py-3.5 text-[18px] font-extrabold text-[#08090C] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(0,217,255,0.4)] focus:outline-none focus:ring-2 focus:ring-information"
              aria-label="Ask AI Copilot for deep forensic explanation"
            >
              <Sparkles size={20} aria-hidden="true" />
              Ask AI Copilot
              <ArrowRight size={20} aria-hidden="true" />
            </button>

            {scanId && (
              <GlassButton
                variant="secondary"
                size="lg"
                onClick={() => window.open(`/api/reports/download/${scanId}`, '_blank')}
                className="text-[16px] font-bold text-white/80 hover:text-white"
              >
                <Download size={18} className="mr-2" />
                Download PDF
              </GlassButton>
            )}

            {onRescan && (
              <GlassButton
                variant="secondary"
                size="lg"
                onClick={onRescan}
                className="text-[16px] font-bold text-white/80 hover:text-white"
              >
                <RotateCcw size={18} className="mr-2" />
                Scan Another URL
              </GlassButton>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Findings */}
        <div className="rounded-2xl border border-white/15 bg-black/40 p-6 md:p-7 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xl font-bold text-white">
              <span className={`h-3.5 w-3.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
              Why this verdict
            </div>
            <span className="font-mono text-[16px] font-semibold text-white/70">
              {evidence.length} Indicators
            </span>
          </div>

          <div className="space-y-5">
            {evidence.slice(0, 3).map((item, index) => {
              const itemConfig = verdictConfig[item.severity];
              return (
                <motion.div
                  key={item.label}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.12 }}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[16px] font-bold ${itemConfig.textColor} ${itemConfig.borderColor}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-[18px] font-bold text-white">{item.label}</h3>
                      <GlassBadge
                        variant={itemConfig.badgeVariant}
                        size="md"
                        className="text-[16px] py-0.5 font-bold"
                      >
                        {item.severity}
                      </GlassBadge>
                    </div>
                    {/* Projector rule: minimum 65% opacity */}
                    <p className="mt-1 text-[16px] leading-relaxed text-white/75">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Forensic Narrative if generated */}
      {aiExplanation && (
        <div className="mt-8 rounded-2xl border border-information/20 bg-information/[0.04] p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[16px] font-bold text-information mb-2">
            <Sparkles size={18} /> Forensic AI Narrative
          </div>
          <div className="text-[16px] leading-relaxed text-white/85 whitespace-pre-line font-sans">
            {aiExplanation}
          </div>
        </div>
      )}
    </motion.section>
  );
};
