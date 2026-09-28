'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CodentraTheme = 'space' | 'neon' | 'aurora' | 'cyber';

interface ThemeCtx {
  theme: CodentraTheme;
  setTheme: (t: CodentraTheme) => void;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

const THEMES: { id: CodentraTheme; label: string; color: string; bg: string }[] = [
  { id: 'space',  label: 'Space',  color: '#7c6fff', bg: 'from-[#7c6fff]/20 to-[#38bdf8]/20' },
  { id: 'neon',   label: 'Neon',   color: '#4ade80', bg: 'from-[#4ade80]/20 to-[#2dd4bf]/20' },
  { id: 'aurora', label: 'Aurora', color: '#e879f9', bg: 'from-[#e879f9]/20 to-[#a78bfa]/20' },
  { id: 'cyber',  label: 'Cyber',  color: '#fbbf24', bg: 'from-[#fbbf24]/20 to-[#f97316]/20' },
];

export { THEMES };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<CodentraTheme>('space');

  useEffect(() => {
    const stored = localStorage.getItem('codentra-theme') as CodentraTheme | null;
    if (stored && THEMES.find(t => t.id === stored)) setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Keep legacy dark class for any components that rely on it
    document.documentElement.classList.add('dark');
  }, [theme]);

  const setTheme = (t: CodentraTheme) => {
    setThemeState(t);
    localStorage.setItem('codentra-theme', t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
