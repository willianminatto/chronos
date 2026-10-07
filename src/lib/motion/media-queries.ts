/**
 * Shared by `usePrefersReducedMotion` and by `gsap.matchMedia()` conditions,
 * so React rendering and GSAP animations branch on the same queries.
 */
export const MOTION_QUERIES = {
  reduced: "(prefers-reduced-motion: reduce)",
  full: "(prefers-reduced-motion: no-preference)",
} as const;
