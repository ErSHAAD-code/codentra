'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; alpha: number;
  color: [number, number, number];
}

interface Props {
  count?: number;
  className?: string;
  connected?: boolean;
  speed?: number;
}

export function CanvasParticles({ count = 80, className = '', connected = true, speed = 0.4 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Read CSS variable for particle color
    const rootStyle = getComputedStyle(document.documentElement);
    const colorStr = rootStyle.getPropertyValue('--particle-color').trim() || '147,128,255';
    const colorParts = colorStr.split(',').map(s => parseInt(s.trim(), 10));
    const color: [number, number, number] = [colorParts[0] || 147, colorParts[1] || 128, colorParts[2] || 255];

    // Initialize particles
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      color,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      particles.current.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        p.vx = Math.min(Math.max(p.vx, -2), 2);
        p.vy = Math.min(Math.max(p.vy, -2), 2);
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
        ctx.fill();
      });

      if (connected) {
        // Optimize: skip sqrt unless necessary and batch drawing where possible
        ctx.lineWidth = 0.5;
        const maxDistSq = 130 * 130;
        
        particles.current.forEach((a, i) => {
          particles.current.slice(i + 1).forEach(b => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < maxDistSq) {
              const d = Math.sqrt(distSq);
              const alpha = (1 - d / 130) * 0.15;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${a.color[0]},${a.color[1]},${a.color[2]},${alpha})`;
              ctx.stroke();
            }
          });
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [count, connected, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
