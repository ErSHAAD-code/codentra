'use client';

import { motion } from 'framer-motion';
import {
  Activity, Brain, Code2, Database, GitBranch,
  Globe, Layers, Lock, Server, Shield, Zap, Container,
  TestTube, Github,
} from 'lucide-react';
import { ScrollReveal, AnimatedCounter } from '@/components/ui/motion-primitives';
import { TiltCard, FloatingOrb } from '@/components/ui/3d-effects';
import { CanvasParticles } from '@/components/ui/canvas-particles';
import { ScrambleHeading } from '@/components/ui/text-scramble';

const TECH = [
  { icon: Globe, label: 'Next.js 15', sub: 'React 19 · App Router', color: 'text-foreground', glow: 'glow-sm' },
  { icon: Server, label: 'NestJS', sub: 'TypeScript · Decorators', color: 'text-danger', glow: '' },
  { icon: Brain, label: 'Claude AI', sub: 'Anthropic · Claude 3.5', color: 'text-primary', glow: 'glow-sm' },
  { icon: Database, label: 'PostgreSQL', sub: 'Prisma ORM · Migrations', color: 'text-secondary', glow: '' },
  { icon: Activity, label: 'Redis', sub: 'BullMQ · Job Queues', color: 'text-danger', glow: '' },
  { icon: Lock, label: 'Auth.js', sub: 'GitHub OAuth · Sessions', color: 'text-success', glow: '' },
  { icon: Container, label: 'Docker', sub: 'Multi-stage · Compose', color: 'text-secondary', glow: '' },
  { icon: Layers, label: 'Turborepo', sub: 'Monorepo · Caching', color: 'text-warning', glow: '' },
  { icon: GitBranch, label: 'GitHub Actions', sub: 'CI/CD · Approval gates', color: 'text-foreground', glow: '' },
  { icon: Shield, label: 'RBAC', sub: 'Roles · Invitations', color: 'text-accent', glow: '' },
  { icon: TestTube, label: 'Jest + Playwright', sub: 'Unit · E2E testing', color: 'text-success', glow: '' },
  { icon: Zap, label: 'Framer Motion', sub: 'Animations · 3D effects', color: 'text-primary', glow: 'glow-sm' },
];

const LIVE_STATS = [
  { end: 99, suffix: '%', label: 'Bug detection accuracy', icon: Shield, color: 'text-primary' },
  { end: 60, prefix: '<', suffix: 's', label: 'Average review time', icon: Activity, color: 'text-secondary' },
  { end: 12, suffix: '+', label: 'Languages supported', icon: Code2, color: 'text-accent' },
  { end: 5, suffix: 'x', label: 'Faster than manual review', icon: Zap, color: 'text-success' },
  { end: 94, suffix: '', label: 'Quality score after fixes', icon: Brain, color: 'text-warning' },
  { end: 10000, suffix: '+', label: 'Lines analyzed per minute', icon: Activity, color: 'text-danger' },
];

export function TechStack() {
  return (
    <section id="tech-stack" className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-circuit opacity-60" />
      <FloatingOrb size={500} color="hsl(var(--secondary) / 0.08)" className="right-0 top-1/2 -translate-y-1/2" blur={120} />

      <div className="mx-auto max-w-7xl relative z-10">

        {/* ── TECH STACK SECTION ── */}
        <ScrollReveal className="mx-auto max-w-2xl text-center mb-16">
          <span className="badge-futuristic">
            <Github size={12} />
            Production-grade stack
          </span>
          <div className="mt-4 flex flex-col items-center justify-center space-y-1">
            <ScrambleHeading
              text="Built with"
              as="h2"
              trigger="inview"
              scrambleDuration={900}
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
            <ScrambleHeading
              text="cutting-edge tech"
              as="h2"
              trigger="inview"
              scrambleDuration={1100}
              delay={400}
              gradient
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
          </div>
          <p className="mt-4 text-muted-foreground">
            Every layer of the stack is chosen for reliability, performance, and developer experience.
          </p>
        </ScrollReveal>

        {/* Tech grid */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {TECH.map((t, i) => (
            <ScrollReveal key={t.label} delay={i * 0.04} direction="scale">
              <TiltCard tiltStrength={8} glare>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass card-shine rounded-2xl border border-border/60 p-4 text-center h-full flex flex-col items-center gap-2"
                >
                  <div className={`rounded-xl border border-border/50 bg-muted/30 p-2.5 ${t.glow}`}>
                    <t.icon size={22} className={t.color} />
                  </div>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{t.sub}</p>
                </motion.div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* ── LIVE STATS SECTION ── */}
        <div className="mt-24">
          <ScrollReveal className="mx-auto max-w-2xl text-center mb-16">
            <span className="badge-futuristic">
              <Activity size={12} />
              Performance metrics
            </span>
            <div className="mt-4 flex flex-col items-center justify-center space-y-1">
              <ScrambleHeading
                text="Numbers that"
                as="h2"
                trigger="inview"
                scrambleDuration={900}
                className="font-display text-4xl font-bold tracking-tight md:text-5xl"
              />
              <ScrambleHeading
                text="speak for themselves"
                as="h2"
                trigger="inview"
                scrambleDuration={1100}
                delay={400}
                gradient
                className="font-display text-4xl font-bold tracking-tight md:text-5xl"
              />
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LIVE_STATS.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <TiltCard tiltStrength={6} glare className="h-full">
                  <div className="relative overflow-hidden rounded-2xl border border-border/60 glass p-6 card-shine holo-card h-full">
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-px pointer-events-none"
                      style={{ background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)` }}
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, repeatDelay: 2 }}
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-display text-5xl font-bold tracking-tight">
                          <AnimatedCounter
                            end={s.end}
                            prefix={s.prefix ?? ''}
                            suffix={s.suffix}
                            duration={2.5}
                            className="gradient-brand-text"
                          />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                      </div>
                      <div className={`rounded-xl border border-border/50 bg-muted/30 p-2.5`}>
                        <s.icon size={20} className={s.color} />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-1 w-full rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full gradient-brand"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(s.end, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
