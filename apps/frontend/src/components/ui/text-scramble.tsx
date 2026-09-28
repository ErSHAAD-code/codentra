'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════
   CHARACTER SETS for the scramble effect
   (matches the "corrupted pixel" look in the image)
═══════════════════════════════════════════════════ */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:<>?/\\~';
const FAST_CHARS = '▓▒░█▄▀■□▪▫◆◇○●'; // "block/pixel" chars for extra corruption feel

function randomChar(fast = false): string {
  const set = fast ? FAST_CHARS + SCRAMBLE_CHARS : SCRAMBLE_CHARS;
  return set[Math.floor(Math.random() * set.length)] ?? '?';
}

/* ═══════════════════════════════════════════════════
   TextScramble — THE main component matching the image
   
   Props:
   - text: the final text to reveal
   - trigger: 'inview' | 'mount' | 'hover' | 'always'
   - speed: ms per frame (lower = faster)
   - delay: ms before starting
   - revealMode: 'left-to-right' | 'random' | 'all-at-once'
   - className: CSS classes
   - mono: whether to force monospace font
   - scrambleDuration: how long each char stays scrambled (ms)
═══════════════════════════════════════════════════ */
interface TextScrambleProps {
  text: string;
  trigger?: 'inview' | 'mount' | 'hover' | 'always';
  speed?: number;
  delay?: number;
  revealMode?: 'left-to-right' | 'random' | 'all-at-once';
  className?: string;
  mono?: boolean;
  scrambleDuration?: number;
  once?: boolean;
}

export function TextScramble({
  text,
  trigger = 'inview',
  speed = 40,
  delay = 0,
  revealMode = 'left-to-right',
  className = '',
  mono = true,
  scrambleDuration = 800,
  once = true,
}: TextScrambleProps) {
  const [displayed, setDisplayed] = useState<string[]>(() => text.split('').map(() => ' '));
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRun = useRef(false);

  const runScramble = useCallback(() => {
    if (hasRun.current && once) return;
    hasRun.current = true;
    setDone(false);

    const chars = text.split('');
    const total = chars.length;
    const revealed = new Array(total).fill(false);
    const startTime = Date.now();

    // Assign reveal time for each character
    const revealTimes: number[] = chars.map((_, i) => {
      if (chars[i] === ' ') return 0; // spaces reveal immediately
      if (revealMode === 'left-to-right') {
        return (i / total) * scrambleDuration + Math.random() * 120;
      } else if (revealMode === 'random') {
        return Math.random() * scrambleDuration;
      } else {
        return scrambleDuration;
      }
    });

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const next = chars.map((char, i) => {
        if (char === ' ') return ' ';
        if (char === '\n') return '\n';
        if (elapsed >= revealTimes[i]!) {
          revealed[i] = true;
          return char;
        }
        // Scramble: use block chars when near reveal time for extra pixel effect
        const nearReveal = elapsed > revealTimes[i]! - 150;
        return randomChar(nearReveal);
      });

      setDisplayed(next);

      if (revealed.every(Boolean)) {
        setDone(true);
        setDisplayed(chars);
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    timerRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(frame);
    }, delay);
  }, [text, delay, revealMode, scrambleDuration, once]);

  // Trigger: inview
  useEffect(() => {
    if (trigger !== 'inview') return;
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setStarted(true);
          runScramble();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, runScramble, started]);

  // Trigger: mount
  useEffect(() => {
    if (trigger !== 'mount') return;
    runScramble();
  }, [trigger, runScramble]);

  // Trigger: always (loops)
  useEffect(() => {
    if (trigger !== 'always') return;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      hasRun.current = false;
      runScramble();
      setTimeout(loop, scrambleDuration + delay + 2000);
    };
    loop();
    return () => { stopped = true; };
  }, [trigger, runScramble, scrambleDuration, delay]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (trigger !== 'hover') return;
    hasRun.current = false;
    runScramble();
  }, [trigger, runScramble]);

  const baseFont = mono
    ? 'font-mono-custom tracking-tight'
    : '';

  return (
    <span
      ref={containerRef}
      className={`inline whitespace-pre-wrap break-words ${baseFont} ${className}`}
      onMouseEnter={handleMouseEnter}
      aria-label={text}
    >
      {displayed.map((char, i) => {
        const isCorrect = char === text[i] || text[i] === ' ';
        return (
          <span
            key={i}
            className={`inline transition-none ${
              !isCorrect && !done
                ? 'text-primary/60'  // corrupted chars get accent color
                : ''
            }`}
            style={{
              // Pixel-corrupt look: slightly offset wrong characters
              ...((!isCorrect && !done) ? {
                filter: 'blur(0.3px)',
                opacity: 0.7 + ((i * 17) % 30) / 100,
              } : {}),
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   ScrambleParagraph — multi-line scramble
   (like the image: full paragraph that decrypts)
═══════════════════════════════════════════════════ */
interface ScrambleParagraphProps {
  text: string;
  trigger?: 'inview' | 'mount' | 'hover';
  speed?: number;
  delay?: number;
  className?: string;
  scrambleDuration?: number;
  once?: boolean;
}

export function ScrambleParagraph({
  text,
  trigger = 'inview',
  speed = 30,
  delay = 0,
  className = '',
  scrambleDuration = 1400,
  once = true,
}: ScrambleParagraphProps) {
  const [displayed, setDisplayed] = useState<string[]>(() =>
    text.split('').map((c, i) => (c === ' ' ? ' ' : FAST_CHARS[i % FAST_CHARS.length] ?? '?'))
  );
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const rafRef = useRef<number>(0);
  const hasRun = useRef(false);

  const runScramble = useCallback(() => {
    if (hasRun.current && once) return;
    hasRun.current = true;

    const chars = text.split('');
    const total = chars.length;
    const startTime = Date.now() + delay;

    // Each char gets a unique reveal time — left-to-right with slight randomness
    const revealTimes: number[] = chars.map((c, i) => {
      if (c === ' ') return 0;
      const base = (i / total) * scrambleDuration;
      const jitter = Math.random() * 180 - 90;
      return Math.max(50, base + jitter);
    });

    const frame = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      const next = chars.map((char, i) => {
        if (char === ' ') return ' ';
        if (elapsed >= revealTimes[i]!) return char;
        const nearReveal = elapsed > revealTimes[i]! - 200;
        return randomChar(nearReveal && Math.random() > 0.5);
      });

      setDisplayed(next);

      const allDone = chars.every((c, i) =>
        c === ' ' || (Date.now() - startTime) >= revealTimes[i]!
      );
      if (!allDone) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setDisplayed(chars);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [text, delay, scrambleDuration, once]);

  useEffect(() => {
    if (trigger !== 'inview') return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          setStarted(true);
          runScramble();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, runScramble, started]);

  useEffect(() => {
    if (trigger === 'mount') runScramble();
  }, [trigger, runScramble]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <p
      ref={containerRef}
      className={`font-mono-custom leading-relaxed whitespace-pre-wrap break-words ${className}`}
      aria-label={text}
    >
      {displayed.map((char, i) => {
        const isCorrect = char === text[i] || text[i] === ' ';
        return (
          <span
            key={i}
            className={`${!isCorrect ? 'text-primary/50' : ''}`}
            style={!isCorrect ? { filter: 'blur(0.4px)' } : undefined}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
}

/* ═══════════════════════════════════════════════════
   ScrambleHeading — large display heading scramble
   (matches the image exactly — bold monospace)
═══════════════════════════════════════════════════ */
interface ScrambleHeadingProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  trigger?: 'inview' | 'mount' | 'hover' | 'always';
  delay?: number;
  scrambleDuration?: number;
  gradient?: boolean;
}

export function ScrambleHeading({
  text,
  as: Tag = 'h2',
  className = '',
  trigger = 'inview',
  delay = 0,
  scrambleDuration = 1000,
  gradient = false,
}: ScrambleHeadingProps) {
  const [displayed, setDisplayed] = useState<string[]>(() =>
    text.split('').map((c, i) => (c === ' ' ? ' ' : SCRAMBLE_CHARS[i % SCRAMBLE_CHARS.length] ?? '?'))
  );
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const rafRef = useRef<number>(0);
  const hasRun = useRef(false);

  const runScramble = useCallback(() => {
    if (hasRun.current) {
      if (trigger !== 'always' && trigger !== 'hover') return;
    }
    hasRun.current = true;
    setDone(false);

    const chars = text.split('');
    const total = chars.length;
    const startTime = Date.now() + delay;

    const revealTimes: number[] = chars.map((c, i) => {
      if (c === ' ') return 0;
      const base = (i / total) * scrambleDuration;
      const jitter = Math.random() * 100 - 50;
      return Math.max(30, base + jitter);
    });

    const frame = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) { rafRef.current = requestAnimationFrame(frame); return; }

      let allRevealed = true;
      const next = chars.map((char, i) => {
        if (char === ' ') return ' ';
        if (elapsed >= revealTimes[i]!) return char;
        allRevealed = false;
        return randomChar(Math.random() > 0.6);
      });

      setDisplayed(next);

      if (!allRevealed) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setDisplayed(chars);
        setDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [text, delay, scrambleDuration, trigger]);

  useEffect(() => {
    if (trigger !== 'inview') return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) { setStarted(true); runScramble(); }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, runScramble, started]);

  useEffect(() => {
    if (trigger === 'mount') runScramble();
  }, [trigger, runScramble]);

  useEffect(() => {
    if (trigger !== 'always') return;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      hasRun.current = false;
      runScramble();
      setTimeout(loop, scrambleDuration + delay + 3500);
    };
    loop();
    return () => { stopped = true; };
  }, [trigger, runScramble, scrambleDuration, delay]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`font-mono-custom whitespace-pre-wrap break-words ${className}`}
      onMouseEnter={() => { if (trigger === 'hover') { hasRun.current = false; runScramble(); } }}
      aria-label={text}
    >
      {displayed.map((char, i) => {
        const isCorrect = done || char === text[i] || text[i] === ' ';
        const isSpace = text[i] === ' ';

        if (isSpace) return <span key={i}> </span>;

        return (
          <span
            key={i}
            className={`inline transition-none ${
              !isCorrect
                ? 'text-primary/40'
                : gradient
                ? 'gradient-brand-text'
                : ''
            }`}
            style={!isCorrect ? { filter: 'blur(0.5px)', opacity: 0.5 + ((i * 13) % 50) / 100 } : undefined}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
