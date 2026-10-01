import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ChevronDown, Check, Palette, Scissors } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface ThemeOption {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

// Extensible registry of themes: add any new theme here in the future
export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Dark Theme',
    subtitle: 'SOC Cyber Dark',
    icon: Moon,
    accentColor: '#00d9ff',
  },
  {
    id: 'light',
    name: 'White Theme',
    subtitle: 'Clean Retro Screen',
    icon: Sun,
    accentColor: '#059669',
  },
  {
    id: 'collageart',
    name: 'CollageArt',
    subtitle: 'Pop Cutout Mixed Media',
    icon: Scissors,
    accentColor: '#facc15',
  },
];

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close dropdown on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Theme Toggle Button On The Bar (Pure Toggle, No Text) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`theme-toggle inline-flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all duration-150 cursor-pointer select-none ${className}`}
        title={`Current Theme: ${activeOption.name}. Click to change theme`}
        aria-label="Select website theme"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
          <ActiveIcon className="w-4 h-4 transition-transform duration-200" />
        </div>

        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 opacity-60 ${
            isOpen ? 'rotate-180 text-cyan opacity-100' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Showing Themes To Select */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-cyan-500/30 dark:border-cyan-400/25 bg-white/95 dark:bg-[#0B121A]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_0_30px_rgba(0,217,255,0.15)] z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-150 text-left"
          role="listbox"
          aria-label="Available Themes"
        >
          {/* Header Title */}
          <div className="px-3 py-1.5 border-b border-slate-200 dark:border-white/10 mb-1 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-cyan/80 uppercase">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-cyan" />
              Select Theme
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              {THEME_OPTIONS.length} available
            </span>
          </div>

          {/* Theme Options List */}
          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              const OptionIcon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 dark:bg-cyan-400/20 text-slate-950 dark:text-white font-bold border border-cyan-500/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1 rounded-md flex items-center justify-center ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <OptionIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {opt.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-cyan-600 dark:text-cyan shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;

