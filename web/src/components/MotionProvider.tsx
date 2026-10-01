"use client";

import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/**
 * App-wide motion settings. `strict` makes any accidental full `motion.*`
 * import an error, so components use the lightweight `m.*` and the engine
 * arrives lazily after first paint. `reducedMotion="user"` turns transform
 * animations off for people who've asked their device for less motion,
 * keeping only fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/** Shared timing: enter with ease-out, leave faster with ease-in. */
export const EASE_OUT = [0.2, 0.8, 0.2, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;
export const SPRING = { type: "spring", stiffness: 520, damping: 34, mass: 0.8 } as const;
