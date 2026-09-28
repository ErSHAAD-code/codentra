'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Palette, X } from 'lucide-react';
import { useState } from 'react';

import { THEMES, useTheme, type CodentraTheme } from '@/components/providers/theme-provider';

const THEME_ICONS: Record<CodentraTheme, string> = {
  space: '🌌',
  neon: '💚',
  aurora: '🌸',
  cyber: '⚡',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        title="Switch theme"
      >
        <Palette size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 top-12 z-50 min-w-[220px] overflow-hidden rounded-2xl border border-border/80 glass-heavy p-2 shadow-2xl"
            >
              {/* Header */}
              <div className="mb-2 flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Monitor size={12} />
                  Theme
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>

              {/* Theme options */}
              <div className="space-y-1">
                {THEMES.map(t => (
                  <motion.button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setOpen(false); }}
                    whileHover={{ x: 4 }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      theme === t.id
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{THEME_ICONS[t.id]}</span>
                    <span className="font-medium">{t.label}</span>
                    {theme === t.id && (
                      <span className="ml-auto flex h-2 w-2 rounded-full" style={{ background: t.color }} />
                    )}
                    {/* Color swatch */}
                    <span
                      className="ml-auto h-5 w-5 rounded-full border border-border/50"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Active theme indicator */}
              <div className={`mt-2 rounded-xl p-2.5 bg-gradient-to-br ${THEMES.find(t => t.id === theme)?.bg ?? ''}`}>
                <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {THEME_ICONS[theme]} {theme.toUpperCase()} MODE ACTIVE
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
