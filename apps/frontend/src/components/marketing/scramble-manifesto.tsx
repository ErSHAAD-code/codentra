'use client';

import { motion } from 'framer-motion';
import { Terminal, Cpu, Code2 } from 'lucide-react';
import { ScrambleParagraph, ScrambleHeading } from '@/components/ui/text-scramble';
import { ScrollReveal } from '@/components/ui/motion-primitives';

/* ─────────────────────────────────────────────────
   The SCRAMBLE MANIFESTO section —
   A full-width dark block with the exact image style:
   monospace font + left-to-right character decryption
─────────────────────────────────────────────────── */
export function ScrambleManifesto() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background: pure near-black with grid */}
      <div className="pointer-events-none absolute inset-0 bg-background" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="mx-auto max-w-5xl relative z-10">

        {/* Header label */}
        <ScrollReveal>
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
              <Terminal size={16} className="text-primary" />
            </div>
            <span className="scramble-label">// manifesto.txt</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
        </ScrollReveal>

        {/* MAIN SCRAMBLE HEADING — large, bold, monospace */}
        <div className="mb-10">
          <ScrambleHeading
            text="The world is yearning for more"
            as="h2"
            trigger="inview"
            scrambleDuration={1200}
            delay={200}
            className="text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
          />
          <ScrambleHeading
            text="uncommon builders."
            as="h2"
            trigger="inview"
            scrambleDuration={1000}
            delay={600}
            gradient
            className="text-3xl font-bold leading-tight md:text-5xl lg:text-6xl"
          />
        </div>

        {/* SCRAMBLE PARAGRAPH — full paragraph decrypt, exact image style */}
        <div className="max-w-3xl space-y-6">
          <ScrambleParagraph
            text="To build the thing that people talk about for decades to come. The thing we couldn't even imagine and then couldn't live without. The thing the world needs."
            trigger="inview"
            scrambleDuration={1800}
            delay={400}
            className="text-xl font-medium leading-relaxed text-foreground/90 md:text-2xl"
          />

          <ScrambleParagraph
            text="Codentra is for the engineers who refuse to ship broken code. Who believe that quality is not optional. That security is not an afterthought. That the craft matters."
            trigger="inview"
            scrambleDuration={2000}
            delay={800}
            className="text-lg leading-relaxed text-muted-foreground md:text-xl"
          />
        </div>

        {/* Terminal-style stats block */}
        <ScrollReveal delay={0.6} direction="up">
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Terminal, label: '> scan --repo ./my-project', result: '12 issues found. 3 critical.', color: 'text-danger' },
              { icon: Cpu, label: '> ai fix --apply all', result: 'Quality score: 61 → 94. Done.', color: 'text-success' },
              { icon: Code2, label: '> generate --tests --docs', result: '47 tests generated. README updated.', color: 'text-primary' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="scramble-block group cursor-default"
              >
                {/* Terminal header */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-danger/60" />
                    <span className="h-2 w-2 rounded-full bg-warning/60" />
                    <span className="h-2 w-2 rounded-full bg-success/60" />
                  </div>
                  <span className="scramble-label ml-2">terminal</span>
                </div>

                {/* Command */}
                <p className="font-mono-custom text-xs text-muted-foreground">
                  <span className="text-primary/60">$</span>{' '}
                  <span className="text-foreground/70">{item.label}</span>
                </p>

                {/* Result */}
                <p className={`mt-2 font-mono-custom text-sm font-semibold scramble-text-glow ${item.color}`}>
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.2, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {item.result}
                  </motion.span>
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
