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
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { ForensicNarrative } from './ForensicNarrative';
import { api } from '@/lib/api';
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
      className="relative overflow-hidden rounded-[24px] border border-cyan-500/25 dark:border-white/15 p-6 md:p-8 backdrop-blur-xl transition-colors duration-500 shadow-[0_10px_35px_-8px_rgba(8,145,178,0.12),0_0_2px_1px_rgba(8,145,178,0.15)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_60px_rgba(0,0,0,0.35)]"
      style={{
        backgroundColor: config.tint,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.45 }}
      aria-live="polite"
      aria-label="Scan verdict"
    >
      {/* Decorative Radial Threat Aura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 18% 15%, ${config.radialGlow}, transparent 45%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Left Column: AI Explanation & Score Verdict */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-information">
            <Sparkles size={15} aria-hidden="true" />
            <span>THREAT ASSESSMENT VERDICT</span>
          </div>

          <div className={`mt-3 flex items-end gap-3 ${config.textColor}`}>
            <RollingNumber
              value={score}
              duration={700}
              className="score-display font-mono font-black"
            />
            <span className="mb-2 text-xl font-bold text-slate-500 dark:text-white/50">/ 100</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <Icon size={30} className={config.textColor} aria-hidden="true" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-slate-950 dark:text-white">
              {config.label}
            </h2>
          </div>

          <p className="mt-3 max-w-xl text-sm md:text-base font-normal leading-relaxed text-slate-700 dark:text-white/80">
            {action}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCopilot}
              className="inline-flex items-center gap-2 rounded-xl border border-information/70 bg-information hover:bg-information/90 px-5 py-2.5 text-sm md:text-base font-bold text-[#08090C] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,217,255,0.35)] focus:outline-none focus:ring-2 focus:ring-information"
              aria-label="Ask AI Copilot for deep forensic explanation"
            >
              <Sparkles size={17} aria-hidden="true" />
              Ask CYBERGUARD AI
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            {scanId && (
              <GlassButton
                variant="secondary"
                size="md"
                onClick={() => window.open(api.getUrl(`/reports/download/${scanId}`), '_blank')}
                className="text-sm font-semibold text-slate-800 dark:text-white/85 hover:text-cyan-700 dark:hover:text-white"
              >
                <Download size={16} className="mr-1.5" />
                Download PDF
              </GlassButton>
            )}

            {onRescan && (
              <GlassButton
                variant="secondary"
                size="md"
                onClick={onRescan}
                className="text-sm font-semibold text-slate-800 dark:text-white/85 hover:text-cyan-700 dark:hover:text-white"
              >
                <RotateCcw size={16} className="mr-1.5" />
                New Scan
              </GlassButton>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Findings */}
        <div className="rounded-2xl border border-cyan/20 dark:border-white/10 bg-white/95 dark:bg-black/40 p-5 md:p-6 backdrop-blur-md shadow-[0_4px_24px_rgba(8,145,178,0.10)] dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-base md:text-lg font-bold text-slate-900 dark:text-white">
              <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
              Why this verdict
            </div>
            <span className="font-mono text-xs font-semibold text-slate-600 dark:text-white/60">
              {evidence.length} Indicators
            </span>
          </div>

          <div className="space-y-3.5">
            {evidence.slice(0, 3).map((item, index) => {
              const itemConfig = verdictConfig[item.severity];
              return (
                <motion.div
                  key={item.label}
                  className="flex gap-3 items-start p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.15 + index * 0.1 }}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${itemConfig.textColor} ${itemConfig.borderColor}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{item.label}</h3>
                      <GlassBadge
                        variant={itemConfig.badgeVariant}
                        size="sm"
                        className="text-xs py-0.5 font-bold"
                      >
                        {item.severity}
                      </GlassBadge>
                    </div>
                    <p className="mt-1 text-xs md:text-sm leading-relaxed text-slate-600 dark:text-white/70">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forensic AI Narrative Panel */}
      <ForensicNarrative
        narrative={aiExplanation}
        score={score}
        verdict={verdict}
        evidence={evidence}
        onOpenCopilot={onOpenCopilot}
        className="mt-6"
      />
    </motion.section>
  );
};
