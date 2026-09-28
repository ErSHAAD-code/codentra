'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    question: 'What programming languages does Codentra support?',
    answer:
      'Python, JavaScript, TypeScript, Java, C, C++, Go, Rust, PHP, Kotlin, Swift, and Ruby — with more added over time. The AI review layer works on any language even if a dedicated parser is not yet available.',
  },
  {
    question: 'Does Codentra store or train on my source code?',
    answer:
      'Analysis runs on your code transiently. You control retention settings. Your code is never used to train shared or third-party models. All AI calls go through Anthropic\'s API with no data-training agreements.',
  },
  {
    question: 'Can I use Codentra without connecting GitHub?',
    answer:
      'Yes — you can upload a ZIP or individual files from the dashboard. GitHub integration is optional and only needed for automatic PR reviews and webhook-triggered scans.',
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes. The Free tier gives you one project, unlimited public repository scans, bug detection, security scanning, and the basic findings dashboard — no credit card required.',
  },
  {
    question: 'How accurate is the AI review?',
    answer:
      'In internal testing, Codentra catches over 99% of OWASP Top-10 vulnerability patterns and common logic bugs. AI suggestions are explainable — every finding includes severity, reasoning, and a concrete code fix.',
  },
  {
    question: 'How long does a review take?',
    answer:
      'Most reviews complete in under 60 seconds. Larger repositories (>10k LOC) typically finish within 2–3 minutes. Analysis runs asynchronously — you get notified when results are ready.',
  },
];

function FAQItem({ faq, index }: { faq: (typeof FAQS)[number]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      viewport={{ once: true }}
      className={`overflow-hidden rounded-xl border transition-all duration-300 ${open ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30'}`}
    >
      <button
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-sm sm:text-base">{faq.question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className={`shrink-0 ${open ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="border-t border-border/40 px-6 py-4 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="mx-auto max-w-3xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
            <HelpCircle size={14} />
            FAQ
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Common{' '}
            <span className="gradient-brand-text">questions</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* Items */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.question} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
