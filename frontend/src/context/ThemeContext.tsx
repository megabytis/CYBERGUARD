import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | string;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cyberguard_theme') as Theme;
      if (saved) return saved;
    }
    return 'dark'; // Strictly default to dark theme as before
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'collageart');
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === 'collageart') {
      root.classList.add('dark', 'collageart');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('cyberguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
