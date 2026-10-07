/**
 * Queries behind every `gsap.matchMedia()` branch. `desktop` and `compact`
 * split at Tailwind's `lg` breakpoint (64rem), the same width at which the
 * layout grid goes from 4 to 12 columns.
 *
 * The callback re-runs when any condition changes; return early on `reduced`
 * so no timeline is created.
 *
 *   mm.add(MOTION_CONDITIONS, ({ conditions }) => {
 *     if (!conditions || conditions.reduced) return;
 *     // build the timeline, branching on conditions.desktop where needed
 *   });
 */
export const MOTION_CONDITIONS = {
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 64rem)",
  compact: "not all and (min-width: 64rem)",
} as const;
