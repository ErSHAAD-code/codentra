'use client';

/* ─────────────────────────────────────────────
   TiltCard — 3D perspective tilt on mouse hover
   Uses Framer Motion's useMotionValue + useTransform
───────────────────────────────────────────────── */
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type ReactNode, useRef } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glare?: boolean;
  depth?: number;
}

export function TiltCard({ children, className = '', tiltStrength = 12, glare = true, depth = 800 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]), springConfig);

  // Glare position
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: depth, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full"
      >
        {children}

        {/* Glare overlay */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
            style={{ opacity: glareOpacity }}
          >
            <motion.div
              className="absolute h-40 w-40 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: glareX,
                top: glareY,
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FloatingOrb — 3D animated floating sphere
───────────────────────────────────────────────── */
interface OrbProps {
  size?: number;
  color?: string;
  delay?: number;
  className?: string;
  blur?: number;
}

export function FloatingOrb({ size = 300, color = 'hsl(var(--primary) / 0.25)', delay = 0, className = '', blur = 80 }: OrbProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        willChange: 'transform',
      }}
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 20, -10, 0],
        y: [0, -20, 10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   BorderBeam — animated conic gradient border
───────────────────────────────────────────────── */
interface BeamProps {
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export function BorderBeam({
  size = 200,
  duration = 8,
  colorFrom = 'hsl(var(--primary))',
  colorTo = 'hsl(var(--secondary))',
  className = '',
}: BeamProps) {
  return (
    <div
      className={`absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      <motion.div
        className="absolute -inset-px rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 60deg, ${colorTo} 120deg, transparent 180deg)`,
          backgroundSize: `${size}px ${size}px`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      />
      {/* Mask inner area */}
      <div className="absolute inset-[1px] rounded-[inherit] bg-card" />
    </div>
  );
}
