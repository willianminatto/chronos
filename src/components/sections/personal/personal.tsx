"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, EASE } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";
import { resolveSignalChain } from "@/lib/motion/signal";
import "./personal.css";

/** Width of "PERSONAL" in em, measured the same way as the Intro title. */
const TITLE_FIT = {
  "--fit-compressed": 3.57,
  "--fit-extended": 6.94,
};

/** A pointer, drawn on the display's own cells. */
const GLYPH = [
  "X.......",
  "XX......",
  "XXX.....",
  "XXXX....",
  "XXXXX...",
  "XXXXXX..",
  "XXXXXXX.",
  "XXXX....",
  "X..XX...",
  "...XX...",
  "....XX..",
];
const BITMAP = { columns: 16, rows: 13 };
const GLYPH_ORIGIN = { x: 4, y: 1 };

const GLYPH_PATH = GLYPH.flatMap((row, y) =>
  [...row].flatMap((cell, x) =>
    cell === "X"
      ? [`M${GLYPH_ORIGIN.x + x} ${GLYPH_ORIGIN.y + y}h1v1h-1z`]
      : [],
  ),
).join("");

/** Abstract lines of text, as fractions of the window width. */
const TEXT_LINES = [0.9, 0.7, 0.82, 0.4, 0.62];

/** Scroll distance of the pinned desktop sequence, relative to the viewport. */
const PIN_DISTANCE = "+=160%";
/** Stepped easing: the interface is assembled cell by cell, it does not glide. */
const ASSEMBLE = "steps(6)";

const formatIndex = (index: number) => String(index).padStart(2, "0");

const personal = eras[3];

/**
 * Chapter 03. The field of cells the Chip ended on becomes a display. The
 * signal draws part of the interface itself: the divider under the status
 * bar, the left edge of the frame and the line under the statement. Windows
 * and their contents are assembled in steps around it. At the end the signal
 * leaves the frame: the machine is still alone, but about to reach another.
 */
export function Personal() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const section = root.current;
        if (!section || !conditions || conditions.reduced) return;

        const segment = (name: string) =>
          section.querySelector<HTMLElement>(`[data-personal='${name}']`);
        const entry = segment("entry");
        const divider = segment("divider");
        const edge = segment("edge");
        const underline = segment("underline");
        const exit = segment("exit");
        if (!entry || !divider || !edge || !underline || !exit) return;

        // What the signal draws inside the frame, then its way out.
        const path = [
          { target: divider, length: divider.offsetWidth },
          { target: edge, length: edge.offsetHeight },
          { target: underline, length: underline.offsetWidth },
          { target: exit, length: exit.offsetHeight },
        ];

        if (!conditions.desktop) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: `top ${COMPACT_SIGNAL_LINE}`,
                end: `bottom ${COMPACT_SIGNAL_LINE}`,
                scrub: true,
              },
            })
            .add(
              resolveSignalChain([
                { target: entry, length: entry.offsetHeight },
                ...path,
              ]),
            );

          gsap
            .timeline({
              defaults: { ease: ASSEMBLE },
              scrollTrigger: {
                trigger: "[data-personal='window']",
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            })
            .from("[data-personal='window']", { opacity: 0, duration: 0.3 })
            .fromTo(
              "[data-personal='glyph']",
              { clipPath: "inset(0% 0% 100% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 },
            );

          return;
        }

        // The signal reaches the display as the section arrives.
        gsap.fromTo(
          entry,
          { "--signal-progress": 0 },
          {
            "--signal-progress": 1,
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
          defaults: { ease: ASSEMBLE },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: PIN_DISTANCE,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        timeline
          // The field of cells crops down to the frame and recedes.
          .fromTo(
            section,
            { "--personal-crop": 0 },
            { "--personal-crop": 1, ease: EASE.expressive, duration: 0.18 },
            0,
          )
          .fromTo(
            "[data-personal='mesh']",
            { opacity: 1 },
            { opacity: 0.4, ease: EASE.linear, duration: 0.18 },
            0,
          )
          .fromTo(
            "[data-personal='outline']",
            { clipPath: "inset(0% 50% 100% 50%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: EASE.expressive,
              duration: 0.18,
            },
            0.04,
          )
          .from(
            "[data-personal='rule']",
            { scaleX: 0, transformOrigin: "0% 50%", duration: 0.1 },
            0.12,
          )
          .from(
            "[data-personal='meta']",
            { opacity: 0, duration: 0.04, stagger: 0.03 },
            0.16,
          )
          // The divider's head waits for the entry segment to hand over.
          .fromTo(
            divider.querySelector("[data-signal-head]"),
            { visibility: "hidden" },
            { visibility: "inherit", ease: EASE.linear, duration: 0.005 },
            0.005,
          )
          .add(resolveSignalChain(path).duration(0.86), 0.12)
          .from(
            "[data-personal='title']",
            { yPercent: 100, duration: 0.14 },
            0.22,
          )
          .from(
            "[data-personal='window']",
            {
              opacity: 0,
              xPercent: (index) => (index === 0 ? -12 : 12),
              yPercent: 12,
              duration: 0.12,
              stagger: 0.06,
            },
            0.3,
          )
          .fromTo(
            "[data-personal='glyph']",
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "steps(11)", duration: 0.14 },
            0.4,
          )
          .from(
            "[data-personal='text-line']",
            { scaleX: 0, duration: 0.06, stagger: 0.02 },
            0.42,
          )
          .from("[data-personal='statement']", { opacity: 0, duration: 0.04 }, 0.6)
          .from("[data-personal='cursor']", { autoAlpha: 0, duration: 0.01 }, 0.9);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="personal-title"
      className="personal relative overflow-clip"
    >
      <div aria-hidden data-personal="mesh" className="personal-mesh" />
      <SignalLine
        data-personal="entry"
        data-signal-pending
        orientation="vertical"
        track={false}
        relay
        className="personal-entry"
      />
      <SignalLine
        data-personal="exit"
        data-signal-pending
        orientation="vertical"
        track={false}
        className="personal-exit"
      />

      <div className="personal-frame">
        <div aria-hidden data-personal="outline" className="personal-outline" />
        <SignalLine
          data-personal="edge"
          data-signal-pending
          orientation="vertical"
          track={false}
          relay
          className="personal-edge"
        />

        <div className="personal-bar">
          <div className="flex gap-block">
            <TechnicalLabel data-personal="meta">
              Era /{" "}
              <span className="text-accent">{formatIndex(personal.index)}</span>
            </TechnicalLabel>
            <TechnicalLabel data-personal="meta" className="max-lg:hidden">
              Ready
            </TechnicalLabel>
          </div>
          <TechnicalLabel data-personal="meta">{personal.period}</TechnicalLabel>
        </div>
        <div className="flex items-center">
          <SignalLine
            data-personal="divider"
            data-signal-pending
            track={false}
            relay
            className="w-1/2 -scale-x-100"
          />
          <StructuralLine
            data-personal="rule"
            tone="strong"
            className="flex-1"
          />
        </div>

        <div className="px-(--personal-pad) pt-(--personal-pad)">
          <div className="@container overflow-y-clip">
            <h2
              id="personal-title"
              data-personal="title"
              className="-ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase [--fit:var(--fit-compressed)] font-stretch-[62%] lg:[--fit:var(--fit-extended)] lg:font-stretch-[125%]"
              style={TITLE_FIT}
            >
              {personal.title}
            </h2>
          </div>
        </div>

        <div aria-hidden className="personal-windows">
          <div
            data-personal="window"
            className="personal-window personal-window--bitmap"
          >
            <div className="personal-window__bar">
              <TechnicalLabel size="micro">Bitmap</TechnicalLabel>
              <span className="personal-window__handle" />
            </div>
            <div className="personal-window__body">
              <svg
                className="personal-bitmap"
                viewBox={`0 0 ${BITMAP.columns} ${BITMAP.rows}`}
              >
                <defs>
                  <pattern
                    id="personal-bitmap-cell"
                    width={1}
                    height={1}
                    patternUnits="userSpaceOnUse"
                  >
                    <path className="personal-bitmap__cells" d="M1 0H0V1" />
                  </pattern>
                </defs>
                <rect
                  width={BITMAP.columns}
                  height={BITMAP.rows}
                  fill="url(#personal-bitmap-cell)"
                />
                <path
                  data-personal="glyph"
                  className="personal-bitmap__glyph"
                  d={GLYPH_PATH}
                />
              </svg>
            </div>
          </div>
          <div
            data-personal="window"
            className="personal-window personal-window--text"
          >
            <div className="personal-window__bar">
              <TechnicalLabel size="micro">Text</TechnicalLabel>
              <span className="personal-window__handle" />
            </div>
            <div className="personal-window__body personal-lines">
              {TEXT_LINES.map((width) => (
                <span
                  key={width}
                  data-personal="text-line"
                  style={{ width: `${width * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <p
          data-personal="statement"
          className="personal-statement text-heading font-semibold font-stretch-[125%] uppercase"
        >
          Computing becomes personal.
          <span aria-hidden data-personal="cursor" className="personal-cursor" />
        </p>
        <SignalLine
          data-personal="underline"
          data-signal-pending
          track={false}
          relay
          className="personal-underline"
        />
      </div>
    </section>
  );
}
