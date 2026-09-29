import React, { useEffect, useState, useRef } from 'react';

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
  const [displayValue, setDisplayValue] = useState<number>(value);
  const startValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If reduced motion is requested, snap directly
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    const startVal = startValueRef.current;
    const diff = value - startVal;
    if (diff === 0) {
      setDisplayValue(value);
      return;
    }

    let animationFrameId: number;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out exponential curve
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + diff * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        startValueRef.current = value;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
      {prefix && <span className="select-none">{prefix}</span>}
      <span>{displayValue}</span>
      {suffix && <span className="select-none">{suffix}</span>}
    </span>
  );
};
