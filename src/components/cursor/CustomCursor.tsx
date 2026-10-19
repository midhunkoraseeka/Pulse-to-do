"use client";

import React, { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on devices with fine pointer and no reduced motion preference
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointerQuery.matches || reducedMotionQuery.matches) {
      return;
    }

    setIsEnabled(true);
    document.body.classList.add("custom-cursor-enabled");

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isClicking = false;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Check if hovering an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "button, a, input, select, textarea, [role='button'], [data-cursor-hover]"
        );
        isHovering = Boolean(interactive);
      }
    };

    const onMouseDown = () => {
      isClicking = true;
    };

    const onMouseUp = () => {
      isClicking = false;
    };

    // Ripple effect on task completion
    const onTaskCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ x?: number; y?: number }>;
      const ripX = customEvent.detail?.x ?? mouseX;
      const ripY = customEvent.detail?.y ?? mouseY;

      if (rippleRef.current) {
        rippleRef.current.style.transform = `translate3d(${ripX}px, ${ripY}px, 0) translate(-50%, -50%) scale(0.1)`;
        rippleRef.current.style.opacity = "0.9";
        rippleRef.current.style.transition = "none";

        requestAnimationFrame(() => {
          if (rippleRef.current) {
            rippleRef.current.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out";
            rippleRef.current.style.transform = `translate3d(${ripX}px, ${ripY}px, 0) translate(-50%, -50%) scale(3.5)`;
            rippleRef.current.style.opacity = "0";
          }
        });
      }
    };

    const animate = () => {
      // Smooth easing (Lerp) for trailing ring
      const easing = 0.18;
      ringX += (mouseX - ringX) * easing;
      ringY += (mouseY - ringY) * easing;

      if (ringRef.current) {
        const scale = isClicking ? 0.8 : isHovering ? 1.6 : 1.0;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.borderColor = isHovering
          ? "#C6FF5E"
          : "rgba(198, 255, 94, 0.35)";
        ringRef.current.style.backgroundColor = isHovering
          ? "rgba(198, 255, 94, 0.08)"
          : "transparent";
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("pulse_task_completed", onTaskCompleted);

    rafId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("pulse_task_completed", onTaskCompleted);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Central Acid-Lime Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#C6FF5E] shadow-[0_0_8px_#C6FF5E] will-change-transform"
      />

      {/* Trailing Outer Outline Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[rgba(198,255,94,0.35)] transition-[border-color,background-color] duration-150 will-change-transform"
      />

      {/* Completion Pulse Ripple */}
      <div
        ref={rippleRef}
        className="fixed top-0 left-0 w-12 h-12 rounded-full border-2 border-[#C6FF5E] opacity-0 will-change-transform"
      />
    </div>
  );
}
