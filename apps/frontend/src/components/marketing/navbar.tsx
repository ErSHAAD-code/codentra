'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ExternalLink,
  Github,
  Menu,
  Star,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LionLogo } from '@/components/ui/lion-logo';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { ScrollProgress } from '@/components/ui/motion-primitives';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection observer for active nav link
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.href.slice(1));
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveLink(`#${e.target.id}`);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <ScrollProgress />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-border/60 glass-heavy shadow-[0_1px_30px_hsl(var(--background)/0.8)]'
          : 'bg-transparent'
      }`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* ── Logo ── */}
          <Link href="/" className="group flex items-center gap-2.5">
            <LionLogo size={34} />
            <span className="font-display text-lg font-bold gradient-brand-text">Codentra</span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeLink === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeLink === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </a>
            ))}
          </div>

          {/* ── Right actions ── */}
          <div className="hidden items-center gap-2 md:flex">
            {/* GitHub button */}
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-foreground"
            >
              <Github size={15} />
              <span className="hidden lg:block">GitHub</span>
              <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-warning">
                <Star size={10} className="fill-warning" />
                2.4k
              </span>
            </motion.a>

            {/* Theme switcher */}
            <ThemeSwitcher />

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border/60" />

            {/* Sign in */}
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2"
            >
              Sign in
            </Link>

            {/* Get started */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/login"
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-bold text-white shadow-glow-sm transition-shadow hover:shadow-glow"
              >
                <span className="absolute inset-0 gradient-brand" />
                <motion.span
                  className="absolute inset-0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', skewX: '-15deg' }}
                />
                <span className="relative flex items-center gap-1.5">
                  <Zap size={14} />
                  Get started
                </span>
              </Link>
            </motion.div>
          </div>

          {/* ── Mobile toggle ── */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border/50 glass-heavy md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm font-medium"
                  >
                    <Github size={16} />
                    View on GitHub
                    <ExternalLink size={12} className="ml-auto text-muted-foreground" />
                  </a>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="relative overflow-hidden rounded-xl py-3 text-center text-sm font-bold text-white"
                  >
                    <span className="absolute inset-0 gradient-brand" />
                    <span className="relative">Get started free</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
