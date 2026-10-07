"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { StructuralLine } from "@/components/visual/structural-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { COMPACT_SIGNAL_LINE, EASE } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { offsetWithin } from "@/lib/motion/layout";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";

/**
 * Width of "CHRONOS" in em at weight 800 and the massive tracking, measured
 * in the browser at both ends of Archivo's width axis and trimmed so the ink,
 * not the side bearings, meets the content edges.
 */
const TITLE_FIT = {
  "--fit-compressed": 3.31,
  "--fit-extended": 6.5,
};

/** Scroll distance of the pinned desktop sequence, relative to the viewport. */
const PIN_DISTANCE = "+=130%";

const formatIndex = (index: number) => String(index).padStart(2, "0");

const intro = eras[0];
const lastIndex = formatIndex(eras.length - 1);

/**
 * Chapter 00. Starts as a title, a time axis and a dormant signal. Scrolling
 * initializes the system: the grid and header resolve, the title docks into
 * the header, and the signal leaves the axis at 1940 toward the first era.
 */
export function Intro() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const section = root.current;
        if (!section || !conditions || conditions.reduced) return;

        gsap.set("[data-reveal]", { visibility: "visible" });

        // Positions and durations below are fractions of the scroll range.
        const timeline = gsap.timeline({
          defaults: { ease: EASE.expressive },
          scrollTrigger: conditions.desktop
            ? {
                trigger: section,
                start: "top top",
                end: PIN_DISTANCE,
                pin: true,
                scrub: 0.5,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              }
            : {
                trigger: section,
                start: "top top",
                end: `bottom ${COMPACT_SIGNAL_LINE}`,
                scrub: true,
              },
        });

        timeline
          .to("[data-intro='hint']", { autoAlpha: 0, duration: 0.08 }, 0)
          .from(
            "[data-reveal='grid']",
            { scaleY: 0, transformOrigin: "50% 0%", duration: 0.3 },
            0,
          )
          .from(
            "[data-reveal='line']",
            { scaleX: 0, transformOrigin: "0% 50%", duration: 0.3 },
            0.05,
          )
          .from(
            "[data-reveal='meta']",
            { opacity: 0, duration: 0.1, stagger: 0.04 },
            0.2,
          )
          .fromTo(
            "[data-intro='drop']",
            { "--signal-progress": 0 },
            { "--signal-progress": 1, ease: EASE.linear, duration: 0.6 },
            0.4,
          );

        if (conditions.desktop) {
          const title = section.querySelector<HTMLElement>(
            "[data-intro='title']",
          );
          const dock = section.querySelector<HTMLElement>(
            "[data-intro='dock']",
          );
          if (!title || !dock) return;

          // The title shrinks into the header and becomes the wordmark.
          timeline.to(
            title,
            {
              x: () =>
                offsetWithin(dock, section).x - offsetWithin(title, section).x,
              y: () =>
                offsetWithin(dock, section).y - offsetWithin(title, section).y,
              scale: () => dock.offsetHeight / title.offsetHeight,
              transformOrigin: "0% 0%",
              duration: 0.5,
            },
            0.25,
          );
        }
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative grid min-h-svh grid-cols-1 grid-rows-[auto_1fr_auto] overflow-clip"
    >
      <TechnicalGrid data-reveal="grid" />

      <div className="relative row-start-3 pt-block">
        <div className="px-gutter pb-block">
          <TechnicalLabel
            as="p"
            data-intro="hint"
            tone="foreground"
            className="motion-reduce:hidden"
          >
            Scroll to initialize
          </TechnicalLabel>
        </div>

        <div className="chronos-grid pb-meta">
          <TechnicalLabel className="col-span-3 lg:col-span-9">
            1940
          </TechnicalLabel>
          <TechnicalLabel className="col-start-4 lg:col-start-10">
            2026
          </TechnicalLabel>
        </div>

        <div className="relative">
          <div className="chronos-grid">
            <SignalLine
              progress={0}
              head={false}
              className="col-start-1 col-end-4 -mx-rail lg:col-end-10"
            />
          </div>
          <SignalLine
            data-intro="drop"
            data-signal-pending
            orientation="vertical"
            track={false}
            relay
            className="absolute top-1 bottom-0 left-frame -translate-x-1/2"
          />

          <div className="px-gutter pt-meta">
            <div className="@container">
              <h1
                data-intro="title"
                className="-ml-[0.04em] text-fit text-massive whitespace-nowrap uppercase [--fit:var(--fit-compressed)] font-stretch-[62%] lg:[--fit:var(--fit-extended)] lg:font-stretch-[125%]"
                style={TITLE_FIT}
              >
                Chronos
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="relative row-start-1 px-gutter pt-gutter">
        <div className="flex items-end justify-between pb-meta">
          <span aria-hidden data-intro="dock" className="block h-4" />
          <div className="flex gap-block">
            <TechnicalLabel data-reveal="meta">
              <span className="text-accent">{formatIndex(intro.index)}</span> /{" "}
              {lastIndex}
            </TechnicalLabel>
            <TechnicalLabel data-reveal="meta" className="max-lg:hidden">
              {intro.title}
            </TechnicalLabel>
          </div>
        </div>
        <StructuralLine data-reveal="line" tone="strong" className="-mx-rail" />
      </div>

      <div className="chronos-grid relative row-start-2 content-start pt-block">
        <p className="col-span-full text-display font-medium font-stretch-[62%] text-balance uppercase lg:col-start-4 xl:col-start-7">
          An interactive history of computing
        </p>
      </div>
    </section>
  );
}
