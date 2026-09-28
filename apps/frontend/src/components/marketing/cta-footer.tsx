'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Github, Rocket, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

import { CanvasParticles } from '@/components/ui/canvas-particles';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import { FloatingOrb } from '@/components/ui/3d-effects';
import { LionLogo } from '@/components/ui/lion-logo';

export function CTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Particle background inside CTA */}
      <div className="pointer-events-none absolute inset-0">
        <CanvasParticles count={40} connected={false} speed={0.2} className="h-full opacity-50" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        <ScrollReveal>
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Rotating conic border */}
            <div className="absolute -inset-[1px] rounded-3xl z-0">
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ background: 'conic-gradient(from 0deg, var(--grad-1), var(--grad-2), var(--grad-3), var(--grad-1))' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="absolute inset-[1px] rounded-3xl bg-card z-0" />

            {/* Inner content */}
            <div className="relative z-10 px-8 py-16 text-center sm:px-16">
              {/* Inner glow orbs */}
              <FloatingOrb size={300} color="hsl(var(--primary) / 0.12)" className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" blur={80} />
              <FloatingOrb size={250} color="hsl(var(--secondary) / 0.10)" className="right-0 bottom-0 translate-x-1/2 translate-y-1/2" blur={70} delay={2} />

              {/* Icon */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow"
                style={{ background: 'var(--gradient-brand, linear-gradient(135deg, var(--grad-1), var(--grad-3)))' }}
              >
                <span className="absolute inset-0 rounded-2xl gradient-brand" />
                <Rocket size={28} className="relative text-white" />
              </motion.div>

              {/* Star rating row */}
              <div className="mb-4 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <Star size={16} className="fill-warning text-warning" />
                  </motion.div>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">Loved by engineers</span>
              </div>

              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                Start reviewing code{' '}
                <span className="gradient-brand-text">the smart way</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Free to start. No credit card required. Your first AI code review in under 60 seconds.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/login"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-base font-bold text-white shadow-glow transition-shadow hover:shadow-lg"
                  >
                    <span className="absolute inset-0 gradient-brand" />
                    <motion.span
                      className="absolute inset-0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', skewX: '-15deg' }}
                    />
                    <span className="relative flex items-center gap-2">
                      <Sparkles size={18} />
                      Get started free
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-8 py-3.5 text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Github size={18} />
                    Star on GitHub
                    <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-warning">
                      <Star size={11} className="fill-warning" />
                      2.4k
                    </span>
                  </a>
                </motion.div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                MIT License · No vendor lock-in · Self-hostable
              </p>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  const LINKS = [
    { group: 'Product', items: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Tech Stack', href: '#tech-stack' },
    ]},
    { group: 'Resources', items: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ]},
    { group: 'Company', items: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '#' },
      { label: 'GitHub', href: 'https://github.com' },
    ]},
  ];

  return (
    <footer className="relative border-t border-border/50 px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Top row */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <LionLogo size={34} />
              <span className="font-display text-lg font-bold gradient-brand-text">Codentra</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              AI-powered code intelligence that finds bugs, security vulnerabilities, and quality issues before they ship.
            </p>
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              <Github size={14} />
              Star on GitHub
              <span className="flex items-center gap-1 text-warning">
                <Star size={10} className="fill-warning" />
                2.4k
              </span>
            </a>
          </div>

          {/* Link groups */}
          {LINKS.map(group => (
            <div key={group.group}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{group.group}</h4>
              <ul className="space-y-2.5">
                {group.items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:gradient-brand-text">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {year} Codentra. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Built with</span>
            <span className="gradient-brand-text text-xs font-semibold">ErSHAAD</span>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>❤️</motion.span>
          </div>
        </div>
      </div>
    </footer>
  );
}
