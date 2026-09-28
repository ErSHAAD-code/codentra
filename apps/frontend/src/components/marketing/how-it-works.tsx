'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Github, Rocket, Sparkles, Upload, Zap } from 'lucide-react';

import { TiltCard, BorderBeam } from '@/components/ui/3d-effects';
import { ScrollReveal, ParallaxSection } from '@/components/ui/motion-primitives';
import { ScrambleHeading } from '@/components/ui/text-scramble';

const STEPS = [
  {
    number: '01',
    icon: Github,
    title: 'Connect your repo',
    description: 'Link a GitHub repository with one click or upload a ZIP file — no configuration needed.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    gradFrom: 'from-primary/20',
    detail: 'OAuth in 10 seconds',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI analysis runs',
    description: 'Static analysis and Claude AI review pipeline run in parallel, asynchronously in the background.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/30',
    gradFrom: 'from-secondary/20',
    detail: 'Results in < 60s',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Review findings',
    description: 'See bugs, security issues, and quality problems ranked by severity with 5 explainable quality scores.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    gradFrom: 'from-accent/20',
    detail: 'Severity ranked',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Apply & ship',
    description: 'Accept AI-suggested fixes, generate tests and docs on demand — then ship with confidence.',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    gradFrom: 'from-success/20',
    detail: '1-click apply',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, hsl(var(--primary) / 0.04), transparent)' }} />
      <div className="pointer-events-none absolute inset-0 bg-grid-sm opacity-40" />

      <div className="mx-auto max-w-6xl relative z-10">

        {/* Header */}
        <ScrollReveal className="mx-auto max-w-2xl text-center mb-16">
          <span className="badge-futuristic">
            <Upload size={12} />
            Simple workflow
          </span>
          <div className="mt-4 flex flex-col items-center justify-center space-y-1">
            <ScrambleHeading
              text="Code to confidence"
              as="h2"
              trigger="inview"
              scrambleDuration={900}
              gradient
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
            <ScrambleHeading
              text="in 4 steps"
              as="h2"
              trigger="inview"
              scrambleDuration={1100}
              delay={400}
              className="font-display text-4xl font-bold tracking-tight md:text-5xl"
            />
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect once, review forever. No DevOps setup, no config files — just results.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.1} direction="up">
              <TiltCard tiltStrength={8} glare className="h-full">
                <div className={`relative h-full overflow-hidden rounded-2xl border ${step.border} bg-gradient-to-b ${step.gradFrom} to-transparent p-6`}>
                  {/* Animated border beam on first card */}
                  {i === 0 && <BorderBeam size={150} duration={5} />}

                  {/* Card content — z-10 so it renders above BorderBeam's inner mask */}
                  <div className="relative z-10">
                    {/* Number + icon row */}
                    <div className="mb-5 flex items-center justify-between">
                      <span className={`font-mono-custom text-4xl font-bold opacity-10 ${step.color}`}>
                        {step.number}
                      </span>
                      <div className={`rounded-xl ${step.bg} border ${step.border} p-2.5`}>
                        <step.icon size={20} className={step.color} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-display font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                    {/* Detail badge */}
                    <div className={`mt-5 inline-flex items-center gap-1.5 rounded-full ${step.bg} border ${step.border} px-3 py-1 text-xs font-semibold ${step.color}`}>
                      <CheckCircle2 size={12} />
                      {step.detail}
                    </div>
                  </div>

                  {/* Vertical connector (not on last) */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                      <motion.div
                        className={`h-px w-6 ${step.color}`}
                        style={{ background: `linear-gradient(to right, currentColor, transparent)` }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                      />
                    </div>
                  )}
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Centered connecting line decoration for desktop */}
        <ParallaxSection speed={0.2} className="mt-16 hidden lg:block">
          <div className="relative flex items-center justify-center">
            <div className="h-px w-3/4 bg-gradient-to-r from-transparent via-border to-transparent" />
            <motion.div
              className="absolute h-2 w-2 rounded-full bg-primary shadow-glow-sm"
              animate={{ x: ['-200px', '200px', '-200px'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </ParallaxSection>
      </div>
    </section>
  );
}
