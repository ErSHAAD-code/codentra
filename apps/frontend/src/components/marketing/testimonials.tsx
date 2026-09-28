'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Codentra caught a race condition in our payment service that three senior reviewers missed in three separate code reviews. The AI explained exactly why it was dangerous and gave us a working fix.',
    author: 'Staff Engineer',
    role: 'FinTech Startup',
    avatar: 'SE',
    color: 'from-primary/20 to-primary/5',
    border: 'border-primary/20',
    stars: 5,
  },
  {
    quote:
      'The AI-generated tests actually cover the edge cases we usually forget — like empty arrays, null inputs, and timezone boundaries. It saved us hours every week.',
    author: 'Backend Lead',
    role: 'SaaS Platform',
    avatar: 'BL',
    color: 'from-secondary/20 to-secondary/5',
    border: 'border-secondary/20',
    stars: 5,
  },
  {
    quote:
      'Our PR review time dropped by half in the first month. Codentra flags the obvious stuff automatically so our senior devs can focus on architecture and design discussions.',
    author: 'Engineering Manager',
    role: 'Series B Startup',
    avatar: 'EM',
    color: 'from-accent/20 to-accent/5',
    border: 'border-accent/20',
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />

      <div className="mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">
            <Star size={14} />
            Customer stories
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Trusted by{' '}
            <span className="gradient-brand-text">engineering teams</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Developers and teams using Codentra ship better code, faster.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${t.color} ${t.border} p-6 card-shine transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}
            >
              {/* Quote icon */}
              <Quote size={28} className="mb-4 text-muted-foreground/30" />

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} size={14} className="fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 text-xs font-bold text-foreground">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
