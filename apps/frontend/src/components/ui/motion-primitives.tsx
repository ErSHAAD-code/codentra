'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   ScrollProgress — top bar progress indicator
───────────────────────────────────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--grad-1), var(--grad-2), var(--grad-3))',
        boxShadow: '0 0 8px var(--glow-primary)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   ScrollReveal — 3D scroll entrance effect
───────────────────────────────────────────────── */
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
  className?: string;
  once?: boolean;
}

const dirMap = {
  up:     { y: 50, x: 0, rotate: 0, scale: 1 },
  down:   { y: -50, x: 0, rotate: 0, scale: 1 },
  left:   { x: -60, y: 0, rotate: 0, scale: 1 },
  right:  { x: 60, y: 0, rotate: 0, scale: 1 },
  scale:  { scale: 0.8, y: 0, x: 0, rotate: 0 },
  rotate: { rotate: -10, y: 30, x: 0, scale: 0.95 },
};

export function ScrollReveal({ children, delay = 0, direction = 'up', className = '', once = true }: RevealProps) {
  const initial = { opacity: 0, ...dirMap[direction] };
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   ParallaxSection — 3D depth parallax on scroll
───────────────────────────────────────────────── */
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.3, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed * 10, 50 * speed * 10]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CountUp — animated number counter
───────────────────────────────────────────────── */
interface CountProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '', decimals = 0, className = '' }: CountProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const totalFrames = Math.round(duration * 60);
    const step = end / totalFrames;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   TypingAnimation — typewriter effect
───────────────────────────────────────────────── */
interface TypingProps {
  words: string[];
  speed?: number;
  pauseMs?: number;
  className?: string;
}

export function TypingAnimation({ words, speed = 100, pauseMs = 2000, className = '' }: TypingProps) {
  const [display, setDisplay] = useState('');
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wIdx] ?? '';
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), pauseMs);
        }
      } else {
        if (charIdx > 0) {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setWIdx(i => (i + 1) % words.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wIdx, words, speed, pauseMs]);

  return (
    <span className={className}>
      {display}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-0.5 inline-block h-[1em] w-[2px] align-middle bg-current"
      />
    </span>
  );
}

/* ─────────────────────────────────────────────
   TextShimmer — motion-primitives style shimmer
───────────────────────────────────────────────── */
interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function TextShimmer({ children, className = '', duration = 2.5 }: ShimmerProps) {
  return (
    <span
      className={`inline-block bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--foreground)) 40%, hsl(var(--primary)) 60%, hsl(var(--muted-foreground)) 100%)',
        animation: `text-shimmer ${duration}s linear infinite`,
      }}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   GlitchText — cyberpunk glitch text effect
───────────────────────────────────────────────── */
export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} data-text={text}>
      {text}
      <span
        className="absolute inset-0 text-primary opacity-80"
        style={{
          clipPath: 'inset(0 0 100% 0)',
          animation: 'glitch-1 4s steps(1) infinite',
        }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}
