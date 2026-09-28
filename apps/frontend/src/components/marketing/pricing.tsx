'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Star, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual developers trying Codentra out.',
    features: [
      '1 project',
      'Unlimited public repo scans',
      'Basic findings dashboard',
      'Bug & security detection',
      'AI fix suggestions',
    ],
    cta: 'Start free',
    href: '/login',
    highlighted: false,
    badge: null,
    gradient: 'from-muted/30 to-muted/10',
    border: 'border-border/60',
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For developers who ship often and need the full toolkit.',
    features: [
      'Unlimited projects',
      'Private repositories',
      'AI chat & repository Q&A',
      'Test & doc generation',
      'Priority analysis queue',
      'Architecture explainer',
      'Refactoring suggestions',
    ],
    cta: 'Start Pro trial',
    href: '/login',
    highlighted: true,
    badge: 'Most Popular',
    gradient: 'from-primary/15 via-primary/8 to-secondary/10',
    border: 'border-primary/40',
  },
  {
    name: 'Team',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams that review code together at scale.',
    features: [
      'Everything in Pro',
      'Team roles & permissions',
      'PR review automation',
      'Audit logs',
      'SSO / SAML',
      'Dedicated support',
    ],
    cta: 'Talk to us',
    href: '/login',
    highlighted: false,
    badge: null,
    gradient: 'from-accent/10 to-muted/10',
    border: 'border-accent/30',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <Star size={14} />
            Simple pricing
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Plans for every{' '}
            <span className="gradient-brand-text">team size</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when your team does. No hidden fees.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-center">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tier.gradient} ${tier.border} p-6 backdrop-blur-sm transition-all duration-300 ${tier.highlighted ? 'lg:scale-105 shadow-glow' : 'hover:-translate-y-1 hover:shadow-card-hover'}`}
            >
              {/* Popular badge */}
              {tier.badge && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                  <Zap size={11} />
                  {tier.badge}
                </div>
              )}

              {/* Tier header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`text-4xl font-bold ${tier.highlighted ? 'gradient-brand-text' : ''}`}>
                    {tier.price}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">/{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              {/* Divider */}
              <div className={`mb-6 h-px ${tier.highlighted ? 'bg-gradient-to-r from-primary/40 via-secondary/30 to-transparent' : 'bg-border/50'}`} />

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tier.highlighted ? 'bg-primary/20' : 'bg-success/10'}`}>
                      <Check size={12} className={tier.highlighted ? 'text-primary' : 'text-success'} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`mt-8 w-full rounded-xl font-semibold ${tier.highlighted ? 'gradient-brand text-white shadow-glow-sm hover:shadow-glow transition-shadow duration-300' : ''}`}
                variant={tier.highlighted ? undefined : 'outline'}
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          All plans include a 14-day Pro trial. No credit card required to start.
        </motion.p>
      </div>
    </section>
  );
}
