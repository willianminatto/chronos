# Chronos

An Interactive History of Computing.

Chronos is a scroll-driven web experience about the evolution of computing, from early electronic machines to modern AI. It is built as an interactive exhibition rather than a conventional timeline, around one question: _how did we get here?_

## Status

Stage 05 — six chapters. Intro, Machine (1940s–1950s), Chip (1960s–1970s), Personal (1970s–1980s), Web (1990s) and Always On (2000s) are implemented and connected by the Persistent Signal. Everywhere, Intelligence and the Finale are not built yet.

Planned chapters: Intro, Machine, Chip, Personal, Web, Always On, Everywhere, Intelligence, Finale.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript (strict)
- Tailwind CSS 4
- GSAP with ScrollTrigger and `@gsap/react`
- pnpm

## Local setup

Requires Node.js 22 (pinned in `.nvmrc` and `engines`) and pnpm.

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

## Scripts

| Script           | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Start the development server                    |
| `pnpm build`     | Create a production build                       |
| `pnpm start`     | Serve the production build                      |
| `pnpm lint`      | Run ESLint                                      |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit`     |

## Architecture

```text
src/
  app/                            Root layout, global CSS and the single page
  components/visual/              Shared visual primitives
  components/sections/            One folder per chapter: markup, timeline, chapter CSS
  data/                           Typed content metadata: eras and asset credits
  lib/motion/                     GSAP registration, motion constants, media queries
```

- Server Components by default. Client Components are used only where animation or interaction needs them.
- `src/data/eras.ts` holds chapter metadata. Each chapter will get its own section component; there is no generic chapter renderer.
- `src/data/credits.ts` is the single registry for external assets. It is empty: the MVP uses only typography, CSS and SVG.
- Client Components import GSAP from `src/lib/motion/gsap.ts`, which registers the plugins once. Animations are created inside `useGSAP` in the component that owns them, so they are cleaned up on unmount.
- Reduced motion is handled through `gsap.matchMedia()` and the `usePrefersReducedMotion` hook, both using the queries in `src/lib/motion/media-queries.ts`.

## Visual system

Direction: computational archaeology. A near-monochrome system of lines, points, grids, blocks, type and numbers that changes meaning from chapter to chapter.

- **Tokens** live in `src/app/globals.css`: background, foreground, muted, two line strengths and a single `--chronos-accent`, which a chapter may reassign on its own root element.
- **Type scale** (`text-massive`, `text-display`, `text-heading`, `text-body`, `text-technical`, `text-micro`) is fluid, built with `clamp()`. Archivo sets display and body; JetBrains Mono sets metadata.
- **Width axis.** Archivo is loaded with its `wdth` axis (62–125) and the generated `@font-face` declares `font-stretch: 62% 125%`, so width is set with the standard property: `font-stretch-[62%]` up to `font-stretch-[125%]`. No `font-variation-settings` or JavaScript is needed. `text-fit` sizes a single word to span its container.
- **Grid.** `.chronos-grid` is the layout grid: 4 columns, 12 from `lg`, with the shared `gutter`. `TechnicalGrid` draws it, sparse by default, with lines running through the column gaps.
- **Primitives** in `src/components/visual/`: `TechnicalGrid`, `TechnicalLabel`, `StructuralLine` and `SignalLine`. A `SignalLine` is one straight segment of the Persistent Signal, horizontal or vertical, whose state is one custom property, `--signal-progress`. A path is several segments meeting at their end nodes; a `relay` segment drops its head once the next one takes over.
- **Chapter CSS** is a plain stylesheet next to the section, with namespaced global classes (`machine-*`). CSS Modules are not used: the Tailwind loader rule in `next.config.ts` treats every `.css` file as global CSS.
- **Viewport units.** Full-height sections use `min-height: 100svh`. `svh` does not change while mobile browser chrome collapses, so layouts and ScrollTrigger measurements stay stable; `dvh` and `vh` are avoided for layout.

## Motion

- `src/lib/motion/config.ts` holds the shared vocabulary: two eases, three durations, one stagger. Timelines stay in the component that owns them.
- `gsap.matchMedia()` with `MOTION_CONDITIONS` is the standard branch: `desktop` and `compact` split at `lg` (64rem), and the callback returns before creating any timeline when `reduced` matches.
- Elements revealed by a timeline carry `data-reveal`, and signal segments resolved by one carry `data-signal-pending`. CSS applies their starting state only when motion is allowed and scripting is enabled, so reduced-motion and no-JavaScript visitors get the final, static composition directly.
- A signal path made of several segments is resolved with `resolveSignalChain` (`src/lib/motion/signal.ts`), which moves the head at a constant speed and shows one head at a time.
- Web and Always On share one folder and one graph (`sections/network/`): on desktop the timeline merges the two sections into a single pinned stage, so the network built in the first keeps existing and changes behavior in the second. Traffic is a CSS dash animation that only runs while the stage is on screen.
- Desktop chapters pin and scrub. Compact screens never pin: they scroll normally while the signal head rides a fixed viewport line (`COMPACT_SIGNAL_LINE`).
- Scrolling is native. Lenis is not used.
