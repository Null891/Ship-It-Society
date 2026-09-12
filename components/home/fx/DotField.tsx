"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion, useRunWhenVisible } from "@/lib/hooks";

/* ==========================================================================
   A field of dots that bulges around the pointer.

   Canvas, not DOM: a few hundred dots as elements would be a few hundred
   style recalculations per pointer move. It redraws only while the pointer
   is over it and it is on screen, and it stops as soon as the pointer
   leaves. Touch, reduced motion and no-JS get the flat CSS dot grid the
   wrapper already paints underneath.
   ========================================================================== */

const SPACING = 26;
const RADIUS = 130;
const PUSH = 14;

export function DotField({ className = "" }: { className?: string }) {
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      frame.current = 0;
      ctx.clearRect(0, 0, width, height);
      const p = pointer.current;
      for (let x = SPACING / 2; x < width; x += SPACING) {
        for (let y = SPACING / 2; y < height; y += SPACING) {
          let dx = 0;
          let dy = 0;
          let lift = 0;
          if (p) {
            const ox = x - p.x;
            const oy = y - p.y;
            const dist = Math.hypot(ox, oy);
            if (dist < RADIUS && dist > 0.001) {
              // Push outward, strongest at the centre, easing to nothing.
              const k = 1 - dist / RADIUS;
              lift = k * k;
              dx = (ox / dist) * PUSH * lift;
              dy = (oy / dist) * PUSH * lift;
            }
          }
          ctx.globalAlpha = 0.16 + lift * 0.7;
          ctx.fillStyle = lift > 0.55 ? "#ff9f0a" : "#ffffff";
          const size = 1 + lift * 1.4;
          ctx.fillRect(x + dx - size / 2, y + dy - size / 2, size, size);
        }
      }
    };

    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !running) return;
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      schedule();
    };
    const onLeave = () => {
      pointer.current = null;
      schedule();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame.current);
      observer.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, running]);

  return (
    <div ref={gateRef} aria-hidden className={`hud-dots ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
