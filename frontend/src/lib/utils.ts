import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getRiskVariant(score: number): {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
} {
  if (score <= 30) {
    return {
      level: 'LOW',
      label: 'PROTECTED / LOW RISK',
      color: '#00FF9D',
      badgeBg: 'bg-protected-subtle',
      badgeBorder: 'border-protected/40',
      textColor: 'text-protected',
    };
  } else if (score <= 70) {
    return {
      level: 'MEDIUM',
      label: 'SUSPICIOUS / ELEVATED RISK',
      color: '#FFBF3F',
      badgeBg: 'bg-suspicious-subtle',
      badgeBorder: 'border-suspicious/40',
      textColor: 'text-suspicious',
    };
  } else {
    return {
      level: 'HIGH',
      label: 'CRITICAL / HIGH RISK',
      color: '#FF4D6D',
      badgeBg: 'bg-critical-subtle',
      badgeBorder: 'border-critical/40',
      textColor: 'text-critical',
    };
  }
}
