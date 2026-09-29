import React, { useEffect, useRef } from 'react';
import { createRollingNumber, RollingNumberController } from '@kitlangton/rolling-number';

interface RollingNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  duration = 600,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const controllerRef = useRef<RollingNumberController | null>(null);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!controllerRef.current) {
      try {
        // Clear any initial content so createRollingNumber doesn't duplicate digits
        containerRef.current.innerHTML = '';
        controllerRef.current = createRollingNumber(containerRef.current, {
          value,
          duration: prefersReducedMotion ? 0 : duration,
        });
      } catch (err) {
        console.warn('RollingNumber init fallback:', err);
        if (containerRef.current) {
          containerRef.current.textContent = String(value);
        }
      }
    } else {
      if (prevValueRef.current !== value) {
        try {
          controllerRef.current.update({
            value,
            duration: prefersReducedMotion ? 0 : duration,
          });
        } catch {
          if (containerRef.current) {
            containerRef.current.textContent = String(value);
          }
        }
      }
    }
    prevValueRef.current = value;

    return () => {
      // Cleanup on unmount
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        controllerRef.current = null;
      }
    };
  }, [value, duration]);

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span ref={containerRef} />
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
