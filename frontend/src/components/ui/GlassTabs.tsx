import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: 'md' | 'lg';
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-elevated/80 border border-border backdrop-blur-xl max-w-full overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2.5 px-4 rounded-xl font-medium transition-colors select-none z-10 whitespace-nowrap cursor-pointer',
              size === 'lg' ? 'h-12 text-base' : 'h-10 text-sm',
              isActive ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-surface-glass-active border border-border-bright rounded-xl shadow-glass z-[-1]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            {tab.icon && (
              <span className={cn('shrink-0', isActive ? 'text-information' : 'text-text-muted')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-mono rounded-full',
                  isActive ? 'bg-information/20 text-information' : 'bg-surface-glass text-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
