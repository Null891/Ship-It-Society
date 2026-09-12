"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./wirecube.module.css";

/* ==========================================================================
   A wireframe cube, in CSS 3D.

   Six faces with nothing but a border, so it reads as twelve edges. It turns
   on its own, and leans toward a fine pointer on a spring. Reduced motion
   stops the rotation and the lean, leaving the cube parked at a three-
   quarter angle where it still reads as a cube.
   ========================================================================== */

const LEAN = 16;

export function WireCube({ className = "", size = 210 }: { className?: string; size?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(ny, [0, 1], [LEAN, -LEAN]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(nx, [0, 1], [-LEAN, LEAN]), {
    stiffness: 140,
    damping: 18,
  });

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    nx.set((e.clientX - r.left) / r.width);
    ny.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    nx.set(0.5);
    ny.set(0.5);
  };

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`${styles.stage} ${className}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <motion.div className={styles.tilt} style={{ rotateX, rotateY }}>
        <div className={styles.cube} style={{ ["--size" as string]: `${size}px` }}>
          <span className={`${styles.face} ${styles.front}`} />
          <span className={`${styles.face} ${styles.back}`} />
          <span className={`${styles.face} ${styles.right}`} />
          <span className={`${styles.face} ${styles.left}`} />
          <span className={`${styles.face} ${styles.top}`} />
          <span className={`${styles.face} ${styles.bottom}`} />
        </div>
      </motion.div>
    </div>
  );
}
