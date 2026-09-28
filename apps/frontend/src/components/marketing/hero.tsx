'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, Github, Star, Zap, Shield, Code2, Sparkles,
  Brain, GitBranch, Lock, Activity, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { CanvasParticles } from '@/components/ui/canvas-particles';
import { FloatingOrb } from '@/components/ui/3d-effects';
import { TypingAnimation, ScrollReveal } from '@/components/ui/motion-primitives';
import { ScrambleHeading } from '@/components/ui/text-scramble';

/* ── Floating tech badge ── */
const TECH_BADGES = [
  { icon: Shield, label: 'Security', angle: 0, r: 200, delay: 0, color: 'text-danger' },
  { icon: Code2, label: 'TypeScript', angle: 72, r: 180, delay: 0.5, color: 'text-secondary' },
  { icon: Brain, label: 'Claude AI', angle: 144, r: 220, delay: 1, color: 'text-primary' },
  { icon: GitBranch, label: 'GitHub', angle: 216, r: 190, delay: 1.5, color: 'text-success' },
  { icon: Lock, label: 'RBAC', angle: 288, r: 175, delay: 2, color: 'text-warning' },
];

const STATS = [
  { value: 99, suffix: '%', label: 'Bug Detection', icon: Shield },
  { value: 60, prefix: '< ', suffix: 's', label: 'Avg Review Time', icon: Activity },
  { value: 12, suffix: '+', label: 'Languages', icon: Code2 },
  { value: 5, suffix: 'x', label: 'Faster Reviews', icon: Zap },
];

const TYPING_WORDS = [
  'bugs before they ship.',
  'security vulnerabilities.',
  'code quality issues.',
  'performance bottlenecks.',
  'dead code & tech debt.',
];

/* ── Data stream line ── */
function DataStreamLine({ delay, left }: { delay: number; left: string }) {
  return (
    <motion.div
      className="absolute top-0 w-px"
      style={{ left, height: '100%', background: 'linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.2), transparent)' }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 4 }}
    />
  );
}

/* ── Orbit badge ── */
function OrbitBadge({ icon: Icon, label, angle, r, delay, color }: typeof TECH_BADGES[0]) {
  const rad = (angle * Math.PI) / 180;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: Math.cos(rad) * r - 44,
        y: Math.sin(rad) * r - 20,
      }}
      transition={{ duration: 0.8, delay }}
    >
      <motion.div
        animate={{
          x: [0, Math.cos(rad) * 8, 0],
          y: [0, Math.sin(rad) * 8, 0],
        }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
        className="glass rounded-xl border border-border/60 px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium shadow-lg"
      >
        <Icon size={13} className={color} />
        {label}
      </motion.div>
    </motion.div>
  );
}

/* ── Main Hero ── */
export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const ySpring = useSpring(yParallax, { stiffness: 60, damping: 20 });

  const [githubStars] = useState('2.4k');

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden flex items-center">

      {/* ── Particle canvas ── */}
      <div className="absolute inset-0 z-0">
        <CanvasParticles count={100} connected speed={0.3} className="h-full" />
      </div>

      {/* ── Grid background (animated) ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-grid"
        style={{ animation: 'grid-flow 8s linear infinite', opacity: 0.6 }}
      />

      {/* ── Data stream lines ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {['8%', '23%', '41%', '57%', '69%', '82%', '94%'].map((l, i) => (
          <DataStreamLine key={l} left={l} delay={i * 0.8} />
        ))}
      </div>

      {/* ── Ambient orbs ── */}
      <motion.div style={{ y: ySpring }} className="pointer-events-none absolute inset-0 z-0">
        <FloatingOrb size={600} color="hsl(var(--primary) / 0.18)" delay={0} className="left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2" blur={100} />
        <FloatingOrb size={450} color="hsl(var(--secondary) / 0.14)" delay={2} className="right-1/4 top-1/3 translate-x-1/2 -translate-y-1/2" blur={90} />
        <FloatingOrb size={350} color="hsl(var(--accent) / 0.12)" delay={4} className="bottom-1/4 left-1/3" blur={80} />
      </motion.div>

      {/* ── Radial vignette ── */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -5%, hsl(var(--primary) / 0.1), transparent)' }} />

      {/* ── Scanline overlay ── */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, hsl(var(--background) / 0.02) 3px, hsl(var(--background) / 0.02) 4px)' }} />

      {/* ── Hero content ── */}
      <motion.div style={{ opacity, scale }} className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 text-center">

        {/* GitHub stars badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-3"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:text-foreground"
          >
            <Github size={15} />
            <span>Star on GitHub</span>
            <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-warning">
              <Star size={11} className="fill-warning" />
              {githubStars}
            </span>
          </a>
        </motion.div>

        {/* Platform badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <span className="badge-futuristic">
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
            AI Code Intelligence Platform — v2.0
          </span>
        </motion.div>

        {/* Headline — scramble decrypt on load */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-2"
        >
          <ScrambleHeading
            text="Ship code your"
            as="h1"
            trigger="mount"
            scrambleDuration={900}
            delay={300}
            className="block font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl"
          />
          <ScrambleHeading
            text="team can trust"
            as="h1"
            trigger="mount"
            scrambleDuration={1100}
            delay={700}
            gradient
            className="block font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
          />
        </motion.div>

        {/* Sub with typing effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          AI that automatically finds{' '}
          <span className="font-semibold gradient-brand-text">
            <TypingAnimation
              words={TYPING_WORDS}
              speed={60}
              pauseMs={2500}
            />
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-base font-bold text-white shadow-lg transition-shadow duration-300 hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)]"
            >
              {/* Gradient bg */}
              <span className="absolute inset-0 gradient-brand" />
              {/* Beam sweep */}
              <motion.span
                className="absolute inset-0 bg-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', skewX: '-15deg' }}
              />
              <span className="relative flex items-center gap-2">
                <Zap size={18} />
                Start for free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>

          {/* GitHub CTA */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-8 py-3.5 text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <Github size={18} />
              View on GitHub
              <Star size={14} className="ml-1 text-warning opacity-60 group-hover:opacity-100" />
            </a>
          </motion.div>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          No credit card · Free tier · GitHub OAuth · MIT License
        </motion.p>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="glass card-shine rounded-2xl p-4 text-center"
            >
              <div className="gradient-brand-text text-3xl font-bold font-display">
                {s.prefix ?? ''}{s.value}{s.suffix}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Code preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <motion.div
            whileHover={{ rotateX: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative rounded-2xl border border-border/60 overflow-hidden shadow-2xl"
          >
            {/* Animated border beam */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <motion.div
                className="absolute -inset-[1px] rounded-2xl"
                style={{ background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.6), transparent 60deg)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-[1px] rounded-2xl bg-card" />
            </div>

            {/* Window chrome */}
            <div className="relative z-20 flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-danger/80" />
                <span className="h-3 w-3 rounded-full bg-warning/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
                <span className="ml-3 text-xs text-muted-foreground font-mono-custom">codentra — AI Review · payment-service.ts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs text-success font-mono-custom">
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-success" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Findings */}
            <div className="relative z-20 space-y-2 p-4 text-left font-mono-custom text-xs bg-card/90 backdrop-blur-xl">
              {[
                { sev: 'CRITICAL', color: 'danger', msg: 'SQL injection — line 42', sub: 'Raw input in query string. Parameterize.', icon: '🚨' },
                { sev: 'HIGH', color: 'warning', msg: 'Race condition in payment lock — line 87', sub: 'Missing mutex on shared resource. Add distributed lock.', icon: '⚠️' },
                { sev: 'MEDIUM', color: 'primary', msg: '3 AI-suggested fixes ready to apply', sub: 'Quality score: 61 → 94 after applying.', icon: '✨' },
              ].map((f, i) => (
                <motion.div
                  key={f.msg}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.2 }}
                  className={`flex items-start gap-3 rounded-xl border border-${f.color}/20 bg-${f.color}/5 p-3`}
                >
                  <span className="text-base mt-0.5">{f.icon}</span>
                  <div>
                    <div className={`flex items-center gap-2 mb-1`}>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold bg-${f.color}/20 text-${f.color}`}>{f.sev}</span>
                      <span className={`text-${f.color} font-semibold text-xs`}>{f.msg}</span>
                    </div>
                    <div className="text-muted-foreground">{f.sub}</div>
                  </div>
                </motion.div>
              ))}

              {/* Scanner line */}
              <motion.div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
