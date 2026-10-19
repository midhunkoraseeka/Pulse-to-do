"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { DailyProgressCalculation } from "@/types";

interface LivingProgressFieldProps {
  progress: DailyProgressCalculation;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  orbitRadius: number;
  angle: number;
  angularSpeed: number;
  radialSpeed: number;
  phase: number;
  alpha: number;
}

export function LivingProgressField({ progress, className = "" }: LivingProgressFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const pct = Math.min(100, Math.max(0, progress.progressPercentage));
  const hasTasks = progress.hasTasks;

  // Track reduced motion setting
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Visual parameters based on progress state
  const visualParams = useMemo(() => {
    if (!hasTasks) {
      return {
        particleCount: 24,
        speedMultiplier: 0.35,
        connectionDistance: 0,
        orbitCount: 2,
        accentIntensity: 0.15,
        fieldState: "empty",
      };
    }
    if (pct < 26) {
      return {
        particleCount: 36,
        speedMultiplier: 0.5,
        connectionDistance: 35,
        orbitCount: 2,
        accentIntensity: 0.25,
        fieldState: "initiating",
      };
    }
    if (pct < 51) {
      return {
        particleCount: 60,
        speedMultiplier: 0.8,
        connectionDistance: 50,
        orbitCount: 3,
        accentIntensity: 0.45,
        fieldState: "connecting",
      };
    }
    if (pct < 76) {
      return {
        particleCount: 85,
        speedMultiplier: 1.1,
        connectionDistance: 65,
        orbitCount: 4,
        accentIntensity: 0.7,
        fieldState: "momentum",
      };
    }
    if (pct < 100) {
      return {
        particleCount: 110,
        speedMultiplier: 1.35,
        connectionDistance: 80,
        orbitCount: 5,
        accentIntensity: 0.88,
        fieldState: "culmination",
      };
    }
    return {
      particleCount: 130,
      speedMultiplier: 0.9,
      connectionDistance: 95,
      orbitCount: 5,
      accentIntensity: 1.0,
      fieldState: "completed",
    };
  }, [pct, hasTasks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;

    // Handle high DPI
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      centerX = width / 2;
      centerY = height / 2;
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const particles: Particle[] = [];
    const count = visualParams.particleCount;
    const maxRadius = Math.min(centerX, centerY) * 0.88;

    for (let i = 0; i < count; i++) {
      const orbitTier = (i % visualParams.orbitCount) + 1;
      const baseOrbit = (maxRadius / visualParams.orbitCount) * orbitTier;
      particles.push({
        x: centerX,
        y: centerY,
        radius: Math.random() * 1.8 + 0.8,
        baseRadius: Math.random() * 1.8 + 0.8,
        orbitRadius: baseOrbit + (Math.random() - 0.5) * 30,
        angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
        angularSpeed: (Math.random() * 0.008 + 0.003) * (i % 2 === 0 ? 1 : -1) * visualParams.speedMultiplier,
        radialSpeed: (Math.random() * 0.02 + 0.01) * visualParams.speedMultiplier,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.25,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint background radial glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        maxRadius * 1.1
      );
      glowGradient.addColorStop(
        0,
        `rgba(198, 255, 94, ${visualParams.accentIntensity * 0.12})`
      );
      glowGradient.addColorStop(
        0.6,
        `rgba(198, 255, 94, ${visualParams.accentIntensity * 0.03})`
      );
      glowGradient.addColorStop(1, "rgba(9, 11, 9, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle orbital paths
      for (let o = 1; o <= visualParams.orbitCount; o++) {
        const orbitR = (maxRadius / visualParams.orbitCount) * o;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          orbitR,
          orbitR * 0.72,
          o * 0.15 + time * 0.002,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(198, 255, 94, ${0.05 + o * 0.02 * visualParams.accentIntensity})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.angularSpeed;

        // Wave oscillation in radius
        const wave = Math.sin(time * 0.03 + p.phase) * 8;
        const currentR = p.orbitRadius + wave;

        // Elliptical coordinates with tilt
        const tilt = 0.25;
        p.x = centerX + Math.cos(p.angle) * currentR;
        p.y = centerY + Math.sin(p.angle) * (currentR * 0.72) + Math.cos(p.angle) * tilt * 20;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198, 255, 94, ${p.alpha * visualParams.accentIntensity})`;
        ctx.shadowColor = "#C6FF5E";
        ctx.shadowBlur = visualParams.accentIntensity > 0.6 ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw connection lines if threshold allows
      if (visualParams.connectionDistance > 0) {
        ctx.lineWidth = 0.75;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < visualParams.connectionDistance) {
              const lineAlpha = (1 - dist / visualParams.connectionDistance) * 0.25 * visualParams.accentIntensity;
              ctx.strokeStyle = `rgba(198, 255, 94, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      time += 1;

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visualParams, isVisible, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#090B09] border border-[#232A21] select-none ${className}`}
      style={{ minHeight: "360px" }}
      aria-label={`Daily Progress: ${hasTasks ? `${pct}% complete` : "No tasks planned"}`}
      role="region"
    >
      {/* Background Generative Canvas 2D Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Crisp Editorial SVG Reticles */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <circle
          cx="200"
          cy="200"
          r="165"
          fill="none"
          stroke="#232A21"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="rgba(198, 255, 94, 0.12)"
          strokeWidth="1"
        />
        {/* Cardinal calibration notches */}
        <line x1="200" y1="30" x2="200" y2="40" stroke="#C6FF5E" strokeWidth="1.5" />
        <line x1="200" y1="360" x2="200" y2="370" stroke="#C6FF5E" strokeWidth="1.5" />
        <line x1="30" y1="200" x2="40" y2="200" stroke="#C6FF5E" strokeWidth="1.5" />
        <line x1="360" y1="200" x2="370" y2="200" stroke="#C6FF5E" strokeWidth="1.5" />
      </svg>

      {/* Central High-Legibility Display */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-8">
        <div className="text-[11px] font-mono tracking-[0.25em] text-[#92988D] uppercase mb-1">
          LIVING MOMENTUM FIELD
        </div>

        {hasTasks ? (
          <>
            <div className="flex items-baseline justify-center">
              <span className="font-mono-numbers text-7xl md:text-8xl font-black tracking-tighter text-[#F1F3EC]">
                {pct}
              </span>
              <span className="text-3xl md:text-4xl font-light text-[#C6FF5E] ml-1">
                %
              </span>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171C16] border border-[#232A21]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF5E] animate-pulse" />
              <span className="text-xs font-mono text-[#F1F3EC]">
                {progress.completedTasks} / {progress.totalTasks} TASKS COMPLETE
              </span>
            </div>

            <p className="mt-3 text-xs md:text-sm font-medium tracking-wide text-[#92988D] max-w-[260px]">
              {progress.statusLabel}
            </p>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center">
            <span className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-[#92988D]">
              NO TASKS PLANNED
            </span>
            <p className="mt-2 text-xs text-[#5E645A] max-w-[220px]">
              Add your focus items for today to initiate the Living Progress Field.
            </p>
          </div>
        )}

        {/* Overdue alert badge if any */}
        {progress.overdueTasks > 0 && (
          <div className="mt-3 text-[11px] font-mono text-[#FF5E5E] bg-[rgba(255,94,94,0.1)] px-2.5 py-0.5 rounded border border-[rgba(255,94,94,0.2)]">
            {progress.overdueTasks} OVERDUE TASK{progress.overdueTasks > 1 ? "S" : ""} DETECTED
          </div>
        )}
      </div>
    </div>
  );
}
