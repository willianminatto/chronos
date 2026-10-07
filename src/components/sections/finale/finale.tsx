"use client";

import { useRef } from "react";
import { SignalLine } from "@/components/visual/signal-line";
import { TechnicalGrid } from "@/components/visual/technical-grid";
import { TechnicalLabel } from "@/components/visual/technical-label";
import { eras } from "@/data/eras";
import { DURATION, EASE, STAGGER } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { MOTION_CONDITIONS } from "@/lib/motion/media-queries";

/**
 * Width in em of the widest line of the question, at the compressed width
 * and with the extra word spacing: "WHAT COMES" on compact screens, the
 * whole question on desktop.
 */
const TITLE_FIT = {
  "--fit-compact": 4.64,
  "--fit-desktop": 6.99,
};

/**
 * Same construction as the Intro's axis: the track ends at three quarters of
 * the grid, so two thirds of it puts the head, the present, on the center
 * line, where the signal arrives.
 */
const PRESENT = 2 / 3;

/** Provisional editorial bounds, the same ones the Intro opens with. */
const AXIS = { start: "1940", present: "2026", next: "?" };

const formatIndex = (index: number) => String(index).padStart(2, "0");

const finale = eras[8];

const restart = () => window.scrollTo({ top: 0, behavior: "instant" });

/**
 * Chapter 08 mirrors the Intro: a question on the bottom edge and a time
 * axis above it. The Intro's axis was entirely unresolved, with the signal
 * waiting at its origin. Here it is resolved up to the present, where the
 * signal that crossed every chapter lands, and dashed from there on.
 * No pin: the page ends at rest.
 */
export function Finale() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_CONDITIONS, ({ conditions }) => {
        const section = root.current;
        if (!section || !conditions || conditions.reduced) return;

        gsap.set("[data-reveal]", { visibility: "visible" });

        // The signal lands on the axis as the section settles.
        gsap.fromTo(
          "[data-finale='arrival']",
          { "--signal-progress": 0 },
          {
            "--signal-progress": 1,
            ease: EASE.linear,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );

        gsap
          .timeline({
            defaults: { ease: EASE.primary, duration: DURATION.reveal },
            scrollTrigger: {
              trigger: section,
              start: "top 45%",
              toggleActions: "play none none reverse",
            },
          })
          .fromTo(
            "[data-finale='axis']",
            { "--signal-progress": 0 },
            { "--signal-progress": PRESENT, ease: EASE.expressive },
            0,
          )
          .from("[data-reveal='title']", { yPercent: 100 }, 0.2)
          .from(
            "[data-reveal='meta']",
            { opacity: 0, duration: DURATION.short, stagger: STAGGER.small },
            0.5,
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="finale-title"
      className="relative grid min-h-svh grid-cols-1 grid-rows-[1fr_auto] overflow-clip"
    >
      <TechnicalGrid />

      <div className="relative px-gutter pt-gutter">
        <SignalLine
          data-finale="arrival"
          data-signal-pending
          orientation="vertical"
          track={false}
          relay
          className="absolute top-0 -bottom-1 left-1/2 -translate-x-1/2"
        />
        <div className="flex items-baseline justify-between">
          <TechnicalLabel data-reveal="meta">
            <span className="text-accent">{formatIndex(finale.index)}</span> /{" "}
            {formatIndex(eras.length - 1)}
          </TechnicalLabel>
          <button
            type="button"
            data-reveal="meta"
            onClick={restart}
            className="cursor-pointer font-mono text-technical text-foreground uppercase underline decoration-line-strong underline-offset-4 hover:decoration-foreground"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="chronos-grid">
          <SignalLine
            data-finale="axis"
            progress={PRESENT}
            className="col-start-1 col-end-4 -mx-rail lg:col-end-10"
          />
        </div>
        <div className="chronos-grid pt-meta">
          <TechnicalLabel data-reveal="meta" className="col-span-2 lg:col-span-6">
            {AXIS.start}
          </TechnicalLabel>
          <TechnicalLabel
            data-reveal="meta"
            tone="foreground"
            className="lg:col-span-3"
          >
            {AXIS.present}
          </TechnicalLabel>
          <TechnicalLabel data-reveal="meta" className="col-start-4 lg:col-start-10">
            {AXIS.next}
          </TechnicalLabel>
        </div>

        <div className="px-gutter pt-block">
          <div className="@container overflow-y-clip">
            <h2
              id="finale-title"
              data-reveal="title"
              className="-ml-[0.03em] text-fit text-massive [word-spacing:0.12em] whitespace-nowrap uppercase [--fit:var(--fit-compact)] font-stretch-[62%] lg:[--fit:var(--fit-desktop)]"
              style={TITLE_FIT}
            >
              What comes <br className="lg:hidden" />
              next?
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
