"use client";

import { useSyncExternalStore } from "react";
import { MOTION_QUERIES } from "./media-queries";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERIES.reduced);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(MOTION_QUERIES.reduced).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Whether the user prefers reduced motion. Returns false on the server and
 * during hydration, then the real value, so it never causes a mismatch.
 *
 * Use it when a component must render different markup. For animation-only
 * branching, prefer `gsap.matchMedia()` with `MOTION_QUERIES`.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
