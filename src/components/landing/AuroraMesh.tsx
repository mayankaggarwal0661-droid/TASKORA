'use client';

import React, { useEffect, useRef } from 'react';

export function AuroraMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle nodes
    const particleCount = Math.min(width > 768 ? 40 : 20, 50);
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // Draw soft moving aurora meshes (layered radial gradients)
      const x1 = width * 0.3 + Math.sin(time) * 120;
      const y1 = height * 0.3 + Math.cos(time * 0.8) * 80;
      const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, width * 0.45);
      grad1.addColorStop(0, 'rgba(139, 92, 246, 0.16)');
      grad1.addColorStop(1, 'rgba(16, 17, 26, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const x2 = width * 0.7 + Math.cos(time * 0.9) * 140;
      const y2 = height * 0.6 + Math.sin(time * 1.1) * 90;
      const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, width * 0.5);
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      grad2.addColorStop(1, 'rgba(16, 17, 26, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      const x3 = width * 0.5 + Math.sin(time * 0.7) * 90;
      const y3 = height * 0.8 + Math.cos(time * 0.6) * 100;
      const grad3 = ctx.createRadialGradient(x3, y3, 10, x3, y3, width * 0.4);
      grad3.addColorStop(0, 'rgba(167, 139, 250, 0.1)');
      grad3.addColorStop(1, 'rgba(16, 17, 26, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // Draw floating constellation particles
      ctx.fillStyle = 'rgba(196, 181, 253, 0.4)';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`;
        ctx.fill();

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.95 }}
    />
  );
}
