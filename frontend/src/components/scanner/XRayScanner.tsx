import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Cpu, ScanLine, TriangleAlert } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type { Segment, Stage } from './types';

type XRayScannerProps = {
  url: string;
  segments: Segment[];
  stages: Stage[];
  onComplete: () => void;
};

const stateStyles = {
  safe: {
    border: 'border-protected/60',
    text: 'text-protected',
    glow: 'shadow-[0_0_28px_rgba(0,255,157,0.25)]',
    icon: Check,
  },
  review: {
    border: 'border-suspicious/70',
    text: 'text-suspicious',
    glow: 'shadow-[0_0_28px_rgba(255,176,32,0.25)]',
    icon: TriangleAlert,
  },
  critical: {
    border: 'border-critical/80',
    text: 'text-critical',
    glow: 'shadow-[0_0_30px_rgba(255,70,90,0.3)]',
    icon: TriangleAlert,
  },
};

export const XRayScanner: React.FC<XRayScannerProps> = ({
  url,
  segments,
  stages,
  onComplete,
}) => {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(0);
  const [activeStage, setActiveStage] = useState(-1);
  const [settled, setSettled] = useState(false);
  const completeDelay = useMemo(() => (reduceMotion ? 80 : 350), [reduceMotion]);

  // Keep a stable ref to onComplete to prevent re-triggering the scan loop
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track the scanned URL to run exactly ONCE per URL scan
  const scannedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // If this URL was already scanned, retain settled state and do not loop!
    if (scannedUrlRef.current === url) {
      return;
    }
    scannedUrlRef.current = url;

    setVisible(0);
    setActiveStage(-1);
    setSettled(false);

    const timers = segments.map((_, index) =>
      window.setTimeout(() => setVisible(index + 1), (index + 1) * completeDelay)
    );
    const settleTimer = window.setTimeout(
      () => setSettled(true),
      (segments.length + 1) * completeDelay + 200
    );
    const stageTimers = stages.map((_, index) =>
      window.setTimeout(
        () => setActiveStage(index),
        (segments.length + 1) * completeDelay + 500 + index * 420
      )
    );
    const doneTimer = window.setTimeout(
      () => {
        onCompleteRef.current();
      },
      (segments.length + 1) * completeDelay + 500 + stages.length * 420 + 300
    );

    return () => {
      timers.forEach(window.clearTimeout);
      stageTimers.forEach(window.clearTimeout);
      window.clearTimeout(settleTimer);
      window.clearTimeout(doneTimer);
    };
  }, [url, segments, stages, completeDelay]);

  return (
    <GlassPanel className="p-6 md:p-8 rounded-[28px] border-border" aria-label="URL analysis">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[16px] font-extrabold tracking-[0.18em] text-white">
            <ScanLine size={18} aria-hidden="true" /> LIVE X-RAY SCAN
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-white">
            Dissecting the destination
          </h2>
        </div>
        <div className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-[16px] font-semibold text-white/80">
          {segments.length} signals found
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-4">
        <div className="relative flex min-w-[850px] gap-3 pt-3">
          <motion.div
            className="scan-beam"
            initial={{ left: '0%' }}
            animate={{ left: settled ? '100%' : ['0%', '100%'] }}
            transition={{
              duration: reduceMotion ? 0.1 : 2.2,
              ease: 'linear',
              repeat: settled ? 0 : 2,
            }}
            aria-hidden="true"
          />
          {segments.map((segment, index) => {
            const state = stateStyles[segment.state];
            const Icon = state.icon;
            return (
              <AnimatePresence key={`${segment.label}-${segment.value}-${index}`}>
                {index < visible && (
                  <motion.div
                    className="relative min-w-0 flex-1"
                    initial={{ opacity: 0, y: 18, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: reduceMotion ? 0.1 : 0.35 }}
                  >
                    <div
                      className={`segment-block ${
                        settled
                          ? `${state.border} ${state.glow}`
                          : 'border-white/70 shadow-[0_0_24px_rgba(255,255,255,0.14)]'
                      } ${state.text}`}
                    >
                      <span className="mb-2 block text-[16px] font-sans uppercase font-bold tracking-[0.18em] text-white/70">
                        {segment.label}
                      </span>
                      <span className="block truncate font-mono text-[clamp(1.4rem,2.5vw,2.1rem)] font-bold text-white">
                        {segment.value}
                      </span>
                      {settled && (
                        <Icon size={22} className="absolute right-3 top-3" aria-hidden="true" />
                      )}
                    </div>
                    <AnimatePresence>
                      {settled && segment.reason && (
                        <motion.p
                          className={`mt-3 min-h-[44px] text-[16px] font-semibold leading-snug ${state.text}`}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="sr-only">Reason: </span>
                          {segment.reason}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2 text-[16px] font-bold text-white/80">
          <Cpu size={18} className="text-white" aria-hidden="true" /> Analysis pipeline
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stages.map((stage, index) => {
            const done = index <= activeStage;
            const isAIStage = index === 3;
            return (
              <motion.div
                key={stage.label}
                className={`stage-chip ${isAIStage ? 'stage-chip-ai' : ''} ${
                  done ? 'stage-chip-active' : ''
                }`}
                initial={false}
                animate={{ opacity: done ? 1 : 0.7, y: done ? 0 : 3 }}
              >
                <span className="flex items-center gap-2 text-[16px] font-bold">
                  {done ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-white/40" aria-hidden="true" />
                  )}
                  {stage.label}
                </span>
                <span className="mt-1 block text-[16px] font-medium text-white/70">
                  {stage.detail}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
};
