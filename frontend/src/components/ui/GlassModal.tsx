import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassButton } from './GlassButton';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full glass-panel-elevated p-6 sm:p-8 rounded-2xl z-10 my-8 shadow-2xl border border-border-bright',
              maxWClasses
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                {title && (
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-text-secondary mt-1">{description}</p>
                )}
              </div>
              <GlassButton
                variant="icon"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </GlassButton>
            </div>

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export interface GlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  side?: 'right' | 'left';
}

export const GlassDrawer: React.FC<GlassDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
  side = 'right',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[width];

  const initialX = side === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div
            className={cn(
              'fixed inset-y-0 flex max-w-full',
              side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
            )}
          >
            <motion.div
              initial={{ x: initialX }}
              animate={{ x: 0 }}
              exit={{ x: initialX }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className={cn(
                'w-screen glass-panel-elevated h-full flex flex-col shadow-2xl border-l border-border-bright p-6 overflow-hidden',
                widthClasses
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div>
                  {title && (
                    <h2 className="text-xl font-bold font-display text-text-primary">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
                  )}
                </div>
                <GlassButton
                  variant="icon"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </GlassButton>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto py-5 pr-1">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
