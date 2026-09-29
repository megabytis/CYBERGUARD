import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle inline-flex items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200 cursor-pointer ${className}`}
      title={isDark ? 'Switch to Retro Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Retro Theme' : 'Switch to Dark Theme'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 text-blue-700 hover:text-blue-800 transition-colors animate-in spin-in-90 duration-200" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium">
          {isDark ? 'Retro' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
