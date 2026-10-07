# Chronos

An Interactive History of Computing.

Chronos is a scroll-driven visual essay on how computing changed shape, from room-sized machines to software that works with language. It is built as an exhibition rather than a timeline, around one question: _how did we get here?_ Everything on the page is type, CSS and SVG.

## Narrative

Nine chapters, connected by one recurring motif, the Persistent Signal: a line with an accent head that changes meaning as it crosses each era.

| #   | Chapter      | Decades     | Idea                         | The signal becomes   |
| --- | ------------ | ----------- | ---------------------------- | -------------------- |
| 00  | Intro        | —           | Initialization               | A dormant time axis  |
| 01  | Machine      | 1940s–1950s | Scale and structure          | An electrical path   |
| 02  | Chip         | 1960s–1970s | Miniaturization              | A circuit trace      |
| 03  | Personal     | 1970s–1980s | An interface is assembled    | Interface boundaries |
| 04  | Web          | 1990s       | A network expands            | A network route      |
| 05  | Always On    | 2000s       | The network carries traffic  | Continuous flow      |
| 06  | Everywhere   | 2010s       | A frame changes proportion   | A device boundary    |
| 07  | Intelligence | 2020s       | Tokens, relations, a word    | Relations            |
| 08  | Finale       | —           | What comes next?             | The axis, resolved   |

The Finale mirrors the Intro: the same axis, now resolved up to the present and dashed beyond it.

## Content and sources

All copy lives in `src/data/eras.ts`. Each chapter has an editorial `statement`, which is not a literal historical claim, and at most one short factual `detail`.

- Decades name where a chapter is anchored, not exclusive ranges. They overlap on purpose.
- The axis runs `1940 — 2026`. 1940 stands for the opening of the decade in which electronic computing took shape, not for any single machine; 2026 is the year the piece was made.
- The factual sentences were kept general and checked against institutional sources:
  - Machine — Computer History Museum: [ENIAC](https://www.computerhistory.org/revolution/birth-of-the-computer/4/78), [Atanasoff-Berry Computer](https://www.computerhistory.org/revolution/birth-of-the-computer/4/99), [timeline, 1942](https://www.computerhistory.org/timeline/1942/).
  - Chip — Computer History Museum, [The Silicon Engine timeline](https://www.computerhistory.org/siliconengine/timeline/).
  - Web — CERN, [A short history of the Web](https://home.cern/science/computing/the-birth-of-the-web/short-history-web/).
- The Intelligence sentence is a deliberately modest description and was not checked against a single source.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript (strict)
- Tailwind CSS 4
- GSAP with ScrollTrigger and `@gsap/react`
- pnpm, Node.js 22

No smooth-scrolling library, canvas or WebGL.

## Visual and motion approach

Direction: computational archaeology. A near-monochrome system of lines, points, grids, blocks, type and numbers, with one accent color reserved for the signal.

- **Tokens** live in `src/app/globals.css`: background, foreground, muted, two line strengths and a single `--chronos-accent`.
- **Type.** Archivo sets display and body, JetBrains Mono sets metadata. The scale (`text-massive` to `text-micro`) is fluid. Archivo's width axis is used through the standard `font-stretch` property, from 62% to 125%, and `text-fit` sizes a single word to span its container.
- **Grid.** `.chronos-grid` is the layout grid: 4 columns, 12 from `lg`. `TechnicalGrid` draws its main divisions, with lines running through the column gaps.
- **Primitives** in `src/components/visual/`: `TechnicalGrid`, `TechnicalLabel`, `StructuralLine` and `SignalLine`. A `SignalLine` is one straight segment of the signal, whose state is one custom property, `--signal-progress`. A path is several segments; `resolveSignalChain` (`src/lib/motion/signal.ts`) resolves them in order and shows one head at a time.
- **Motion.** `src/lib/motion/config.ts` holds the shared vocabulary: three eases, two durations, one stagger. Each chapter owns its timeline. On desktop chapters pin and scrub; Web and Always On share one pinned stage, and so do Everywhere and Intelligence, so a structure built in one chapter changes behavior in the next instead of being replaced.
- **Viewport units.** Full-height sections use `svh`, which stays stable while mobile browser chrome collapses.

## Accessibility and reduced motion

- One `h1` and one `h2` per chapter. All copy is real text; figures are decorative and hidden from assistive technology.
- With `prefers-reduced-motion: reduce` no timeline or pin is created and nothing loops. Every chapter renders as a complete static composition, and the signal is drawn in its final state. The same static state is what a visitor without JavaScript gets.
- `Restart` returns to the top without animated scrolling and moves focus to the title.
- Focus outlines are the browser defaults. No formal WCAG audit has been done.

## Responsive approach

Two layouts, split at 64rem. Desktop is the pinned, scrubbed sequence. Compact screens never pin: chapters scroll normally, in simplified compositions, while the signal head rides a fixed line of the viewport.

## Assets and licensing

- There are no external images, icons or audio. Every figure is authored for this project in CSS and SVG, so `src/data/credits.ts`, the registry for third-party assets, is empty and there is no credits page.
- The Open Graph image and the Apple touch icon are screenshots of the project's own Intro and favicon.
- Archivo and JetBrains Mono are loaded through `next/font/google`, which self-hosts them at build time. Both are published under the SIL Open Font License 1.1.

## Local development

Requires Node.js 22 (pinned in `.nvmrc` and `engines`) and pnpm.

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

| Script           | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Start the development server                |
| `pnpm build`     | Create a production build                   |
| `pnpm start`     | Serve the production build                  |
| `pnpm lint`      | Run ESLint                                  |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit` |

There is no test suite: the project has almost no logic that is separable from layout and motion.

Chapter styles are plain stylesheets next to each section, with namespaced global classes. CSS Modules are not used, because the Tailwind loader rule in `next.config.ts` treats every `.css` file as global CSS.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the production origin, for example `https://example.com`. While it is unset, the build emits no canonical URL, no sitemap entry and no absolute Open Graph URL, so nothing points at a made-up domain.

## Architecture

```text
src/
  app/                  Root layout, global CSS, the page, metadata files
  components/sections/  One folder per chapter: markup, timeline, chapter CSS
  components/visual/    Shared visual primitives
  data/                 Chapter copy and the (empty) asset credits registry
  lib/motion/           GSAP registration, motion constants, signal helper
  lib/site.ts           Site name, description and production origin
```

Client Components import GSAP from `src/lib/motion/gsap.ts`, which registers the plugins once. Animations are created inside `useGSAP`, so they are reverted on unmount and whenever a media condition changes.

## Status

Complete as a narrative. Verified in Chromium at 1440, 1024 and 390 pixels wide and in desktop Firefox, with and without reduced motion. Not yet tested in Safari or on a physical touch device.
