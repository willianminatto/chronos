/**
 * Production origin, read from `NEXT_PUBLIC_SITE_URL` at build time. It is
 * not known yet, so nothing here invents one: while it is unset, no canonical
 * URL, sitemap entry or absolute Open Graph URL is emitted.
 */
const origin = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL = origin ? new URL(origin) : null;

export const SITE = {
  name: "Chronos",
  title: "Chronos — An Interactive History of Computing",
  description:
    "A scroll-driven visual essay on how computing changed shape, from room-sized machines to software that works with language. Nine chapters, drawn entirely in type, CSS and SVG.",
} as const;
