"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, EASE } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";
import { resolveSignalChain } from "@/lib/motion/signal";
import "./chip.css";

/** Width of "CHIP" in em at the compressed end of the width axis. */
const TITLE_FIT = { "--fit": 1.57 };

/* Everything below is in the drawing's own units: a 600 × 600 square. */

const DRAWING = 600;
const CENTER = DRAWING / 2;
const DIE = { x: 200, y: 200, size: 200 };

/** The six units of the machine, now blocks on the die. */
const BLOCK = { width: 75, height: 50 };
const BLOCKS = [
  { x: 215, y: 215 },
  { x: 310, y: 215 },
  { x: 215, y: 275 },
  { x: 310, y: 275 },
  { x: 215, y: 335 },
  { x: 310, y: 335 },
];

/** Enters at the top, threads the gaps between the blocks, leaves below. */
const SIGNAL_PATH = "M300 0V270H207.5V330H300V600";
const SIGNAL_LENGTH = 785;
/** Progress at which the signal reaches the edge of the die. */
const SIGNAL_AT_DIE = DIE.y / SIGNAL_LENGTH;

const TRACES = [
  "M220 200V178L212 170H148L140 162V70",
  "M260 200V148L252 140H228L220 132V70",
  "M340 200V148L348 140H372L380 132V70",
  "M380 200V178L388 170H452L460 162V70",
  "M220 400V422L212 430H148L140 438V530",
  "M260 400V452L252 460H228L220 468V530",
  "M340 400V452L348 460H372L380 468V530",
  "M380 400V422L388 430H452L460 438V530",
];

const TERMINAL = 12;
const TERMINALS = [140, 220, 380, 460].flatMap((x) => [
  { x, y: 70 },
  { x, y: 530 },
]);

const PAD = { width: 12, height: 8 };
const PADS = [220, 260, 300, 340, 380].flatMap((x) => [
  { x, y: DIE.y },
  { x, y: DIE.y + DIE.size },
]);

/**
 * The matrix the circuit settles into at the end: cells of the mesh that
 * continues into the next chapter, in two rows either side of the signal.
 */
const CELL = 20;
const MESH = { y: 480, height: 120 };
const MATRIX_COLUMNS = [200, 220, 240, 260, 320, 340, 360, 380];
const TERMINAL_CELLS = MATRIX_COLUMNS.map((x) => ({ x, y: 520 }));
const PAD_CELLS = [180, ...MATRIX_COLUMNS, 400].map((x) => ({ x, y: 540 }));

/** Scroll distance of the pinned desktop sequence, relative to the viewport. */
const PIN_DISTANCE = "+=180%";
/** Stepped easing: parts snap into cells instead of gliding. */
const SNAP = "steps(4)";

const formatIndex = (index: number) => String(index).padStart(2, "0");

const chip = eras[2];

/**
 * Chapter 02. The machine's six units arrive as a row and collapse into one
 * die; traces are drawn out of it and the signal threads through. At the end
 * the circuit lets go of its traces and settles into a matrix of cells, the
 * raw material of the next chapter. Compact screens keep the drawing and the
 * signal, without the collapse or the pin.
 */
export function Chip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const section = root.current;
        const drawing = section?.querySelector<SVGSVGElement>(
          "[data-chip='drawing']",
        );
        if (!section || !drawing || !conditions || conditions.reduced) return;

        const traces = gsap.utils.toArray<SVGPathElement>(
          "[data-chip='trace']",
        );
        const terminals = gsap.utils.toArray<SVGRectElement>(
          "[data-chip='terminal']",
        );
        const pads = gsap.utils.toArray<SVGRectElement>("[data-chip='pad']");

        if (!conditions.desktop) {
          const side = section.querySelector<HTMLElement>(
            "[data-chip='side']",
          );
          const jog = section.querySelector<HTMLElement>("[data-chip='jog']");
          if (!side || !jog) return;

          const unit = drawing.clientWidth / DRAWING;

          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: `top ${COMPACT_SIGNAL_LINE}`,
              end: `bottom ${COMPACT_SIGNAL_LINE}`,
              scrub: true,
            },
          }).add(
            resolveSignalChain([
              { target: side, length: side.offsetHeight },
              { target: jog, length: jog.offsetWidth },
              { target: drawing, length: SIGNAL_LENGTH * unit },
            ]),
          );

          gsap.timeline({
            defaults: { ease: EASE.linear },
            scrollTrigger: {
              trigger: drawing,
              start: "top 85%",
              end: "center 55%",
              scrub: true,
            },
          })
            .fromTo(
              traces,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 },
              0,
            )
            .from(terminals, { opacity: 0, duration: 0.1, stagger: 0.02 }, 0.8);

          return;
        }

        // The signal reaches the die as the section arrives.
        gsap.fromTo(
          drawing,
          { "--signal-progress": 0 },
          {
            "--signal-progress": SIGNAL_AT_DIE,
            ease: EASE.linear,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );

        // Positions and durations below are fractions of the scroll range.
        const timeline = gsap.timeline({
          defaults: { ease: EASE.expressive },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: PIN_DISTANCE,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        // The units start as a row of cabinets as wide as the viewport allows.
        const unit = drawing.clientHeight / DRAWING;
        const spacing = Math.min(170, section.clientWidth / unit / 6.6);

        BLOCKS.forEach((block, index) => {
          timeline.from(
            `[data-chip='block']:nth-of-type(${index + 1})`,
            {
              x:
                CENTER +
                (index - (BLOCKS.length - 1) / 2) * spacing -
                (block.x + BLOCK.width / 2),
              y: CENTER - (block.y + BLOCK.height / 2),
              scaleX: 1.1,
              scaleY: 2.6,
              transformOrigin: "50% 50%",
              duration: 0.3,
            },
            0,
          );
        });

        timeline
          .fromTo(
            "[data-chip='die']",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.14 },
            0.2,
          )
          .from(
            "[data-chip='letters-start']",
            { xPercent: 100, ease: EASE.primary, duration: 0.2 },
            0.24,
          )
          .from(
            "[data-chip='letters-end']",
            { xPercent: -100, ease: EASE.primary, duration: 0.2 },
            0.24,
          )
          .from(
            "[data-chip='copy']",
            { opacity: 0, duration: 0.08, stagger: 0.03 },
            0.3,
          )
          .from(pads, { opacity: 0, ease: SNAP, duration: 0.06 }, 0.34)
          .fromTo(
            traces,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.16, stagger: 0.015 },
            0.38,
          )
          .from(
            terminals,
            { opacity: 0, ease: SNAP, duration: 0.03, stagger: 0.01 },
            0.56,
          )
          .fromTo(
            drawing,
            { "--signal-progress": SIGNAL_AT_DIE },
            {
              "--signal-progress": 1,
              ease: EASE.linear,
              duration: 0.32,
              immediateRender: false,
            },
            0.5,
          )
          // The circuit lets go of its traces and settles into a matrix.
          .to(traces, { strokeDashoffset: 1, duration: 0.06 }, 0.84)
          .fromTo(
            "[data-chip='mesh']",
            { attr: { y: MESH.y + MESH.height, height: 0 } },
            { attr: { ...MESH }, ease: "steps(6)", duration: 0.1 },
            0.84,
          );

        const settle = (
          elements: SVGRectElement[],
          cells: { x: number; y: number }[],
        ) => {
          elements.forEach((element, index) => {
            const cell = cells[index];
            if (!cell) return;

            timeline.to(
              element,
              {
                attr: {
                  x: cell.x + 1,
                  y: cell.y + 1,
                  width: CELL - 2,
                  height: CELL - 2,
                },
                ease: SNAP,
                duration: 0.08,
              },
              0.9 + index * 0.003,
            );
          });
        };

        settle(terminals, TERMINAL_CELLS);
        settle(pads, PAD_CELLS);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="chip-title"
      className="relative min-h-svh overflow-clip"
    >
      <TechnicalGrid />

      <div className="relative z-10 px-gutter pt-20 pb-block lg:static lg:pt-gutter">
        <SignalLine
          data-chip="side"
          data-signal-pending
          orientation="vertical"
          track={false}
          relay
          className="absolute top-0 -bottom-1 left-frame -translate-x-1/2 lg:hidden"
        />
        <div className="flex items-baseline justify-between pb-meta">
          <TechnicalLabel data-chip="copy">
            Era / <span className="text-accent">{formatIndex(chip.index)}</span>
          </TechnicalLabel>
          <TechnicalLabel data-chip="copy">{chip.period}</TechnicalLabel>
        </div>
        <StructuralLine tone="strong" className="-mx-rail lg:hidden" />

        <div className="@container pt-block lg:pt-0">
          <h2
            id="chip-title"
            className="chip-title -ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase font-stretch-[62%] lg:ml-0 lg:font-stretch-[125%]"
            style={TITLE_FIT}
          >
            <span className="chip-title__half">
              <span data-chip="letters-start">Ch</span>
            </span>
            <span className="chip-title__half">
              <span data-chip="letters-end">ip</span>
            </span>
          </h2>
        </div>

        <div className="grid gap-y-meta pt-block lg:max-w-[22rem] lg:pt-meta">
          <p
            data-chip="copy"
            className="text-heading font-semibold font-stretch-[125%] uppercase lg:text-xl xl:text-2xl"
          >
            Miniaturization.
          </p>
          <p data-chip="copy" className="max-w-[38ch] text-body text-muted">
            Circuits that once filled cabinets were integrated onto a single
            piece of silicon.
          </p>
        </div>
      </div>

      <SignalLine
        data-chip="jog"
        data-signal-pending
        relay
        className="ml-frame w-[calc(50%-var(--chronos-frame))] lg:hidden"
      />

      <div aria-hidden className="chip-figure">
        <svg
          data-chip="drawing"
          data-signal-pending
          className="chip-svg"
          viewBox={`0 0 ${DRAWING} ${DRAWING}`}
        >
          <defs>
            <pattern
              id="chip-mesh-cell"
              width={CELL}
              height={CELL}
              patternUnits="userSpaceOnUse"
            >
              <path className="chip-mesh-cell" d={`M${CELL} 0H0V${CELL}`} />
            </pattern>
          </defs>
          <rect
            data-chip="mesh"
            className="chip-mesh"
            x={-DRAWING * 2}
            width={DRAWING * 5}
            {...MESH}
            fill="url(#chip-mesh-cell)"
          />

          {TRACES.map((d) => (
            <path
              key={d}
              data-chip="trace"
              className="chip-trace"
              pathLength={1}
              d={d}
            />
          ))}

          <rect
            data-chip="die"
            className="chip-line chip-die"
            pathLength={1}
            x={DIE.x}
            y={DIE.y}
            width={DIE.size}
            height={DIE.size}
          />
          <g>
            {BLOCKS.map((block) => (
              <rect
                key={`${block.x}-${block.y}`}
                data-chip="block"
                className="chip-line"
                {...block}
                {...BLOCK}
              />
            ))}
          </g>

          {PADS.map((pad) => (
            <rect
              key={`${pad.x}-${pad.y}`}
              data-chip="pad"
              className="chip-pad"
              x={pad.x - PAD.width / 2}
              y={pad.y - PAD.height / 2}
              {...PAD}
            />
          ))}
          {TERMINALS.map((terminal) => (
            <rect
              key={`${terminal.x}-${terminal.y}`}
              data-chip="terminal"
              className="chip-terminal"
              x={terminal.x - TERMINAL / 2}
              y={terminal.y - TERMINAL / 2}
              width={TERMINAL}
              height={TERMINAL}
            />
          ))}

          <path className="chip-signal" pathLength={1} d={SIGNAL_PATH} />
          <rect
            data-signal-head
            className="chip-signal-head"
            x={-3}
            y={-3}
            width={6}
            height={6}
            style={{ offsetPath: `path("${SIGNAL_PATH}")` }}
          />
        </svg>
      </div>
    </section>
  );
}
