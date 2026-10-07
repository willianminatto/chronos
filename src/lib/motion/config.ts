/**
 * Shared motion vocabulary. Deliberately small: a value belongs here only if
 * several chapters must agree on it. Anything specific to one composition
 * stays next to the timeline that uses it.
 */

export const EASE = {
  /** Reveals and arrivals: fast departure, long clean settle. */
  primary: "expo.out",
  /** Moves between two states: held start, decisive middle, held end. */
  expressive: "power4.inOut",
  /** Scroll-scrubbed progress, where the scroll position is the easing. */
  linear: "none",
} as const;

/** Seconds. */
export const DURATION = {
  /** Small state changes: labels, markers. */
  short: 0.5,
  /** Moves between two states. */
  transition: 0.9,
  /** Large elements entering the composition. */
  reveal: 1.4,
} as const;

/**
 * Viewport line the signal head rides while compact screens scroll. Chapters
 * share it so the head passes from one to the next without a jump.
 */
export const COMPACT_SIGNAL_LINE = "62%";

/** Seconds between consecutive items of a group. */
export const STAGGER = {
  small: 0.07,
} as const;
