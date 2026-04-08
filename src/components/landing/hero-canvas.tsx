"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  isHub: boolean;
  pulsePhase: number;
  color: string;
}

interface DataPacket {
  fromIdx: number;
  toIdx: number;
  t: number;
  speed: number;
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;
    const particles: Particle[] = [];
    const packets: DataPacket[] = [];
    const PARTICLE_COUNT = 110;
    const HUB_COUNT = 7;
    const CONNECTION_DISTANCE = 155;
    let scanBeamY = 0;

    const colorPalette = [
      "96,165,250",   // blue-400
      "103,232,249",  // cyan-300
      "167,139,250",  // violet-400
      "52,211,153",   // emerald-400
    ];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      if (!canvas) return;
      particles.length = 0;
      packets.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isHub = i < HUB_COUNT;
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isHub ? 0.25 : 0.55),
          vy: (Math.random() - 0.5) * (isHub ? 0.25 : 0.55),
          radius: isHub ? Math.random() * 3 + 4 : Math.random() * 1.8 + 0.6,
          opacity: isHub ? 0.9 : Math.random() * 0.45 + 0.2,
          isHub,
          pulsePhase: Math.random() * Math.PI * 2,
          color,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Scanning beam
      scanBeamY = (scanBeamY + 0.35) % canvas.height;
      const beamGrad = ctx.createLinearGradient(0, scanBeamY - 80, 0, scanBeamY + 80);
      beamGrad.addColorStop(0, "rgba(96,165,250,0)");
      beamGrad.addColorStop(0.45, "rgba(96,165,250,0.025)");
      beamGrad.addColorStop(0.5, "rgba(96,165,250,0.06)");
      beamGrad.addColorStop(0.55, "rgba(96,165,250,0.025)");
      beamGrad.addColorStop(1, "rgba(96,165,250,0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, scanBeamY - 80, canvas.width, 160);
      ctx.beginPath();
      ctx.moveTo(0, scanBeamY);
      ctx.lineTo(canvas.width, scanBeamY);
      ctx.strokeStyle = "rgba(96,165,250,0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Particles
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          p.vx += dx * 0.00018;
          p.vy += dy * 0.00018;
        }
        const maxV = p.isHub ? 0.7 : 1.4;
        p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
        p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.pulsePhase += 0.018;

        if (p.isHub) {
          const pulseR = p.radius * (1 + Math.sin(p.pulsePhase) * 0.35);
          // Outer glow
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * 7);
          glow.addColorStop(0, `rgba(${p.color},0.25)`);
          glow.addColorStop(0.4, `rgba(${p.color},0.08)`);
          glow.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR * 7, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
          // Outer ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color},${0.12 + Math.sin(p.pulsePhase) * 0.06})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // Inner ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR * 1.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color},${0.2 + Math.sin(p.pulsePhase) * 0.1})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},0.95)`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        }
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const base = (1 - dist / CONNECTION_DISTANCE);
            const alpha = base * (a.isHub || b.isHub ? 0.4 : 0.18);
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(${a.color},${alpha})`);
            grad.addColorStop(1, `rgba(${b.color},${alpha})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = a.isHub || b.isHub ? 1.1 : 0.55;
            ctx.stroke();

            // Spawn data packets on hub connections
            if ((a.isHub || b.isHub) && frameCount % 90 === 0 && Math.random() < 0.15) {
              packets.push({ fromIdx: i, toIdx: j, t: 0, speed: 0.012 + Math.random() * 0.012 });
            }
          }
        }
      }

      // Data packets travelling along connections
      for (let i = packets.length - 1; i >= 0; i--) {
        const pkt = packets[i];
        pkt.t += pkt.speed;
        if (pkt.t >= 1) { packets.splice(i, 1); continue; }
        const a = particles[pkt.fromIdx];
        const b = particles[pkt.toIdx];
        if (!a || !b) { packets.splice(i, 1); continue; }
        const px = a.x + (b.x - a.x) * pkt.t;
        const py = a.y + (b.y - a.y) * pkt.t;
        // Trail
        const trailT = Math.max(0, pkt.t - 0.06);
        const tx = a.x + (b.x - a.x) * trailT;
        const ty = a.y + (b.y - a.y) * trailT;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = "rgba(103,232,249,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(103,232,249,1)";
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    const handleResize = () => { resize(); createParticles(); };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
