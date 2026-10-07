/**
 * Shared by `usePrefersReducedMotion` and by `gsap.matchMedia()` conditions,
 * so React rendering and GSAP animations branch on the same queries.
 *
 * `desktop` and `compact` split at Tailwind's `lg` breakpoint (64rem), the
 * same width at which the layout grid goes from 4 to 12 columns.
 */
export const MOTION_QUERIES = {
  reduced: "(prefers-reduced-motion: reduce)",
  full: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 64rem)",
  compact: "not all and (min-width: 64rem)",
} as const;

/**
 * Conditions object for `gsap.matchMedia().add()`. The callback re-runs when
 * any of them changes; return early on `reduced` so no timeline is created.
 *
 *   mm.add(MOTION_CONDITIONS, ({ conditions }) => {
 *     if (!conditions || conditions.reduced) return;
 *     // build the timeline, branching on conditions.desktop where needed
 *   });
 */
export const MOTION_CONDITIONS = {
  reduced: MOTION_QUERIES.reduced,
  desktop: MOTION_QUERIES.desktop,
  compact: MOTION_QUERIES.compact,
} as const;
