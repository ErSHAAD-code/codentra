'use client';

import { motion } from 'framer-motion';
import {
  Bot, Bug, FileText, GitPullRequest,
  MessageSquareDot, RefreshCw, ShieldCheck,
  Sparkles, TestTube, Workflow,
} from 'lucide-react';

import { TiltCard } from '@/components/ui/3d-effects';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import { FloatingOrb } from '@/components/ui/3d-effects';
import { ScrambleHeading } from '@/components/ui/text-scramble';

const FEATURES = [
  {
    icon: Bug,
    title: 'Bug Detection',
    description: 'Catches logic errors, null-reference risks, and dead code before they ship to production.',
    gradient: 'from-danger/20 via-danger/10 to-transparent',
    iconColor: 'text-danger',
    iconBg: 'bg-danger/15 border-danger/30',
    accent: 'hsl(var(--danger) / 0.3)',
    size: 'normal',
  },
  {
    icon: ShieldCheck,
    title: 'Security Scanning',
    description: 'Flags OWASP Top-10: SQL injection, XSS, hardcoded secrets, CSRF, and unsafe dependencies.',
    gradient: 'from-warning/20 via-warning/10 to-transparent',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/15 border-warning/30',
    accent: 'hsl(var(--warning) / 0.3)',
    size: 'normal',
  },
  {
    icon: Sparkles,
    title: 'AI Fix Suggestions',
    description: 'Every issue ships with a concrete, ready-to-apply fix — not just a warning. One click to apply.',
    gradient: 'from-primary/20 via-primary/10 to-transparent',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15 border-primary/30',
    accent: 'hsl(var(--primary) / 0.3)',
    size: 'large',
  },
  {
    icon: FileText,
    title: 'Auto Documentation',
    description: 'Generates READMEs, API docs, and inline JSDoc comments from your actual code structure.',
    gradient: 'from-secondary/20 via-secondary/10 to-transparent',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/15 border-secondary/30',
    accent: 'hsl(var(--secondary) / 0.3)',
    size: 'normal',
  },
  {
    icon: TestTube,
    title: 'Test Generation',
    description: 'Produces unit tests and edge cases for the functions that need them most — including null inputs and boundary conditions.',
    gradient: 'from-success/20 via-success/10 to-transparent',
    iconColor: 'text-success',
    iconBg: 'bg-success/15 border-success/30',
    accent: 'hsl(var(--success) / 0.3)',
    size: 'normal',
  },
  {
    icon: GitPullRequest,
    title: 'PR Review Automation',
    description: 'Reviews pull requests automatically on push, with approval or change-request recommendations.',
    gradient: 'from-accent/20 via-accent/10 to-transparent',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/15 border-accent/30',
    accent: 'hsl(var(--accent) / 0.3)',
    size: 'normal',
  },
  {
    icon: MessageSquareDot,
    title: 'Repository AI Chat',
    description: 'Ask anything about your codebase. "How does auth work?" or "Find all places X is called."',
    gradient: 'from-primary/20 via-secondary/10 to-transparent',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15 border-primary/30',
    accent: 'hsl(var(--primary) / 0.3)',
    size: 'large',
  },
  {
    icon: Workflow,
    title: 'Architecture Explainer',
    description: 'Generates visual flow diagrams, sequence charts, and architecture summaries from your code.',
    gradient: 'from-secondary/20 via-accent/10 to-transparent',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/15 border-secondary/30',
    accent: 'hsl(var(--secondary) / 0.3)',
    size: 'normal',
  },
  {
    icon: Bot,
    title: 'Debugging Assistant',
    description: 'Paste an error trace, get a root-cause explanation and ready-to-paste fix in seconds.',
    gradient: 'from-accent/20 via-primary/10 to-transparent',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/15 border-accent/30',
    accent: 'hsl(var(--accent) / 0.3)',
    size: 'normal',
  },
  {
    icon: RefreshCw,
    title: 'Refactoring Suggestions',
    description: 'Identifies code smells, overly complex functions, and duplicate logic with concrete simplification proposals.',
    gradient: 'from-warning/20 via-success/10 to-transparent',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/15 border-warning/30',
    accent: 'hsl(var(--warning) / 0.3)',
    size: 'normal',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-lg opacity-40" />
      <FloatingOrb size={600} color="hsl(var(--primary) / 0.06)" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" blur={140} />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center mb-16">
          <span className="badge-futuristic">
            <Sparkles size={12} />
            Full capability suite
          </span>
          <div className="mt-4 flex flex-col items-center justify-center space-y-1">
            <ScrambleHeading
              text="Ten ways Codentra"
              as="h2"
              trigger="inview"
              scrambleDuration={900}
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
            <ScrambleHeading
              text="levels up your code"
              as="h2"
              trigger="inview"
              scrambleDuration={1100}
              delay={400}
              gradient
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            From a single review to a full AI co-pilot for your entire codebase.
          </p>
        </ScrollReveal>

        {/* Feature grid — bento-style */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <ScrollReveal
              key={f.title}
              delay={i * 0.06}
              direction={i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'up'}
              className={f.size === 'large' ? 'lg:col-span-1 lg:row-span-1' : ''}
            >
              <TiltCard tiltStrength={10} glare className="h-full">
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`relative h-full overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${f.gradient} p-6 card-shine transition-all duration-300`}
                  style={{ '--glow': f.accent } as React.CSSProperties}
                >
                  {/* Animated corner beam */}
                  <motion.div
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    whileHover={{ opacity: 0.4 }}
                    style={{ background: f.accent }}
                  />

                  {/* Icon with pulse ring */}
                  <div className="relative mb-5 inline-flex">
                    <div className={`rounded-2xl border p-3 ${f.iconBg}`}>
                      <f.icon size={22} className={f.iconColor} />
                    </div>
                    <motion.div
                      className={`absolute inset-0 rounded-2xl border ${f.iconBg}`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
                    />
                  </div>

                  <h3 className="font-display font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>

                  {/* Status indicator */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                      className={`h-1.5 w-1.5 rounded-full ${f.iconColor.replace('text-', 'bg-')}`}
                    />
                    Active
                  </div>
                </motion.div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
