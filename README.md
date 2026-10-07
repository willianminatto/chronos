# Chronos

An Interactive History of Computing.

Chronos is a scroll-driven web experience about the evolution of computing, from early electronic machines to modern AI. It is built as an interactive exhibition rather than a conventional timeline, around one question: _how did we get here?_

## Status

Stage 01 — technical bootstrap. The app currently renders a temporary identity shell. No chapters, animations or final design have been implemented yet.

Planned chapters: Intro, Machine, Chip, Personal, Web, Always On, Everywhere, Intelligence, Finale.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript (strict)
- Tailwind CSS 4
- GSAP with ScrollTrigger and `@gsap/react`
- pnpm

## Local setup

Requires Node.js 20.9 or newer and pnpm.

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
  app/          Root layout, global CSS and the single page
  data/         Typed content metadata: eras and asset credits
  lib/motion/   GSAP registration and reduced-motion helpers
```

- Server Components by default. Client Components are used only where animation or interaction needs them.
- `src/data/eras.ts` holds chapter metadata. Each chapter will get its own section component; there is no generic chapter renderer.
- `src/data/credits.ts` is the single registry for external assets. It is empty: the MVP uses only typography, CSS and SVG.
- Client Components import GSAP from `src/lib/motion/gsap.ts`, which registers the plugins once. Animations are created inside `useGSAP` in the component that owns them, so they are cleaned up on unmount.
- Reduced motion is handled through `gsap.matchMedia()` and the `usePrefersReducedMotion` hook, both using the queries in `src/lib/motion/media-queries.ts`.
